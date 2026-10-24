#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const {blueprint,LANGUAGES,DIMENSIONS}=require('./jaguar-h14-26-why-independent-task-blueprints.js');
const {audit}=require('./jaguar-h14-25-why-s1-s2-fine-review.js');
const scope=require('../js/adaptive-assessment-scope.js');
const data=read('data/learning/experience-seeds.json').items;
const sourceStudy=read('data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json');
const draft=read('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const skill=read('data/learning/skills/why.json');
const map=read('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json');
const priorInventory={slots:map.slots.map(x=>({experienceId:x.experienceId,questionWord:x.questionWord,
 status:x.assessment.entryTarget?'ASSESSMENT_DECLARED':x.assessment.resumeTarget?'ASSESSMENT_RESUME_ONLY':'OPPORTUNITY_ONLY'}))};
const sourceReview=audit({experiences:data,study:sourceStudy,draft,
 coherence:require('../js/verb-explorer-contextual-coherence.js'),priorInventory});
const result=blueprint({review:sourceReview,draft,skill,experiences:data});
assert.ok(result);
assert.deepEqual(result.counts,{draftOrigins:2,languagePlans:6,dimensionSlots:18,
 authoredIndependentFunctionPrompts:0,newAuthorizedContracts:0,issues:0});
assert.deepEqual(LANGUAGES,['en','es','pt']);
assert.deepEqual(DIMENSIONS,['question-function','reason-answer(local)','reason-answer(transfer)']);
assert.equal(result.plans.length,6);
const plan=(origin,language)=>result.plans.find(x=>x.originExperienceId===origin&&x.language===language);
for(const p of result.plans){
 assert.ok(p);assert.equal(p.status,'BLUEPRINT_NOT_AUTHORIZED');
 assert.equal(p.assessmentAuthority,false);assert.equal(p.newEvidence,false);assert.equal(p.patitaCredit,false);
 assert.equal(p.greenPass,false);assert.equal(p.independentOccurrenceIdRequired,true);
 assert.equal(p.intentAndOriginMustBeExplicit,true);assert.equal(p.noDoubleCountForS2DualRole,true);
 assert.equal(p.noMandatoryS1ToS2Sequence,true);assert.equal(p.onlyPresentAffirmativeSources,true);
 assert.equal(p.tasks.length,3);
 assert.deepEqual(p.tasks.map(x=>x.dimension),DIMENSIONS);
 const functionTask=p.tasks[0];
 assert.equal(functionTask.status,'NEEDS_INDEPENDENT_TASK_AUTHORING');
 assert.equal(functionTask.prompt,null,'head probe must not be mistaken for authored WHY function assessment');
 assert.equal(functionTask.cannotReuseHeadProbeAsStandaloneProof,true);
 for(const task of p.tasks){
  assert.equal(task.evidenceAuthority,false);
  assert.equal(task.independentLearnerActionRequired,true);
 }
 for(const task of p.tasks.slice(1)){
  assert.equal(task.taskType,'INDEPENDENT_FREE_RESPONSE');
  assert.equal(task.learnerFacingModelAnswerAllowed,false);
  assert.equal(task.sourceTextShownBeforeAttempt,false);
  assert.ok(task.questionText&&task.teacherReferenceOnly.modelAnswer&&task.teacherReferenceOnly.contrastAnswer);
  const sourceCase=sourceReview.cases.find(x=>x.experienceId===task.experienceId&&x.language===p.language);
  assert.equal(task.questionText,sourceCase.displayReferenceQuestion);
  assert.equal(task.teacherReferenceOnly.modelAnswer,sourceCase.referenceAnswer);
 }
 const local=p.tasks[1],transfer=p.tasks[2];
 assert.equal(local.experienceId,p.originExperienceId);
 assert.equal(transfer.experienceId,p.transferExperienceId);
 assert.notEqual(local.teacherReferenceOnly.reasonId,transfer.teacherReferenceOnly.reasonId);
}
const s1='shopping-for-dinner',s2='preparing-dinner';
for(const language of LANGUAGES){
 const forward=plan(s1,language),reverse=plan(s2,language);
 assert.ok(forward&&reverse);
 assert.equal(forward.transferExperienceId,s2);
 assert.equal(reverse.transferExperienceId,s1);
 assert.equal(forward.tasks[1].questionText,reverse.tasks[2].questionText);
 assert.equal(forward.tasks[2].questionText,reverse.tasks[1].questionText);
 const sc1=scope.create({learnerId:'LEARNER-A',skill:skill.id,language,originExperienceId:s1});
 const sc2=scope.create({learnerId:'LEARNER-A',skill:skill.id,language,originExperienceId:s2});
 assert.ok(sc1&&sc2&&!scope.same(sc1,sc2),'S2 dual role must not merge scopes');
 const other=scope.create({learnerId:'LEARNER-B',skill:skill.id,language,originExperienceId:s1});
 assert.ok(!scope.same(sc1,other),'different learner must not share scope');
}
const bad={...draft,contractRegistry:draft.contractRegistry.map(x=>x.id==='WHY-S1-S2-DRAFT'?{...x,authority:true}:x)};
const blocked=blueprint({review:sourceReview,draft:bad,skill,experiences:data});
assert.ok(blocked.issues.some(x=>x.draftId==='WHY-S1-S2-DRAFT'));
assert.equal(blocked.plans.length,3);
const altered={...sourceReview,cases:sourceReview.cases.map(x=>x.experienceId===s1&&x.language==='en'?{...x,referenceReasonId:'wrong-source'}:x)};
const provenanceFail=blueprint({review:altered,draft,skill,experiences:data});
assert.ok(provenanceFail.issues.some(x=>x.language==='en'));
const sha=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
for(const [file,hash] of Object.entries({
 'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4',
 'data/learning/skills/why.json':'cf16e1e879bd236e5199240e350c0c623a2bc3ed',
 'data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json':'143e8692ac7dd5bdbd2de3d4624b0f264db7370d',
 'scripts/jaguar-h14-25-why-s1-s2-fine-review.js':'66dccee4263215c6fab53ee044be095e67c142c0'
}))assert.equal(sha(fs.readFileSync(file)),hash,'Protected source drift: '+file);
const legacy=draft.contractRegistry.find(x=>x.id==='WHY-S3-S4-CANONICAL');
assert.equal(legacy.status,'EXISTING_CANONICAL_UNCHANGED');
assert.equal(result.plans.some(x=>x.originExperienceId==='having-dinner'),false);
const source=fs.readFileSync('scripts/jaguar-h14-26-why-independent-task-blueprints.js','utf8');
for(const forbidden of ['localStorage','sessionStorage','createEvidence(','recordOutcome(','dispatchEvent(','fetch(', 'submitObservedAttempt'])assert.ok(!source.includes(forbidden),'Forbidden '+forbidden);
console.log('PASS H14.26: 6 S1/S2 language plans; 18 dimension slots; function-proof awaiting authoring; free-response drafts; two isolated origin scopes; failure closed; 0 Evidence; protected hashes');
