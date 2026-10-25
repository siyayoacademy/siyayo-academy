// H14.53 LOCAL WORKER ONLY: synthetic server session, immutable action provenance.
// Not production authentication. No HTTP API, Wrangler deployment or external D1.
import {WorkerEntrypoint} from 'cloudflare:workers';
import {createHash} from 'node:crypto';
import {createGuardedBatchCandidate} from '../h14-50/guarded-batch-candidate.mjs';
import {readOccurrence85C} from '../storage-contract/storage-contract.mjs';
import {createSyntheticTrustedActionGateway} from './trusted-action-gateway.mjs';

function mockServerServices(db){
 return {
  now:()=>Math.floor(Date.now()/1000),
  async resolveIdentity(handle){
   const row=await db.prepare('SELECT * FROM mock_sessions WHERE handle=?').bind(handle).first();
   if(!row||row.revoked!==0||row.expires<=Math.floor(Date.now()/1000))return {ok:false};
   return {ok:true,principal:{subject:row.subject,sessionId:'SYNTHETIC_SERVER_SESSION',expiresAt:row.expires}};
  },
  async resolveTarget({subject,targetId}){
   const r=await db.prepare('SELECT * FROM mock_targets WHERE id=? AND subject=?').bind(targetId,subject).first();
   if(!r)return null;
   return {...JSON.parse(r.binding_json),id:r.id,subject:r.subject,status:r.authorized===1?'AUTHORIZED':'DRAFT_NOT_AUTHORIZED',revoked:r.revoked!==0,expiresAt:r.expires,allowedIntents:['start','resume','transfer']};
  },
  async resolveAction({subject,actionReference,targetId}){
   const a=await db.prepare('SELECT * FROM mock_actions WHERE subject=? AND reference=? AND target_id=?').bind(subject,actionReference,targetId).first();
   const t=await db.prepare('SELECT binding_json FROM mock_targets WHERE id=? AND subject=?').bind(targetId,subject).first();
   if(!a||!t)return null;
   const b=JSON.parse(t.binding_json);
   return {reference:a.reference,subject:a.subject,targetId:a.target_id,source:a.direct===1?'DIRECT_LEARNER_ACTION':'PATITA_OBSERVATION',verified:a.direct===1,exposureReference:a.exposure_reference,modelExposure:a.exposure,sourceOccurrenceId:a.reference,language:b.language,originExperienceId:b.originExperienceId,currentExperienceId:b.currentExperienceId,dimension:b.dimension};
  },
  async resolveScope(k){
   const scope=JSON.stringify([k.subject,k.skillId,k.language,k.originExperienceId,k.contractId,k.contractVersion,k.questionWord]);
   const r=await db.prepare('SELECT 1 AS found FROM mock_scope_reservations WHERE scope_key=?').bind(scope).first();
   return {...k,exists:!!r};
  }
 };
}
export default class LocalTrustedProvenanceLab extends WorkerEntrypoint{
 async fetch(){return new Response('lab route disabled',{status:404});}
 async submitAction(input){
  if(this.env.LAB_RPC_ENABLED!==true||this.env.LAB_H1453_TRUST_ENABLED!==true)
   return {ok:false,reason:'lab_rpc_disabled'};
  const raw=this.env.DB,svc=mockServerServices(raw);
  const storage={
   prepare:sql=>raw.prepare(sql),
   batch:async statements=>{
    // All injections are controlled by test-only Worker env, not caller input.
    if(this.env.LAB_REVOKE_BEFORE_BATCH===true)
     await raw.prepare('UPDATE mock_sessions SET revoked=1 WHERE handle=?').bind(this.env.LAB_H1453_SESSION_HANDLE).run();
    if(this.env.LAB_TAMPER_ACTION_BEFORE_BATCH===true)
     await raw.prepare("UPDATE mock_actions SET exposure_reference='TAMPERED' WHERE subject='mock-a'").run();
    if(this.env.LAB_INJECT_BATCH_ERROR===true)
     statements.splice(4,0,raw.prepare('INSERT INTO mock_h1450_assertion(id,ok) VALUES(2,0)'));
    const rows=await raw.batch(statements);
    if(this.env.LAB_LOSE_RESPONSE===true)throw Error('synthetic lost response');
    return rows;
   }
  };
  const candidate=createGuardedBatchCandidate({enabled:true,db:storage,...svc});
  const gate=createSyntheticTrustedActionGateway({
   db:raw,sessionHandle:this.env.LAB_H1453_SESSION_HANDLE,
   resolveIdentity:svc.resolveIdentity,now:svc.now,
   submitBound:request=>candidate.submit(request)
  });
  const r=await gate.submit(input);
  return {...r,execution:'SYNTHETIC_TRUSTED_WORKER_LOCAL',cryptoProof:createHash('sha256').update('H14.53-TRUST').digest('hex')};
 }
 async readForTest(eventId){
  if(this.env.LAB_RPC_ENABLED!==true||this.env.LAB_H1453_TRUST_ENABLED!==true)return {ok:false,reason:'lab_rpc_disabled'};
  if(typeof eventId!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(eventId))
   return {ok:false,reason:'invalid_request'};
  const raw=this.env.DB,identity=await mockServerServices(raw).resolveIdentity(this.env.LAB_H1453_SESSION_HANDLE);
  if(!identity.ok)return {ok:false,reason:'unauthenticated'};
  const r=await raw.prepare('SELECT * FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?').bind(identity.principal.subject,eventId).first();
  if(!r)return {ok:false,reason:'not_found'};
  const policy={subject:identity.principal.subject,skillId:r.skill_id,language:r.language,originExperienceId:r.origin_experience_id,contractVersion:r.contract_version,questionWord:r.question_word,purpose:r.purpose};
  return readOccurrence85C({identity,policy,eventId,db:raw});
 }
}
