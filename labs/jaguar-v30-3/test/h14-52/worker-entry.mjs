// LOCAL TEST WORKER ONLY. No deploy config and no HTTP submission route.
// All mock_* data is synthetic. RPC access requires an explicit local binding.
import {WorkerEntrypoint} from 'cloudflare:workers';
import {createHash} from 'node:crypto';
import {createGuardedBatchCandidate} from '../h14-50/guarded-batch-candidate.mjs';
import {readOccurrence85C} from '../storage-contract/storage-contract.mjs';

function services(db){
 return {
  now:()=>Math.floor(Date.now()/1000),
  async resolveIdentity(handle){
   const row=await db.prepare('SELECT * FROM mock_sessions WHERE handle=?').bind(handle).first();
   if(!row||row.revoked!==0||row.expires<=Math.floor(Date.now()/1000))return {ok:false};
   return {ok:true,principal:{subject:row.subject,sessionId:'MOCK_SERVER_SESSION',expiresAt:row.expires}};
  },
  async resolveTarget({subject,targetId}){
   const row=await db.prepare('SELECT * FROM mock_targets WHERE id=? AND subject=?').bind(targetId,subject).first();
   if(!row)return null;
   return {...JSON.parse(row.binding_json),id:row.id,subject:row.subject,status:row.authorized===1?'AUTHORIZED':'DRAFT_NOT_AUTHORIZED',revoked:row.revoked!==0,expiresAt:row.expires,allowedIntents:['start','resume','transfer']};
  },
  async resolveAction({subject,actionReference,targetId}){
   const row=await db.prepare('SELECT * FROM mock_actions WHERE subject=? AND reference=? AND target_id=?').bind(subject,actionReference,targetId).first();
   const target=await db.prepare('SELECT binding_json FROM mock_targets WHERE id=? AND subject=?').bind(targetId,subject).first();
   if(!row||!target)return null;
   const b=JSON.parse(target.binding_json);
   return {reference:row.reference,subject:row.subject,targetId:row.target_id,source:row.direct===1?'DIRECT_LEARNER_ACTION':'PATITA_OBSERVATION',verified:row.direct===1,exposureReference:row.exposure_reference,modelExposure:row.exposure,sourceOccurrenceId:row.reference,language:b.language,originExperienceId:b.originExperienceId,currentExperienceId:b.currentExperienceId,dimension:b.dimension};
  },
  async resolveScope(key){
   const scope=JSON.stringify([key.subject,key.skillId,key.language,key.originExperienceId,key.contractId,key.contractVersion,key.questionWord]);
   const row=await db.prepare('SELECT 1 AS found FROM mock_scope_reservations WHERE scope_key=?').bind(scope).first();
   return {...key,exists:Boolean(row)};
  }
 };
}
export default class LocalLab extends WorkerEntrypoint{
 async fetch(){return new Response('lab route disabled',{status:404});}
 async submit(input){
  if(this.env.LAB_RPC_ENABLED!==true)return {ok:false,reason:'lab_rpc_disabled'};
  const raw=this.env.DB;
  // Fault injection is controlled ONLY by local test bindings, never by input.
  const db={prepare:sql=>raw.prepare(sql),batch:async statements=>{
   if(this.env.LAB_REVOKE_BEFORE_BATCH===true)await raw.prepare('UPDATE mock_targets SET revoked=1').run();
   if(this.env.LAB_INJECT_BATCH_ERROR===true)statements.splice(4,0,raw.prepare('INSERT INTO mock_h1450_assertion(id,ok) VALUES(2,0)'));
   const results=await raw.batch(statements);
   if(this.env.LAB_LOSE_RESPONSE===true)throw Error('synthetic lost batch response');
   return results;
  }};
  const result=await createGuardedBatchCandidate({enabled:true,db,...services(raw)}).submit(input);
  return {...result,execution:'WORKER_LOCAL_RPC',cryptoProof:createHash('sha256').update('H14.52-WORKER').digest('hex')};
 }
 async readForTest(eventId,sessionHandle){
  if(this.env.LAB_RPC_ENABLED!==true)return {ok:false,reason:'lab_rpc_disabled'};
  const db=this.env.DB,identity=await services(db).resolveIdentity(sessionHandle);
  if(!identity.ok)return {ok:false,reason:'unauthenticated'};
  const row=await db.prepare('SELECT * FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?').bind(identity.principal.subject,eventId).first();
  if(!row)return {ok:false,reason:'not_found'};
  const policy={subject:identity.principal.subject,skillId:row.skill_id,language:row.language,originExperienceId:row.origin_experience_id,contractVersion:row.contract_version,questionWord:row.question_word,purpose:row.purpose};
  return readOccurrence85C({identity,policy,eventId,db});
 }
}
