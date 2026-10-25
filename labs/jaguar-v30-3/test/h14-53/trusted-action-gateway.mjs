// H14.53 isolated trust/provenance gate, NOT an authenticator.
// The session handle is injected from a trusted LOCAL WORKER TEST binding.
// Requests NEVER supply subject, sessionHandle, target, actionReference, revision, or exposure.
import {createHash} from 'node:crypto';
const failed=reason=>({ok:false,reason});
const isToken=x=>typeof x==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(x);
const isUuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(x);
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===[...keys].sort().join(',');
export const bindingDigest=json=>createHash('sha256').update(json).digest('hex');

export function createSyntheticTrustedActionGateway({db,sessionHandle,resolveIdentity,submitBound,now}={}){
 if(typeof db?.prepare!=='function'||typeof resolveIdentity!=='function'||typeof submitBound!=='function'||typeof now!=='function')
  throw TypeError('trusted_lab_dependencies_required');
 return Object.freeze({async submit(input){
  // Reject injection of the previously browser-controlled identity and authorization fields.
  if(!exact(input,['actionKey','eventId','intent'])||!isToken(input.actionKey)||!isUuid(input.eventId)||!['start','resume','transfer'].includes(input.intent))
   return failed('invalid_request');
  if(!isToken(sessionHandle))return failed('trusted_session_unavailable');
  try{
   const moment=now();
   if(!Number.isSafeInteger(moment))return failed('invalid_clock');
   const identity=await resolveIdentity(sessionHandle);
   const principal=identity?.principal;
   if(identity?.ok!==true||!isToken(principal?.subject)||!isToken(principal?.sessionId)||!Number.isSafeInteger(principal.expiresAt)||principal.expiresAt<=moment)
    return failed('unauthenticated');
   // Attestation is minted by a synthetic SERVER test fixture, not by submit(input).
   const p=await db.prepare('SELECT * FROM mock_h1453_action_provenance WHERE action_key=?').bind(input.actionKey).first();
   if(!p||p.subject!==principal.subject||p.session_handle!==sessionHandle)
    return failed('unverified_action_provenance');
   if(p.source!=='DIRECT_LEARNER_ACTION'||p.intent!==input.intent||!isToken(p.target_id)||!isToken(p.action_reference)||
      !isToken(p.exposure_reference)||!['exposed','not_exposed'].includes(p.model_exposure)||
      !Number.isSafeInteger(p.authorization_revision)||p.authorization_revision<1||
      !Number.isSafeInteger(p.recorded_at)||p.recorded_at>moment||p.recorded_at<moment-3600||
      typeof p.binding_sha256!=='string'||!/^[0-9a-f]{64}$/.test(p.binding_sha256))
    return failed('unverified_action_provenance');
   const a=await db.prepare('SELECT * FROM mock_actions WHERE subject=? AND reference=? AND target_id=?')
      .bind(principal.subject,p.action_reference,p.target_id).first();
   if(!a||a.direct!==1||a.exposure!==p.model_exposure||a.exposure_reference!==p.exposure_reference)
    return failed('action_provenance_changed');
   const t=await db.prepare('SELECT * FROM mock_targets WHERE id=? AND subject=?').bind(p.target_id,principal.subject).first();
   if(!t||typeof t.binding_json!=='string'||bindingDigest(t.binding_json)!==p.binding_sha256)
    return failed('target_provenance_changed');
   // No client-authoritative fields pass this boundary. The unchanged H14.50
   // candidate still performs its own prepare, replay and database batch guards.
   return await submitBound({
    sessionHandle, eventId:input.eventId, targetId:p.target_id,
    actionReference:p.action_reference, intent:p.intent, expectedRevision:p.authorization_revision
   });
  }catch{return failed('trusted_provenance_resolution_failed');}
 }});
}
