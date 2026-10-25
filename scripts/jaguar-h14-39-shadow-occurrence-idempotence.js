'use strict';
// JAGUAR H14.39 — pure shadow-ledger simulation; never a production idempotency store.
// All profile slots and events are SYNTHETIC, no learner text or identity is accepted.
const phase=require('./jaguar-h14-38-independent-production-transfer.js');
const Scope=require('../js/adaptive-assessment-scope.js');
const skill=require('../data/learning/skills/why.json');
const ALLOWED_DIMENSIONS=Object.freeze(['question-function','reason-answer(local)','reason-answer(transfer)']);
const FORBIDDEN_FIELDS=Object.freeze(['learnerId','learnerEvent','answerText','rawAnswer','attemptId',
 'assessmentScope','score','canonicalProgress','evidence','greenPass','teacherDecision','semanticGrade']);
const STATUS=Object.freeze({
 CANDIDATE:'METADATA_CANDIDATE_ONLY',
 REPLAY:'IDENTICAL_REPLAY_NO_OP',
 COLLISION:'OCCURRENCE_COLLISION_FAIL_CLOSED',
 BLOCKED:'INVALID_OR_UNAUTHORIZED_ACTION',
 DUPLICATE:'DUPLICATE_EVENT_ENVELOPE',
 NO_CREDIT:'NO_EVIDENCE_AUTHORITY'
});
function fingerprint(profileSlot,packet,event){
 return JSON.stringify([profileSlot,packet.id,event.originExperienceId,event.experienceId,
  event.language,event.questionWord,event.dimension,event.intent,event.actionType,
  event.actor,event.observed,event.modelExposedBeforeAction]);
}
function inspectSimulation({events=[],packets=null}={}){
 const base=phase.build(),choices=Array.isArray(packets)?packets:base.packets;
 const problems=[],seen=new Map(),slots=new Map(),rows=[];
 if(base.issues.length||base.status!=='TASK_SOURCE_PACKETS_READY_HUMAN_REVIEW_PENDING')
  problems.push('SOURCE_OR_AUTHORITY_DRIFT');
 if(!Array.isArray(events))return Object.freeze({id:'JAGUAR-H14.39',
  status:'STOP_INVALID_EVENT_COLLECTION',problems:Object.freeze(['EXPECTED_ARRAY']),
  results:Object.freeze([]),canMintEvidence:false});
 const acceptedKinds=new Set([STATUS.CANDIDATE]);
 for(const [index,item] of events.entries()){
  const row=(status,reason,slotKey=null)=>Object.freeze({index,status,reason,slotKey,
   assessment:false,independenceVerified:false,semanticMeaningVerified:false,
   evidence:false,canMintEvidence:false,greenPass:false,patitaCredit:false});
  if(!item||typeof item!=='object'||Array.isArray(item)||FORBIDDEN_FIELDS.some(k=>Object.hasOwn(item,k))||
    Object.keys(item).some(k=>!['profileSlot','packetId','event'].includes(k))){
   rows.push(row(STATUS.BLOCKED,'NO_REAL_LEARNER_OR_EXTRA_FIELDS'));continue;
  }
  const {profileSlot,packetId,event}=item;
  if(typeof profileSlot!=='string'||!/^SIM_[A-Z0-9_]{1,24}$/.test(profileSlot)){
   rows.push(row(STATUS.BLOCKED,'SYNTHETIC_PROFILE_SLOT_REQUIRED'));continue;
  }
  if(!event||typeof event!=='object'||Array.isArray(event)||
    FORBIDDEN_FIELDS.some(k=>Object.hasOwn(event,k))||
    Object.keys(event).some(k=>!['originExperienceId','experienceId','language',
     'questionWord','dimension','intent','occurrenceId','actionType',
     'observed','actor','modelExposedBeforeAction','sourceKind'].includes(k))){
   rows.push(row(STATUS.BLOCKED,'EVENT_NOT_STUDY_METADATA'));continue;
  }
  const packet=choices.find(p=>p.id===packetId);
  if(!packet||packet.assessmentAuthority!==false||packet.contractStatus!=='DRAFT_NOT_AUTHORIZED'||
    !ALLOWED_DIMENSIONS.includes(event.dimension)){
   rows.push(row(STATUS.BLOCKED,'UNKNOWN_OR_AUTHORIZED_PACKET'));continue;
  }
  if(event.sourceKind==='PATITA_OBSERVATION'){
   rows.push(row(STATUS.BLOCKED,'PATITA_OBSERVATION_IS_NOT_AUTHOR_ACTION'));continue;
  }
  if(event.sourceKind!=='SIMULATED_DIRECT_AUTHOR_ACTION'){
   rows.push(row(STATUS.BLOCKED,'UNVERIFIED_EVENT_ORIGIN'));continue;
  }
  const checked=phase.inspectIllustrativeCandidate({packet,dimension:event.dimension,event});
  if(checked.status!=='CANDIDATE_FOR_HUMAN_TASK_REVIEW_ONLY'){
   rows.push(row(STATUS.BLOCKED,checked.status));continue;
  }
  if(typeof event.occurrenceId!=='string'||!/^SIM_OCC_[A-Za-z0-9_-]{3,50}$/.test(event.occurrenceId)){
   rows.push(row(STATUS.BLOCKED,'SYNTHETIC_OCCURRENCE_REQUIRED'));continue;
  }
  const hypotheticalScope=Scope.create({learnerId:profileSlot,skill:skill.id,
   language:packet.language,originExperienceId:packet.originExperienceId});
  if(!hypotheticalScope||!Scope.valid(hypotheticalScope)){
   rows.push(row(STATUS.BLOCKED,'SCOPE_INVALID'));continue;
  }
  const exact=fingerprint(profileSlot,packet,event);
  const old=seen.get(event.occurrenceId);
  if(old){
   if(old.fingerprint===exact){
    rows.push(row(STATUS.REPLAY,'SAME_SOURCE_SAME_OCCURRENCE_NO_SECOND_SLOT',hypotheticalScope.key));
   }else{
    rows.push(row(STATUS.COLLISION,'GLOBAL_SIMULATED_OCCURRENCE_ALREADY_RESERVED',hypotheticalScope.key));
   }
   continue;
  }
  const scopeDimension=JSON.stringify([hypotheticalScope.key,event.dimension]);
  // Distinct occurrences in one scope/dimension remain possible retries.
  const prior=slots.get(scopeDimension)||0;
  slots.set(scopeDimension,prior+1);
  seen.set(event.occurrenceId,{fingerprint:exact,scopeKey:hypotheticalScope.key,
   dimension:event.dimension});
  rows.push(row(STATUS.CANDIDATE,'UNVERIFIED_HUMAN_REVIEW_CANDIDATE',hypotheticalScope.key));
 }
 const accepted=rows.filter(r=>acceptedKinds.has(r.status)).length;
 const output=Object.freeze({
  id:'JAGUAR-H14.39',status:problems.length?'STOP_SOURCE_INTEGRITY':'SHADOW_LEDGER_STUDY_ONLY',
  inputKind:'SIMULATED_METADATA_ONLY_NOT_OBSERVED_LEARNER_ATTEMPTS',
  counts:Object.freeze({candidateEntries:accepted,identicalReplays:rows.filter(r=>r.status===STATUS.REPLAY).length,
   conflictingReuse:rows.filter(r=>r.status===STATUS.COLLISION).length,
   blocked:rows.filter(r=>r.status===STATUS.BLOCKED).length,
   distinctSimulatedOccurrences:seen.size,
   scopeDimensionsWithCandidates:slots.size,
   realLearnerAttempts:0,canonicalEvidence:0,canonicalProgress:0}),
  results:Object.freeze(rows),problems:Object.freeze(problems),
  guarantees:Object.freeze({seenOccurrenceGloballyWithinOneSimulation:true,
   durableOrDistributedIdempotence:false,
   replayNoAdditionalCandidate:true,conflictingReuseFailsClosed:true,
   crossLanguageOriginAndProfileReuseFailsClosed:true,
   crossRuntimeConcurrencyNotTested:true,
   freeNavigationStillAllowed:true,noPrerequisiteWhichHow:true,
   modelExposureNotIndependenceProof:true,
   patitaObservationNotAnAttempt:true,
   noClientStorage:true,noBackendWrite:true,
   eval08AuthorityAbsent:true,
   mainUnchanged:true,pr3Unchanged:true,func13Hidden:true}),
  assessmentAuthority:false,evidence:false,greenPass:false});
 return output;
}
module.exports=Object.freeze({inspectSimulation,STATUS});
if(require.main===module){
 const report=inspectSimulation();
 if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else console.log('H14.39 shadow-ledger readiness; '+JSON.stringify(report.counts)+'; no persisted ledger and no Evidence');
 if(report.status!=='SHADOW_LEDGER_STUDY_ONLY')process.exitCode=1;
}
