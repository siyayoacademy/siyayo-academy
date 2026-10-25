#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {build,inspectIllustrativeCandidate,inspectIllustrativeBatch}=require('./jaguar-h14-38-independent-production-transfer.js');
const scope=require('../js/adaptive-assessment-scope.js');
const source=build();
assert.equal(source.status,'TASK_SOURCE_PACKETS_READY_HUMAN_REVIEW_PENDING',JSON.stringify(source.issues));
assert.deepEqual(source.counts,{originContracts:2,languagePlans:6,
 independentTaskSlots:18,actualLearnerAttempts:0,actualTeacherReviews:0,newAuthorizedContracts:0});
assert.deepEqual(source.gates,['HG-04','HG-05','HG-09','HG-10']);
assert.equal(source.issues.length,0);
assert.equal(source.evidence,false);assert.equal(source.greenPass,false);
const expectedDimensions=['question-function','reason-answer(local)','reason-answer(transfer)'];
const origins=['shopping-for-dinner','preparing-dinner'],langs=['en','es','pt'];
for(const origin of origins)for(const language of langs){
 const packet=source.packets.find(p=>p.originExperienceId===origin&&p.language===language);
 assert.ok(packet,origin+'/'+language);
 assert.equal(packet.contractStatus,'DRAFT_NOT_AUTHORIZED');
 assert.equal(packet.assessmentAuthority,false);
 assert.equal(packet.humanHomologation,'PENDING');
 assert.equal(packet.tasks.length,3);
 assert.deepEqual(packet.tasks.map(t=>t.dimension),expectedDimensions);
 assert.equal(packet.freeNavigation,true);
 assert.equal(packet.reuseOccurrenceAcrossOriginsProhibited,true);
 for(const [i,t] of packet.tasks.entries()){
  assert.ok(t.learnerFacing.question);
  assert.equal(t.learnerFacing.modelAnswerVisible,false);
  assert.equal(t.learnerFacing.teacherContrastVisible,false);
  assert.equal(t.learnerFacing.speechPlaybackNotSufficient,true);
  assert.ok(t.teacherOnly.referenceAnswer&&t.teacherOnly.contrastAnswer);
  assert.equal(t.curriculumApproval,null);
  assert.equal(t.independenceProven,false);
  assert.equal(t.evidence,false);
  assert.equal(t.assessmentAuthority,false);
  assert.equal(t.experienceId,i===2?packet.transferExperienceId:packet.originExperienceId);
  if(i===0){
   assert.ok(t.learnerFacing.instruction);
   assert.equal(t.needsIndependentAuthoring,true);
  }
 }
 const makeEvent=(task,i,overrides={})=>({
  originExperienceId:origin,experienceId:task.experienceId,
  language,dimension:task.dimension,questionWord:'why',
  intent:i===2?'transfer':'start',occurrenceId:'simulated-'+i,
  actionType:task.learnerFacing.expectedActionType,
  observed:true,actor:'learner',modelExposedBeforeAction:false,...overrides
 });
 for(const [i,t] of packet.tasks.entries()){
  const event=makeEvent(t,i);
  const screened=inspectIllustrativeCandidate({packet,dimension:t.dimension,event});
  assert.equal(screened.status,'CANDIDATE_FOR_HUMAN_TASK_REVIEW_ONLY');
  assert.equal(screened.independenceVerified,false);
  assert.equal(screened.canMintEvidence,false);
  assert.equal(screened.canGrantGreenPass,false);
  assert.equal(screened.semanticApproval,null);
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{actor:'speaker',actionType:'SPEECH_PLAYBACK'})}).status,'NOT_AN_INDEPENDENT_TEXT_RESPONSE');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{actionType:'SCENE_VISIT'})}).status,'NOT_AN_INDEPENDENT_TEXT_RESPONSE');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{modelExposedBeforeAction:true})}).status,'NEEDS_UNBIASED_INDEPENDENCE_CHECK');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{modelExposedBeforeAction:null})}).status,'NEEDS_UNBIASED_INDEPENDENCE_CHECK');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{originExperienceId:packet.transferExperienceId})}).status,'STOP_CONTEXT_OR_ORIGIN_MISMATCH');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{language:language==='pt'?'en':'pt'})}).status,'STOP_CONTEXT_OR_ORIGIN_MISMATCH');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{answerText:'raw learner text forbidden'})}).status,'STOP_FORBIDDEN_LIVE_LEARNER_FIELDS');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{learnerId:'personally identifying value'})}).status,'STOP_FORBIDDEN_LIVE_LEARNER_FIELDS');
  assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{occurrenceId:''})}).status,'STOP_MISSING_OCCURRENCE');
  if(i===2){
   assert.equal(inspectIllustrativeCandidate({packet,dimension:t.dimension,event:makeEvent(t,i,{intent:'start'})}).status,'STOP_INTENT_MISMATCH');
   const other=source.packets.find(p=>p.language===language&&p.originExperienceId===packet.transferExperienceId);
   assert.ok(other);
   // S2 may be a local scene of its own origin or a transfer from S1;
   // an event for one origin cannot masquerade as an event for another.
   assert.equal(inspectIllustrativeCandidate({packet:other,dimension:t.dimension,event}).status,'STOP_CONTEXT_OR_ORIGIN_MISMATCH');
  }
 }
 const batch=inspectIllustrativeBatch({packet,events:[makeEvent(packet.tasks[0],0,{occurrenceId:'same'}),
   makeEvent(packet.tasks[1],1,{occurrenceId:'same'})]});
 assert.equal(batch.status,'BATCH_HAS_REUSED_OCCURRENCES');
 assert.ok(batch.results.every(r=>r.status==='STOP_REUSED_OCCURRENCE'&&!r.canMintEvidence));
 const isolated=scope.create({learnerId:'SIMULATED-A',skill:packet.skill,language,originExperienceId:origin});
 const otherOrigin=scope.create({learnerId:'SIMULATED-A',skill:packet.skill,language,originExperienceId:packet.transferExperienceId});
 const otherLearner=scope.create({learnerId:'SIMULATED-B',skill:packet.skill,language,originExperienceId:origin});
 assert.ok(isolated&&otherOrigin&&!scope.same(isolated,otherOrigin));
 assert.ok(!scope.same(isolated,otherLearner));
}
assert.equal(source.protection.mainUntouched,true);
assert.equal(source.protection.pr3Untouched,true);
assert.equal(source.protection.func13Hidden,true);
assert.equal(source.protection.patitaObservationOnly,true);
assert.equal(source.protection.existingS3S4CanonicalUnchanged,true);
const hash=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
for(const [file,sha] of Object.entries({
 'scripts/jaguar-h14-37-trilingual-semantic-review.js':'b9aecd0afe264d7a108008cdc3079088cff04237',
 'scripts/jaguar-h14-26-why-independent-task-blueprints.js':'8004dd85f124a0a68e12c60d8dfb2feeb938f0cf',
 'scripts/jaguar-h14-36-phase1-source-review.js':'fe9c9816b056cddefc97733f7676a93f191cd656',
 'data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json':'143e8692ac7dd5bdbd2de3d4624b0f264db7370d',
 'data/learning/skills/why.json':'cf16e1e879bd236e5199240e350c0c623a2bc3ed',
 'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4'
}))assert.equal(hash(file),sha,'PROTECTED SOURCE DRIFT '+file);
const own=fs.readFileSync('scripts/jaguar-h14-38-independent-production-transfer.js','utf8');
for(const denied of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','dispatchEvent(','submitObservedAttempt','speechSynthesis.speak('])
 assert.ok(!own.includes(denied),'unsafe operation '+denied);
console.log('PASS H14.38: 6 scoped trilingual plans, 18 unapproved task slots, audio/visit/model-exposure/duplicate/origin fail-closed; no Evidence');
