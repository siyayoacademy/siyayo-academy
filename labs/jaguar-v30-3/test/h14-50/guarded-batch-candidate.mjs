// H14.50 LAB CANDIDATE ONLY. D1-shaped API, tested with local SQLite driver.
// No endpoint, real verifier, product schema, or remote database binding.
import {createHash} from 'node:crypto';
import {createBindingDryRun} from '../h14-44/server-binding-dry-run.mjs';
import {readOccurrence85C} from '../storage-contract/storage-contract.mjs';
const columns='learner_subject,event_id,skill_id,language,origin_experience_id,current_experience_id,question_word,purpose,status,contract_version,source_occurrence_id,payload_sha256,payload_json';
const failed=reason=>({ok:false,reason});
const receipt=(id,value)=>({ok:true,eventId:id,receipt:value,status:'pending',evaluationAllowed:false,evidenceAllowed:false});
const canonical=v=>JSON.stringify(v,Object.keys(v).sort()); // Flat server-built H14.41 event only.
export function createGuardedBatchCandidate({enabled=false,db,...services}={}){
 const preparer=createBindingDryRun(services);
 return Object.freeze({async submit(input){
  if(enabled!==true)return failed('adapter_disabled');
  if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).sort().join(',')!=='actionReference,eventId,expectedRevision,intent,sessionHandle,targetId'||!Number.isSafeInteger(input.expectedRevision)||input.expectedRevision<1)return failed('invalid_request');
  const {expectedRevision,...request}=input;
  if(typeof request.sessionHandle!=='string'||!request.sessionHandle||request.sessionHandle.length>256||!['start','resume','transfer'].includes(request.intent)||!['actionReference','targetId'].every(k=>typeof request[k]==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(request[k]))||typeof request.eventId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(request.eventId))return failed('invalid_request');
  if(typeof db?.batch!=='function'||typeof db.prepare!=='function')return failed('batch_storage_unavailable');
  try{
   const identity=structuredClone(await services.resolveIdentity(request.sessionHandle));
   const principal=identity?.principal,now=services.now();
   if(identity?.ok!==true||!principal||!['subject','sessionId'].every(k=>typeof principal[k]==='string'&&/^[A-Za-z0-9_.-]{1,128}$/.test(principal[k]))||!Number.isSafeInteger(now)||!Number.isSafeInteger(principal.expiresAt)||principal.expiresAt<=now)return failed('unauthenticated');
   const key=[principal.subject,request.eventId];
   const prior=await db.prepare(`SELECT ${columns} FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?`).bind(...key).first();
   if(prior){
    const policy={subject:principal.subject,skillId:prior.skill_id,language:prior.language,originExperienceId:prior.origin_experience_id,contractVersion:prior.contract_version,questionWord:prior.question_word,purpose:prior.purpose};
    const read=await readOccurrence85C({identity,policy,eventId:request.eventId,db});
    if(!read.ok)return read;
    const e=read.event;
    if(e?.bindingVersion!=='h14.41.v0.1')return failed('legacy_unbound');
    if(policy.skillId!=='why.use.contextual-reason'||policy.questionWord!=='WHY'||policy.purpose!=='assessment'||['language','originExperienceId','contractVersion','questionWord'].some(k=>e[k]!==policy[k])||e.currentExperienceId!==read.experienceId)return failed('invalid_persisted_binding');
    if(e.assessmentTargetId!==request.targetId||e.actionReference!==request.actionReference||e.intent!==request.intent)return failed('occurrence_conflict');
    return receipt(request.eventId,'duplicate'); // Historical receipt, never reauthorization.
   }
   const prepared=await preparer.prepare(request);
   if(!prepared.ok)return prepared;
   if(prepared.policy.subject!==principal.subject)return failed('principal_changed');
   const p=prepared.policy,s=prepared.submission;
   const event={...s.event,authorizationRevision:expectedRevision};
   const payload=canonical(event),digest=createHash('sha256').update(payload).digest('hex');
   if(payload.length>4096)return failed('invalid_submission');
   const scope=JSON.stringify([p.subject,p.skillId,p.language,p.originExperienceId,event.contractId,p.contractVersion,p.questionWord]);
   const absent='NOT EXISTS(SELECT 1 FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?)';
   const boundFields=['skillId','questionWord','language','dimension','contractId','contractVersion','originExperienceId','currentExperienceId'];
   const fieldValues=boundFields.map(k=>k==='skillId'?p.skillId:event[k]);
   // CASE expression always inserts into a CHECK(ok=1) assertion row. A failed
   // predicate is a real SQL error, not an UPDATE/SELECT that merely changes zero rows.
   const guard=`INSERT INTO mock_h1450_assertion(id,ok) VALUES (1,CASE WHEN EXISTS(SELECT 1 FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?) THEN
    EXISTS(SELECT 1 FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=? AND payload_json=? AND payload_sha256=? AND status='pending' AND purpose='assessment' AND skill_id=? AND language=? AND origin_experience_id=? AND current_experience_id=? AND question_word=? AND contract_version=? AND source_occurrence_id=?)
    ELSE (EXISTS(SELECT 1 FROM mock_h1448_gate WHERE id=1 AND enabled=1)
     AND EXISTS(SELECT 1 FROM mock_sessions WHERE handle=? AND subject=? AND revoked=0 AND expires>unixepoch())
     AND EXISTS(SELECT 1 FROM mock_targets WHERE id=? AND subject=? AND authorized=1 AND revoked=0 AND expires>unixepoch() AND revision=? AND ${boundFields.map(k=>`json_extract(binding_json,'$.${k}')=?`).join(' AND ')})
     AND EXISTS(SELECT 1 FROM mock_actions WHERE subject=? AND reference=? AND target_id=? AND direct=1 AND exposure=? AND exposure_reference=?)
     AND CASE WHEN ?='start' THEN NOT EXISTS(SELECT 1 FROM mock_scope_reservations WHERE scope_key=?) ELSE EXISTS(SELECT 1 FROM mock_scope_reservations WHERE scope_key=?) END
     AND NOT EXISTS(SELECT 1 FROM mock_action_consumption WHERE subject=? AND action_reference=?)) END)`;
   const args=[...key,...key,payload,digest,p.skillId,p.language,p.originExperienceId,s.currentExperienceId,p.questionWord,p.contractVersion,s.sourceOccurrenceId,
    request.sessionHandle,p.subject,request.targetId,p.subject,expectedRevision,...fieldValues,p.subject,request.actionReference,request.targetId,event.modelExposure,event.exposureReference,request.intent,scope,scope,p.subject,request.actionReference];
   const values=[p.subject,request.eventId,p.skillId,p.language,p.originExperienceId,s.currentExperienceId,p.questionWord,'assessment','pending',p.contractVersion,s.sourceOccurrenceId,digest,payload];
   const statements=[
    db.prepare(guard).bind(...args),
    db.prepare(`INSERT INTO mock_scope_reservations(scope_key,created_by_event) SELECT ?,? WHERE ?='start' AND ${absent}`).bind(scope,request.eventId,request.intent,...key),
    db.prepare(`INSERT INTO mock_action_consumption(subject,action_reference,event_id) SELECT ?,?,? WHERE ${absent}`).bind(p.subject,request.actionReference,request.eventId,...key),
    db.prepare(`INSERT INTO v30_85c_occurrences (${columns}) SELECT ${values.map(()=>'?').join(',')} WHERE ${absent}`).bind(...values,...key),
    db.prepare('DELETE FROM mock_h1450_assertion WHERE id=1'),
    db.prepare(`SELECT ${columns} FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?`).bind(...key)
   ];
   const results=await db.batch(statements);
   const row=results?.[5]?.results?.[0];
   if(results?.length!==6||results.some(r=>r.success!==true)||!row||row.payload_json!==payload||row.payload_sha256!==digest)return failed('batch_receipt_unverified');
   const changes=results[3].meta?.changes;
   if(changes!==0&&changes!==1)return failed('batch_receipt_unverified');
   return receipt(request.eventId,changes===1?'created':'duplicate');
  }catch{return failed('guarded_batch_failed');}
 }});
}
