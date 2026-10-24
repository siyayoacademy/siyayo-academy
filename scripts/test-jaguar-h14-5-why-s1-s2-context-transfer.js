#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const get=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const seeds=get('data/learning/experience-seeds.json').items;
const map=get('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json');
const prev=get('data/learning/references/jaguar-h14-4-why-independent-opportunity-readiness-v0.1.json');
const study=get('data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json');
const whySkill=get('data/learning/skills/why.json');
const {project}=require('./jaguar-h14-5-why-context-projection.js');
const before=JSON.stringify(seeds);
const p=project(seeds);
assert.ok(p,'S1/S2 valid source projection');
assert.equal(study.scenario.contractSkill,whySkill.id);
assert.equal(p.status,'READY_FOR_HUMAN_CONTEXT_REVIEW_NOT_ASSESSMENT');
assert.equal(p.local.referenceReasonId,study.contexts[0].acceptedReasonId);
assert.equal(p.transfer.referenceReasonId,study.contexts[1].acceptedReasonId);
assert.notEqual(p.local.referenceReasonId,p.transfer.referenceReasonId);
assert.equal(p.local.contrastReasonId,study.contexts[0].distractorId);
assert.equal(p.transfer.contrastReasonId,study.contexts[1].distractorId);
assert.deepEqual(Object.keys(p.local.languages),['en','es','pt']);
for(const lang of ['en','es','pt']){
 const row=study.trilingualReview[lang],a=p.local.languages[lang],b=p.transfer.languages[lang];
 assert.equal(a.question,row.originQuestion,lang+' S1 question');
 assert.equal(a.referenceReason,row.originReason,lang+' S1 reason');
 assert.equal(b.question,row.transferQuestion,lang+' S2 question');
 assert.equal(b.referenceReason,row.transferReason,lang+' S2 reason');
 assert.ok(a.contrastReason&&b.contrastReason,'different grounded contrast per scene');
 assert.equal(a.assessmentAuthority,false);assert.equal(b.assessmentAuthority,false);
}
assert.equal(p.contractAuthorized,false);assert.equal(p.scoreEligible,false);
assert.equal(p.createsEvidence,false);assert.equal(p.canProduceGreenPass,false);
assert.equal(p.local.canSubmitAttempt,false);assert.equal(p.transfer.canSubmitAttempt,false);
assert.equal(study.outputPolicy.canGenerateAttempt,false);
assert.equal(study.outputPolicy.canGenerateEvidence,false);
assert.equal(study.outputPolicy.canAwardGreenPass,false);
assert.equal(study.outputPolicy.canActivateContract,false);
assert.equal(study.outputPolicy.assessmentAuthority,false);
for(const id of ['shopping-for-dinner','preparing-dinner']){
 const slot=map.slots.find(s=>s.experienceId===id&&s.questionWord==='why');
 assert.ok(slot&&slot.assessment.entryTarget===null);
 const origin=seeds.find(e=>e.id===id).thinkingMind.find(q=>q.questionWord==='why');
 assert.equal(origin.assessmentTarget,undefined);
}
assert.equal(prev.candidates[0].classification,'CANDIDATE_NOT_AUTHORIZED');
assert.equal(prev.candidates[2].classification,'CURRENT_AUTHORIZED');
// Even with route changed, *authoring review* must not require NEXT or previously assessed WHICH/HOW.
const unrelatedRoute=structuredClone(seeds);
unrelatedRoute.find(e=>e.id==='shopping-for-dinner').toroidalNext.nextExperience='after-dinner-conversation';
assert.ok(project(unrelatedRoute),'source contextual review independent of navigation ordering');
function mutate(f){const candidate=structuredClone(seeds);f(candidate);assert.equal(project(candidate),null,'fail-closed invalid authored candidate');}
const s1=x=>x.find(e=>e.id==='shopping-for-dinner').thinkingMind.find(q=>q.questionWord==='why');
const s2=x=>x.find(e=>e.id==='preparing-dinner').thinkingMind.find(q=>q.questionWord==='why');
mutate(x=>{delete s1(x).presentationGrounding.questionOverride.pt;});
mutate(x=>{s1(x).presentationGrounding.alternatives[0].id='shopping-finished';});
mutate(x=>{s2(x).presentationGrounding.alternatives[0].response.es='';});
mutate(x=>{s2(x).presentationGrounding.referenceReasonId='still-shopping';});
mutate(x=>{s1(x).presentationGrounding.assessmentAuthority=true;});
mutate(x=>{s1(x).assessmentTarget={skill:whySkill.id,definitionPath:'data/learning/skills/why.json'};});
mutate(x=>{s2(x).assessmentTarget={skill:whySkill.id,definitionPath:'data/learning/skills/why.json'};});
mutate(x=>{s1(x).presentationGrounding.referent.referenceOnly=false;});
assert.equal(JSON.stringify(seeds),before,'never mutate canonical source');
assert.equal(study.integrity.existingS3S4ContractUntouched,true);
console.log('PASS H14.5 WHY S1→S2 EN/ES/PT source fidelity, independent route study, eight fail-closed cases, zero new assessment authority');
