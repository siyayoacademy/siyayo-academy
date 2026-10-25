// LAB ONLY: no HTTP route, no production verifier/target, no evaluator.
// Reuses 85C storage unchanged; all resolver dependencies must be server-owned.
import {createBindingDryRun} from '../h14-44/server-binding-dry-run.mjs';
import {readOccurrence85C,writeOccurrence85C} from '../storage-contract/storage-contract.mjs';
const fail=reason=>Object.freeze({ok:false,reason});
const uuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(v);
const token=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(v);
const valid=r=>r&&typeof r==='object'&&!Array.isArray(r)&&Object.keys(r).sort().join(',')==='actionReference,eventId,intent,sessionHandle,targetId'&&uuid(r.eventId)&&token(r.targetId)&&token(r.actionReference)&&['start','resume','transfer'].includes(r.intent)&&typeof r.sessionHandle==='string'&&r.sessionHandle.length>0&&r.sessionHandle.length<=256;
const identityOK=(i,n)=>i?.ok===true&&typeof i.principal?.subject==='string'&&/^[A-Za-z0-9_.-]{1,128}$/.test(i.principal.subject)&&typeof i.principal.sessionId==='string'&&/^[A-Za-z0-9_.-]{1,128}$/.test(i.principal.sessionId)&&Number.isSafeInteger(n)&&Number.isSafeInteger(i.principal.expiresAt)&&i.principal.expiresAt>n;
const receipt=(eventId,value)=>Object.freeze({ok:true,receipt:value,eventId,status:'pending',evaluationAllowed:false,evidenceAllowed:false});
export function createPersistedReplayLab({enabled=false,db,...services}={}){
 const preparer=createBindingDryRun(services);
 async function lookup(identity,request){
  // Owner comes exclusively from verified principal, never a request or NICK.
  const row=await db.prepare('SELECT * FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?').bind(identity.principal.subject,request.eventId).first();
  if(!row)return null;
  const policy={subject:identity.principal.subject,skillId:row.skill_id,language:row.language,originExperienceId:row.origin_experience_id,contractVersion:row.contract_version,questionWord:row.question_word,purpose:row.purpose};
  const read=await readOccurrence85C({identity,policy,eventId:request.eventId,db});
  if(!read.ok)return fail(read.reason);
  const e=read.event;
  if(e?.bindingVersion!=='h14.41.v0.1')return fail('legacy_unbound');
  if(policy.skillId!=='why.use.contextual-reason'||policy.questionWord!=='WHY'||policy.purpose!=='assessment'||read.status!=='pending'||e.questionWord!==policy.questionWord||e.language!==policy.language||e.originExperienceId!==policy.originExperienceId||e.currentExperienceId!==read.experienceId||e.contractVersion!==policy.contractVersion||!token(e.contractId)||!token(e.assessmentTargetId)||!token(e.actionReference)||!token(e.exposureReference)||!['exposed','not_exposed'].includes(e.modelExposure)||!['question-function','reason-answer(local)','reason-answer(transfer)'].includes(e.dimension)||!['start','resume','transfer'].includes(e.intent))return fail('invalid_persisted_binding');
  const transfer=e.dimension==='reason-answer(transfer)';
  if(transfer!==(e.intent==='transfer')||transfer===(e.originExperienceId===e.currentExperienceId))return fail('invalid_persisted_binding');
  if(e.assessmentTargetId!==request.targetId||e.actionReference!==request.actionReference||e.intent!==request.intent)return fail('occurrence_conflict');
  // Receipt of a prior write ONLY. Does not re-authorize target or evaluation.
  return receipt(request.eventId,'duplicate');
 }
 return Object.freeze({async submit(request){
  if(enabled!==true)return fail('adapter_disabled');
  if(!valid(request))return fail('invalid_request');
  if(!db||typeof db.prepare!=='function')return fail('storage_unavailable');
  try{
   const identity=structuredClone(await services.resolveIdentity(request.sessionHandle));
   if(!identityOK(identity,services.now()))return fail('unauthenticated');
   const prior=await lookup(identity,request);
   if(prior)return prior;
   const first=await preparer.prepare(request);
   if(!first.ok)return first;
   if(first.policy.subject!==identity.principal.subject)return fail('principal_changed');
   // Re-resolve target/action/scope immediately before writing; compare immutable envelope.
   const second=await preparer.prepare(request);
   if(!second.ok)return second;
   if(JSON.stringify(first)!==JSON.stringify(second))return fail('binding_changed_before_write');
   const finalIdentity=structuredClone(await services.resolveIdentity(request.sessionHandle));
   if(!identityOK(finalIdentity,services.now())||finalIdentity.principal.subject!==identity.principal.subject)return fail('unauthenticated');
   const concurrent=await lookup(finalIdentity,request);
   if(concurrent)return concurrent;
   const result=await writeOccurrence85C({identity:finalIdentity,policy:second.policy,submission:second.submission,db});
   return result.ok?receipt(request.eventId,result.receipt):result;
  }catch{return fail('server_or_storage_failure');}
 }});
}
