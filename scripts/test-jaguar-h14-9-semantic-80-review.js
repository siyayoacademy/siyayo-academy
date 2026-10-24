#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const a=read('data/learning/references/jaguar-h14-9-semantic-80-review-v0.1.json');
const s=read('data/learning/experience-seeds.json').items;
const f=read('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json');
const old=read('data/learning/references/jaguar-h14-8-master-vip-perspectives-v0.1.json');
assert.equal(old.counts.potentialCrossings,80);
assert.equal(a.matrix.length,80);assert.equal(a.counts.trilingualViews,240);
assert.equal(new Set(a.matrix.map(x=>x.key)).size,80);
const ids=['describing','narrating','debating','concluding'],langs=['en','es','pt'];
const statuses=['SOURCE_CLOSE','BRIDGE','CONTRAST'];
const sums=Object.fromEntries(statuses.map(status=>[status,0]));
for(const exp of s){
 const rows=a.matrix.filter(x=>x.experienceId===exp.id);assert.equal(rows.length,20);
 for(const func of f.functions)for(const id of ids){
  const r=rows.find(x=>x.functionId===func.id&&x.perspectiveId===id);
  assert.ok(r);assert.equal(r.color,exp.perspectives[id].line);
  assert.ok(statuses.includes(r.preliminaryReview));sums[r.preliminaryReview]++;
  assert.ok(r.reason.length>=30);
  const original=f.cells.find(x=>x.experienceId===exp.id&&x.functionId===func.id);
  assert.ok(original);
  for(const lang of langs){
   assert.equal(r.functionAdaptation[lang],original.example[lang]);
   assert.deepEqual(r.perspectiveAuthoredExamples[lang],exp.perspectives[id].examples[lang]);
  }
  assert.equal(r.assessmentAuthority,false);assert.equal(r.evidenceProduced,false);
  assert.equal(r.assessedLearner,false);
  assert.equal(r.reviewedBy,'ASSISTANT_PRELIMINARY_SEMANTIC_AUDIT_NOT_HUMAN_HOMOLOGATION');
 }
}
assert.deepEqual(sums,a.counts.preliminaryReviewCounts);
assert.deepEqual(sums,{SOURCE_CLOSE:1,BRIDGE:57,CONTRAST:22});
const s3State=a.matrix.find(x=>x.key==='having-dinner::state::describing');
assert.equal(s3State.preliminaryReview,'SOURCE_CLOSE');
for(const row of a.matrix.filter(x=>x.functionId==='action'))assert.equal(row.preliminaryReview,'CONTRAST');
assert.equal(a.matrix.filter(x=>x.experienceId==='after-dinner-conversation'&&x.perspectiveId==='concluding').every(x=>x.timeFlag==='past'),true);
assert.equal(a.counts.verifiedContextualExercises,0);assert.equal(a.counts.newAssessmentOpportunitiesAuthorized,0);
for(const flag of ['scoringDisabled','qwIndependent','existenceRemainsAutonomous','concludingDoesNotGrantGreenPass','masterMovementIsProgressive'])assert.equal(a.auditPolicy[flag],true);
console.log('PASS H14.9: 80 independent initial human-readable reviews; 1 source-close, 57 contextual bridges, 22 contrast-only, 240 trilingual views, zero assessment authority');
