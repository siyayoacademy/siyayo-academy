// JAGUAR EVAL-08 LAB-ONLY atomic D1-shaped Evidence/outbox.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const Scope=require('../../../../js/adaptive-assessment-scope.js');
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const token=s=>typeof s==='string'&&/^[A-Za-z0-9_.:-]{1,128}$/.test(s);
const denied=reason=>Object.freeze({atomic:false,reason});
const guard=[
 'INSERT INTO lab_eval_guard(id,ok) VALUES(1,CASE WHEN',
 'EXISTS(SELECT 1 FROM lab_eval_sessions WHERE subject=? AND session_id=? AND issuer_verified=1 AND revoked=0 AND expires_at>?)',
 'AND EXISTS(SELECT 1 FROM lab_eval_contracts WHERE id=? AND version=? AND revision=? AND subject=? AND session_id=?',
 'AND skill=? AND language=? AND origin_experience_id=? AND current_experience_id=? AND phase=?',
 'AND authorized=1 AND revoked=0 AND expires_at>?)',
 'AND EXISTS(SELECT 1 FROM lab_eval_actions WHERE action_key=? AND event_id=? AND subject=? AND session_id=?',
 'AND skill=? AND language=? AND origin_experience_id=? AND current_experience_id=? AND dimension=? AND mode=?',
 "AND phase=? AND source='DIRECT_LEARNER_ACTION' AND consumed=0 AND recorded_at<=? AND recorded_at>=?)",
 'AND EXISTS(SELECT 1 FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?',
 'AND skill_id=? AND language=? AND origin_experience_id=? AND current_experience_id=?',
 "AND upper(question_word)=upper(?) AND purpose='assessment' AND status='pending'",
 'AND contract_version=? AND source_occurrence_id=?)',
 'AND NOT EXISTS(SELECT 1 FROM lab_eval_attempts WHERE subject=? AND (event_id=? OR action_key=?))',
 'THEN 1 ELSE 0 END)'
].join(' ');
export function createLocalAtomicEval08Writer({db,now,resolveVerifiedSession}={}){
 if(typeof db?.batch!=='function'||typeof db?.prepare!=='function'||
    typeof now!=='function'||typeof resolveVerifiedSession!=='function')
  throw new TypeError('trusted D1-shaped batch and session resolver required');
 async function commitAtomicAssessment(input){
  const {principal,eventId,actionKey,contractId,contractVersion,contractRevision,scope,packet,verdictProvenanceId}=input||{};
  const ts=now();
  if(!Number.isSafeInteger(ts)||!token(principal?.subject)||!token(principal?.sessionId)||
     typeof eventId!=='string'||!uuid.test(eventId)||!token(actionKey)||!token(contractId)||
     !token(contractVersion)||!Number.isSafeInteger(contractRevision)||contractRevision<1||
     !Scope.valid(scope)||scope.learnerId!==principal.subject||!Scope.ownsPacket(scope,packet)||
     !token(verdictProvenanceId)||!['pass','fail'].includes(packet.result)||packet.support!=='none'||
     !token(packet.dimension)||!token(packet.mode)||packet.context?.occurrenceId!==eventId||
     !token(packet.context?.experienceId))return denied('invalid_bound_intake');
  const origin=scope.originExperienceId,current=packet.context.experienceId;
  const transfer=current!==origin,phase=transfer?'transfer':'local';
  if(transfer?(packet.mode!=='transfer'||packet.context.fromExperienceId!==origin):
    (packet.mode==='transfer'||packet.context.fromExperienceId!=null))return denied('invalid_origin_transfer');
  const questionWord=scope.skill.split('.')[0].toUpperCase();
  const packetJSON=JSON.stringify(packet);
  if(packetJSON.length>4096)return denied('oversized_packet');
  const args=[
   principal.subject,principal.sessionId,ts,
   contractId,contractVersion,contractRevision,principal.subject,principal.sessionId,
   scope.skill,scope.language,origin,current,phase,ts,
   actionKey,eventId,principal.subject,principal.sessionId,scope.skill,scope.language,
   origin,current,packet.dimension,packet.mode,phase,ts,ts-300,
   principal.subject,eventId,scope.skill,scope.language,origin,current,questionWord,
   contractVersion,actionKey,principal.subject,eventId,actionKey
  ];
  const bind=(sql,...v)=>db.prepare(sql).bind(...v);
  const statements=[
   bind(guard,...args),
   bind('UPDATE lab_eval_actions SET consumed=1 WHERE action_key=? AND consumed=0',actionKey),
   bind('INSERT INTO lab_eval_attempts (subject,event_id,action_key,contract_id,contract_version,contract_revision,scope_key,skill,language,origin_experience_id,current_experience_id,dimension,mode,result,provenance_id,packet_json,committed_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
     principal.subject,eventId,actionKey,contractId,contractVersion,contractRevision,scope.key,
     scope.skill,scope.language,origin,current,packet.dimension,packet.mode,packet.result,
     verdictProvenanceId,packetJSON,ts)
  ];
  if(packet.result==='pass')statements.push(bind(
   'INSERT INTO lab_eval_evidence (subject,event_id,scope_key,contract_id,contract_version,skill,language,origin_experience_id,packet_json) VALUES (?,?,?,?,?,?,?,?,?)',
    principal.subject,eventId,scope.key,contractId,contractVersion,scope.skill,scope.language,origin,packetJSON));
  statements.push(bind(
   'INSERT INTO lab_eval_outbox (subject,event_id,event_kind,scope_key,published_at) VALUES (?,?,?,?,NULL)',
    principal.subject,eventId,packet.result==='pass'?'EVIDENCE_COMMITTED':'ATTEMPT_REJECTED',scope.key));
  statements.push(bind('DELETE FROM lab_eval_guard WHERE id=1'));
  try{
   const r=await db.batch(statements);
   if(!Array.isArray(r)||r.length!==statements.length||r.some(v=>v?.success!==true))
    return denied('batch_result_unverified');
   const receipt=await db.prepare('SELECT a.result,a.scope_key,o.event_kind,a.contract_revision FROM lab_eval_attempts a JOIN lab_eval_outbox o ON o.subject=a.subject AND o.event_id=a.event_id WHERE a.subject=? AND a.event_id=? AND a.action_key=?').bind(principal.subject,eventId,actionKey).first();
   if(!receipt||receipt.result!==packet.result||receipt.scope_key!==scope.key||
      receipt.contract_revision!==contractRevision||
      receipt.event_kind!==(packet.result==='pass'?'EVIDENCE_COMMITTED':'ATTEMPT_REJECTED'))
      return denied('committed_receipt_unverified');
   return Object.freeze({atomic:true,eventId,outcome:packet.result==='pass'?'accepted':'rejected',
       attemptRecorded:true,evidenceCreated:packet.result==='pass'});
  }catch{return denied('atomic_guard_or_batch_failed');}
 }
 async function readAccepted({sessionHandle,skill,language,originExperienceId}={}){
  if(typeof sessionHandle!=='string'||!sessionHandle||!token(skill)||
     !['en','es','pt'].includes(language)||!token(originExperienceId))
    return Object.freeze({ok:false,reason:'invalid_read_scope'});
  try{
   const person=await resolveVerifiedSession(sessionHandle),ts=now();
   if(person?.verified!==true||person?.issuerVerified!==true||person?.revoked!==false||
      !token(person.subject)||!token(person.sessionId)||!Number.isSafeInteger(person.expiresAt)||
      person.expiresAt<=ts)return Object.freeze({ok:false,reason:'unverified_reader'});
   const active=await db.prepare('SELECT 1 AS ok FROM lab_eval_sessions WHERE subject=? AND session_id=? AND issuer_verified=1 AND revoked=0 AND expires_at>?').bind(person.subject,person.sessionId,ts).first();
   if(active?.ok!==1)return Object.freeze({ok:false,reason:'reader_session_revoked'});
   const scope=Scope.create({learnerId:person.subject,skill,language,originExperienceId});
   if(!Scope.valid(scope))return Object.freeze({ok:false,reason:'invalid_read_scope'});
   const out=await db.prepare(
     "SELECT e.packet_json,e.event_id FROM lab_eval_evidence e JOIN lab_eval_attempts a ON a.subject=e.subject AND a.event_id=e.event_id JOIN lab_eval_outbox o ON o.subject=e.subject AND o.event_id=e.event_id WHERE e.subject=? AND e.scope_key=? AND a.scope_key=? AND a.result='pass' AND o.event_kind='EVIDENCE_COMMITTED' ORDER BY e.event_id"
   ).bind(person.subject,scope.key,scope.key).all();
   if(!out?.success||!Array.isArray(out.results))return Object.freeze({ok:false,reason:'readback_unavailable'});
   const packets=[];
   for(const row of out.results){
    let p;try{p=JSON.parse(row.packet_json);}catch{return Object.freeze({ok:false,reason:'bad_packet_readback'});}
    if(p.result!=='pass'||p.context?.occurrenceId!==row.event_id||!Scope.ownsPacket(scope,p))
      return Object.freeze({ok:false,reason:'scope_readback_conflict'});
    packets.push(Object.freeze(p));
   }
   return Object.freeze({ok:true,scope,packets:Object.freeze(packets),status:'LAB_CANONICAL_READBACK_NO_GREEN_AUTHORITY'});
  }catch{return Object.freeze({ok:false,reason:'readback_failed'});}
 }
 return Object.freeze({commitAtomicAssessment,readAccepted});
}
