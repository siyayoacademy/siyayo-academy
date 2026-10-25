// H14.44 LAB ONLY. No routes, DB writes, evaluator, or production auth.
// Dependencies represent TRUSTED SERVER services, never browser-supplied objects.
// Injected resolver behavior is mocked in tests; no real target is authorized here.
const fail=reason=>Object.freeze({ok:false,reason});
const token=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(v);
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v);
const dims=['question-function','reason-answer(local)','reason-answer(transfer)'];
const intents=['start','resume','transfer'];
const langs=['en','es','pt'];
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===[...keys].sort().join(',');
const freeze=v=>{if(v&&typeof v==='object'){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
export function createBindingDryRun({resolveIdentity,resolveTarget,resolveAction,resolveScope,now}={}){
 if([resolveIdentity,resolveTarget,resolveAction,resolveScope,now].some(v=>typeof v!=='function'))throw TypeError('trusted_server_dependencies_required');
 return Object.freeze({async prepare(request){
  if(!exact(request,['sessionHandle','eventId','targetId','actionReference','intent']))return fail('invalid_request');
  if(!uuid(request.eventId)||!token(request.targetId)||!token(request.actionReference)||!intents.includes(request.intent)||typeof request.sessionHandle!=='string'||!request.sessionHandle||request.sessionHandle.length>256)return fail('invalid_request');
  try{
   const moment=now();
   if(!Number.isSafeInteger(moment))return fail('invalid_clock');
   const identity=await resolveIdentity(request.sessionHandle);
   const p=identity?.principal;
   if(identity?.ok!==true||!token(p?.subject)||!token(p?.sessionId)||!Number.isSafeInteger(p.expiresAt)||p.expiresAt<=moment)return fail('unauthenticated');
   const t=await resolveTarget({subject:p.subject,targetId:request.targetId});
   if(!t||t.id!==request.targetId||t.status!=='AUTHORIZED'||t.revoked!==false||!Number.isSafeInteger(t.expiresAt)||t.expiresAt<=moment)return fail('target_not_authorized');
   if(t.subject!==p.subject||t.skillId!=='why.use.contextual-reason'||t.questionWord!=='WHY'||!langs.includes(t.language)||!dims.includes(t.dimension)||![t.contractId,t.contractVersion,t.originExperienceId,t.currentExperienceId].every(token))return fail('invalid_target_binding');
   if(!Array.isArray(t.allowedIntents)||!t.allowedIntents.includes(request.intent))return fail('intent_not_allowed');
   const transfer=t.dimension==='reason-answer(transfer)';
   if(transfer!==(request.intent==='transfer')||transfer===(t.originExperienceId===t.currentExperienceId))return fail('dimension_origin_mismatch');
   const scopeKey={subject:p.subject,skillId:t.skillId,language:t.language,originExperienceId:t.originExperienceId,contractId:t.contractId,contractVersion:t.contractVersion,questionWord:t.questionWord};
   const scope=await resolveScope({...scopeKey});
   if(!scope||typeof scope.exists!=='boolean'||Object.keys(scopeKey).some(k=>scope[k]!==scopeKey[k]))return fail('scope_mismatch');
   if(request.intent==='start'&&scope.exists)return fail('scope_already_exists');
   if(request.intent!=='start'&&!scope.exists)return fail('scope_not_found');
   const a=await resolveAction({subject:p.subject,actionReference:request.actionReference,targetId:t.id});
   if(!a||a.reference!==request.actionReference||a.subject!==p.subject||a.targetId!==t.id||a.source!=='DIRECT_LEARNER_ACTION'||a.verified!==true||!token(a.exposureReference)||!['exposed','not_exposed'].includes(a.modelExposure)||!token(a.sourceOccurrenceId))return fail('unverified_action');
   if(['language','originExperienceId','currentExperienceId','dimension'].some(k=>a[k]!==t[k]))return fail('action_binding_mismatch');
   // Capture exposure provenance, do not assert independence or semantic correctness.
   const event={bindingVersion:'h14.41.v0.1',assessmentTargetId:t.id,contractId:t.contractId,contractVersion:t.contractVersion,questionWord:t.questionWord,language:t.language,originExperienceId:t.originExperienceId,currentExperienceId:t.currentExperienceId,dimension:t.dimension,intent:request.intent,actionReference:a.reference,exposureReference:a.exposureReference,modelExposure:a.modelExposure};
   // Authority/principal remain an input from future server services, never serialized as client claims.
   return freeze({ok:true,status:'PREPARED_ONLY_NOT_STORED',policy:{subject:p.subject,skillId:t.skillId,language:t.language,originExperienceId:t.originExperienceId,contractVersion:t.contractVersion,questionWord:t.questionWord,purpose:'assessment'},submission:{eventId:request.eventId,sourceOccurrenceId:a.sourceOccurrenceId,currentExperienceId:t.currentExperienceId,event},evaluationAllowed:false,evidenceAllowed:false});
  }catch{return fail('server_resolution_failed');}
 }});
}
