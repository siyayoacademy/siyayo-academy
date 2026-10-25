// H14.54 LOCAL WORKER ONLY: synthetic server session, immutable action provenance.
// Not production authentication. No HTTP API, Wrangler deployment or external D1.
import {WorkerEntrypoint} from 'cloudflare:workers';
import {createHash} from 'node:crypto';
import {createGuardedBatchCandidate} from '../h14-50/guarded-batch-candidate.mjs';
import {readOccurrence85C} from '../storage-contract/storage-contract.mjs';
import {createSyntheticTrustedActionGateway} from '../h14-53/trusted-action-gateway.mjs';
import {verifyFixtureIdentityAssertion} from './fixture-identity-verifier.mjs';

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
export default class LocalVerifiedAssertionLab extends WorkerEntrypoint{
 async fetch(){return new Response('lab route disabled',{status:404});}
 async submitSigned(input){
  if(!input||typeof input!=='object'||Array.isArray(input)||
     Object.keys(input).sort().join(',')!=='actionKey,eventId,intent,proof')
   return {ok:false,reason:'invalid_request'};
  if(this.env.LAB_RPC_ENABLED!==true||this.env.LAB_H1454_VERIFY_ENABLED!==true)
   return {ok:false,reason:'lab_rpc_disabled'};
  const verified=verifyFixtureIdentityAssertion({proof:input.proof,
    key:this.env.LAB_H1454_TEST_KEY,issuer:'SIYAYO_TEST_ISSUER',audience:'SIYAYO_H1454_LAB',
    now:Math.floor(Date.now()/1000)});
  if(!verified.ok)return verified;
  const claims=verified.claims;
  if(input.actionKey!==claims.actionKey||input.eventId!==claims.eventId||input.intent!==claims.intent)
   return {ok:false,reason:'signed_request_mismatch'};
  const resolved=await mockServerServices(this.env.DB).resolveIdentity(claims.sessionHandle);
  if(resolved.ok!==true||resolved.principal.subject!==claims.subject||
    resolved.principal.sessionId!==claims.sessionId)
   return {ok:false,reason:'identity_session_mismatch'};
  
  const raw=this.env.DB,svc=mockServerServices(raw);
  const storage={
   prepare:sql=>raw.prepare(sql),
   batch:async statements=>{
    // All injections are controlled by test-only Worker env, not caller input.
    if(this.env.LAB_REVOKE_BEFORE_BATCH===true)
     await raw.prepare('UPDATE mock_sessions SET revoked=1 WHERE handle=?').bind(claims.sessionHandle).run();
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
   db:raw,sessionHandle:claims.sessionHandle,
   resolveIdentity:svc.resolveIdentity,now:svc.now,
   submitBound:request=>candidate.submit(request)
  });
  const r=await gate.submit({actionKey:input.actionKey,eventId:input.eventId,intent:input.intent});
  return {...r,execution:'SIGNED_LAB_ASSERTION_WORKER_LOCAL',cryptoProof:createHash('sha256').update('H14.53-TRUST').digest('hex')};
 }
 async readSigned(input){
  if(this.env.LAB_RPC_ENABLED!==true||this.env.LAB_H1454_VERIFY_ENABLED!==true)
   return {ok:false,reason:'lab_rpc_disabled'};
  if(!input||typeof input!=='object'||Array.isArray(input)||
     Object.keys(input).sort().join(',')!=='eventId,proof')
   return {ok:false,reason:'invalid_request'};
  const verified=verifyFixtureIdentityAssertion({proof:input.proof,key:this.env.LAB_H1454_TEST_KEY,
    issuer:'SIYAYO_TEST_ISSUER',audience:'SIYAYO_H1454_LAB',now:Math.floor(Date.now()/1000)});
  if(!verified.ok)return verified;
  const claims=verified.claims;
  if(input.eventId!==claims.eventId)return {ok:false,reason:'signed_request_mismatch'};
  const raw=this.env.DB,identity=await mockServerServices(raw).resolveIdentity(claims.sessionHandle);
  if(identity.ok!==true||identity.principal.subject!==claims.subject||
     identity.principal.sessionId!==claims.sessionId)return {ok:false,reason:'unauthenticated'};
  const r=await raw.prepare('SELECT * FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?')
    .bind(identity.principal.subject,input.eventId).first();
  if(!r)return {ok:false,reason:'not_found'};
  const policy={subject:identity.principal.subject,skillId:r.skill_id,language:r.language,
    originExperienceId:r.origin_experience_id,contractVersion:r.contract_version,
    questionWord:r.question_word,purpose:r.purpose};
  return readOccurrence85C({identity,policy,eventId:input.eventId,db:raw});
 }
}
