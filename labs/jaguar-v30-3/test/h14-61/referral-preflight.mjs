// JAGUAR H14.61 — isolated server-side REFERRAL PREFLIGHT (not admission).
// Browser H14.60 proposals are untrusted hints; the ONLY trust roots are
// separately injected server-side lab adapters and H14.54 proof verification.
// No write, Session, Attempt, Evidence, Green Pass, or RPC/HTTP endpoint.
const LANGS=new Set(['en','es','pt']);
const token=x=>typeof x==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(x);
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(x);
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
const fail=(reason)=>Object.freeze({ok:false,reason,canStartSession:false,canSubmitAttempt:false,canIssueEvidence:false,canGrantGreenPass:false});
function validProposal(p){
 if(!p||!exact(p,['experienceId','questionWord','language','skill','definitionPath',
   'proposedOriginExperienceId','proposalKind','authorized','serverVerified','actionVerified',
   'maySubmitAttempt','mayStartSession','mayIssueEvidence','mayGrantGreenPass','automaticForward']))return false;
 if(!token(p.experienceId)||!token(p.questionWord)||!LANGS.has(p.language)||
    !token(p.skill)||!token(p.definitionPath)||!token(p.proposedOriginExperienceId))return false;
 if(!['START_PROPOSAL_UNVERIFIED','RESUME_PROPOSAL_UNVERIFIED'].includes(p.proposalKind))return false;
 if(!['authorized','serverVerified','actionVerified','maySubmitAttempt','mayStartSession',
   'mayIssueEvidence','mayGrantGreenPass','automaticForward'].every(k=>p[k]===false))return false;
 if(p.proposalKind==='START_PROPOSAL_UNVERIFIED'&&p.proposedOriginExperienceId!==p.experienceId)return false;
 return true;
}
export function createLabReferralPreflight({verifyAssertion,resolveSession,resolveAction,
 resolveCanonicalTarget,resolveContract,resolveOrigin,now}={}){
 if(![verifyAssertion,resolveSession,resolveAction,resolveCanonicalTarget,resolveContract,resolveOrigin,now]
    .every(x=>typeof x==='function'))throw new TypeError('H14.61 requires trusted lab adapters');
 return Object.freeze({async inspect(input){
   // Untrusted hint cannot specify principal, target version, route, score,
   // issuer or proof-verifier configuration.
   if(!exact(input,['proposal','proof','actionKey','eventId','intent'])||
     !validProposal(input.proposal)||typeof input.proof!=='string'||
     !token(input.actionKey)||!uuid(input.eventId)||
     !['start','resume'].includes(input.intent))return fail('invalid_request');
   const p=input.proposal;
   if((p.proposalKind==='START_PROPOSAL_UNVERIFIED'?'start':'resume')!==input.intent)
     return fail('proposal_intent_mismatch');
   let moment;
   try{moment=now();}catch{return fail('lab_adapter_error');}
   if(!Number.isSafeInteger(moment))return fail('invalid_clock');
   // No client-controlled verification key, issuer or audience can be supplied.
   let verified;
   try{verified=await verifyAssertion(input.proof,moment);}catch{return fail('untrusted_assertion');}
   if(verified?.ok!==true)return fail('untrusted_assertion');
   const claims=verified.claims;
   if(!claims||claims.actionKey!==input.actionKey||claims.eventId!==input.eventId||
       claims.intent!==input.intent||!token(claims.subject)||!token(claims.sessionHandle)||
       !token(claims.sessionId))return fail('proof_action_mismatch');
   try{
     const session=await resolveSession(claims.sessionHandle);
     if(!session||session.subject!==claims.subject||session.sessionId!==claims.sessionId||
       session.revoked!==false||!Number.isSafeInteger(session.expiresAt)||session.expiresAt<=moment)
       return fail('session_not_verified');
     const a=await resolveAction(input.actionKey);
     if(!a||a.source!=='DIRECT_LEARNER_ACTION'||a.subject!==claims.subject||
        a.sessionId!==claims.sessionId||a.eventId!==input.eventId||
        a.actionKey!==input.actionKey||a.intent!==input.intent||a.consumed!==false||
        !Number.isSafeInteger(a.recordedAt)||a.recordedAt>moment||a.recordedAt<moment-300)
       return fail('action_not_verified');
     const keys=['experienceId','questionWord','language','skill','originExperienceId'];
     const values=[p.experienceId,p.questionWord,p.language,p.skill,p.proposedOriginExperienceId];
     if(keys.some((k,i)=>a[k]!==values[i]))return fail('context_not_bound_to_action');
     const canonical=await resolveCanonicalTarget({
       experienceId:a.experienceId,questionWord:a.questionWord,language:a.language
     });
     if(!canonical||canonical.skill!==a.skill||
       canonical.definitionPath!==p.definitionPath||
       canonical.mode!==input.intent||
       canonical.originExperienceId!==a.originExperienceId)
       return fail('canonical_target_mismatch');
     // This is the only source of pedagogical authorization in the LAB.
     // The returned review never conveys permission to execute the contract.
     const c=await resolveContract({
       subject:claims.subject,skill:a.skill,questionWord:a.questionWord,
       language:a.language,originExperienceId:a.originExperienceId,
       currentExperienceId:a.experienceId,intent:a.intent
     });
     if(!c||c.authorized!==true||c.revoked!==false||c.subject!==claims.subject||
        c.skill!==a.skill||c.language!==a.language||
        c.originExperienceId!==a.originExperienceId||
        c.currentExperienceId!==a.experienceId||c.intent!==a.intent||
        c.definitionPath!==canonical.definitionPath||
        !token(c.contractId)||!token(c.contractVersion)||
        !Number.isSafeInteger(c.revision)||c.revision<1||
        !Number.isSafeInteger(c.expiresAt)||c.expiresAt<=moment)
       return fail('contract_not_authorized');
     if(input.intent==='resume'){
       const o=await resolveOrigin({
         subject:claims.subject,skill:a.skill,language:a.language,
         originExperienceId:a.originExperienceId,currentExperienceId:a.experienceId
       });
       if(!o||o.valid!==true||o.subject!==claims.subject||
          o.skill!==a.skill||o.language!==a.language||
          o.originExperienceId!==a.originExperienceId||
          o.destinationExperienceId!==a.experienceId||
          o.contractId!==c.contractId||o.revision!==c.revision)
         return fail('origin_not_authorized');
     }
     return Object.freeze({
       ok:true,status:'LAB_PREFLIGHT_REVIEWABLE_NOT_EXECUTABLE',
       subject:claims.subject,skill:a.skill,language:a.language,
       originExperienceId:a.originExperienceId,currentExperienceId:a.experienceId,
       contractId:c.contractId,contractVersion:c.contractVersion,revision:c.revision,
       eventId:input.eventId,
       verifiedUsing:'SYNTHETIC_LAB_AUTHORITIES_ONLY',
       canStartSession:false,canSubmitAttempt:false,canIssueEvidence:false,canGrantGreenPass:false
     });
   }catch{return fail('lab_adapter_error');}
 }});
}
