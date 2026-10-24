#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const plans=read('data/learning/references/jaguar-h14-10-first-two-practice-pilots-v0.1.json');
const prior=read('data/learning/references/jaguar-h14-9-semantic-80-review-v0.1.json');
const source=read('data/learning/experience-seeds.json').items;
const originals=read('data/learning/references/master-vip-verb-functions-v0.1.json');
const content=fs.readFileSync('labs/master-vip-first-practices-h14-10/index.html','utf8');
assert.equal(plans.tasks.length,2);assert.deepEqual(plans.languages,['en','es','pt']);
assert.equal(plans.authority.newAssessmentTarget,false);
assert.equal(plans.authority.assessmentEvidence,false);
assert.equal(plans.authority.greenPass,false);
for(const lesson of plans.tasks){
 const relation=prior.matrix.find(r=>r.key===lesson.sourceRelation);
 const experience=source.find(x=>x.id===lesson.experienceId);
 const master=originals.functions.find(x=>x.id===lesson.functionId);
 assert.ok(relation&&experience&&master);
 assert.equal(lesson.masterPattern,master.pattern);
 assert.equal(lesson.curricularStatus,'PENDING_HUMAN_HOMOLOGATION');
 assert.equal(lesson.provenance,'SIYAYO_ADAPTATION');
 assert.equal(lesson.optionalQW.assessmentTarget,false);
 assert.equal(lesson.optionalQW.requiresQWSelection,false);
 assert.equal(lesson.canScore,false);assert.equal(lesson.canProduceEvidence,false);assert.equal(lesson.greenPass,false);
 assert.equal(lesson.evaluationDesign.length,3);
 for(const dimension of lesson.evaluationDesign)assert.equal(dimension.draftOnly,true);
 assert.deepEqual(lesson.canonicalPerspectiveExamples,experience.perspectives[lesson.perspectiveId].examples);
 assert.deepEqual(lesson.sourceFunctionAdaptation,relation.functionAdaptation);
 for(const lang of plans.languages){
  assert.ok(lesson.contextualPrompt.instruction[lang]&&lesson.contextualPrompt.question[lang]&&lesson.contextualPrompt.referenceAnswer[lang]);
  for(const value of [lesson.contextualPrompt.referenceAnswer[lang],lesson.sourceFunctionAdaptation[lang],...lesson.canonicalPerspectiveExamples[lang]])
   assert.ok(content.includes(JSON.stringify(value)),lesson.id+'/'+lang+' expected authored content not found');
  assert.equal(lesson.contextualPrompt.referenceAnswer[lang],relation.functionAdaptation[lang]);
 }
 assert.ok(lesson.semanticCautions.length>1);
}
assert.equal(plans.tasks[0].sourceRelation,'having-dinner::state::describing');
assert.equal(plans.tasks[1].sourceRelation,'preparing-dinner::movement::narrating');
assert.equal(plans.tasks[0].optionalQW.id,'how');
assert.equal(plans.tasks[1].optionalQW.id,'what');
assert.equal(plans.tasks[0].sourceStatus,'SOURCE_CLOSE_NOT_APPROVED');
assert.equal(plans.tasks[1].sourceStatus,'BRIDGE_AUTHORING_DRAFT_NOT_APPROVED');
for(const pattern of ['data-lang="en"','data-lang="es"','data-lang="pt"','data-task="0"','data-task="1"','id="toggle"','aria-expanded','PENDING_HUMAN_HOMOLOGATION'])assert.ok(content.includes(pattern),pattern);
for(const p of [/fetch\s*\(/,/localStorage/,/sessionStorage/,/indexedDB/,/WebSocket/,/sendBeacon/,/\bsubmitObservedAttempt\b/])assert.doesNotMatch(content,p);
console.log('PASS H14.10 two independent EN/ES/PT practice task proposals; canonical source fidelity; zero assessment authority');
