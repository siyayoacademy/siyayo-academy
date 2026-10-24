#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const mirror=read('data/learning/references/jaguar-h14-8-master-vip-perspectives-v0.1.json');
const functionsMatrix=read('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json');
const experiences=read('data/learning/experience-seeds.json').items;
const project=require('./jaguar-h14-8-perspective-cross-reference.js').project;
const raw=JSON.stringify(experiences);
const r=project({mirror,functionsMatrix,experiences});
assert.ok(r);assert.equal(r.count,80);assert.equal(r.rows.length,80);
assert.equal(new Set(r.rows.map(x=>x.id)).size,80);
assert.equal(mirror.counts.canonicalPerspectiveSlots,16);
assert.equal(mirror.counts.potentialCrossings,80);
assert.equal(mirror.counts.authorizedCrossings,0);
assert.deepEqual(mirror.perspectives.map(x=>x.id),['describing','narrating','debating','concluding']);
assert.deepEqual(mirror.perspectives.map(x=>x.color),['red','yellow','green','blue']);
for(const scene of experiences){
 const per=mirror.perspectivesSource.find(x=>x.experienceId===scene.id);
 assert.ok(per);
 for(const entry of per.slots){
  assert.equal(entry.color,scene.perspectives[entry.id].line);
  for(const lang of ['en','es','pt'])
   assert.equal(entry.count[lang],scene.perspectives[entry.id].examples[lang].length);
  const matches=r.rows.filter(x=>x.experienceId===scene.id&&x.perspective===entry.id);
  assert.equal(matches.length,5);
  for(const rec of matches){
   const f=functionsMatrix.cells.find(c=>c.experienceId===scene.id&&c.functionId===rec.functionId);
   assert.ok(f);
   for(const lang of ['en','es','pt']){
    assert.deepEqual(rec.sourcePerspectiveExamples[lang],scene.perspectives[entry.id].examples[lang]);
    assert.equal(rec.sourceFunctionExample[lang],f.example[lang]);
   }
   assert.equal(rec.synthesizedAnswer,null);assert.equal(rec.assessmentAuthority,false);
   assert.equal(rec.evidenceProduced,false);assert.equal(rec.greenPass,false);
  }
 }
}
assert.equal(r.rows.filter(x=>x.experienceId==='after-dinner-conversation'&&x.perspective==='concluding').every(x=>x.exampleTense==='past'),true);
const tampered=structuredClone(experiences);
tampered[0].perspectives.describing.line='blue';
assert.equal(project({mirror,functionsMatrix,experiences:tampered}),null);
const other=structuredClone(functionsMatrix);other.cells[0].assessmentAuthority=true;
assert.equal(project({mirror,functionsMatrix:other,experiences}),null);
assert.equal(mirror.compatibility.noAssessmentByNarrativeConclusion,true);
assert.equal(mirror.compatibility.existenceAutonomous,true);
assert.equal(mirror.compatibility.questionWordPrerequisite,false);
assert.equal(mirror.republishedUserImages,false);
assert.equal(r.createsEvidence,false);assert.equal(r.grantsGreenPass,false);
assert.equal(JSON.stringify(experiences),raw);
console.log('PASS H14.8: 16 canonical PERSPECTIVE slots, 20 Master-function candidates, 80 reference-only crossings; EN/ES/PT; zero scoring');
