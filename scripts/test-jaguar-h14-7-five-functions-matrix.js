#!/usr/bin/env node
const fs=require('node:fs'),assert=require('node:assert/strict');
const get=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const m=get('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json');
const source=get('data/learning/references/master-vip-verb-functions-v0.1.json');
const seeds=get('data/learning/experience-seeds.json').items;
const existence=get('data/learning/references/master-vip-existence-experience-candidates-v0.1.json').experienceCandidates;
const policy=get('data/learning/references/master-vip-source-fidelity-v0.1.json');
const langs=['en','es','pt'];
assert.equal(seeds.length,4);
assert.equal(m.functions.length,5);
assert.equal(m.cells.length,20);
assert.equal(m.architecture.qwsMandatory,false);
assert.deepEqual(new Set(m.functions.map(x=>x.id)),new Set(['quality','state','movement','action','existence']));
assert.equal(m.movementRules.original.includes('TO BE + VERB-ING'),true);
assert.equal(m.movementRules.complementary.includes('TO DO family'),true);
assert.equal(m.movementRules.grammarContrast.actionQuestion.startsWith('Do '),true);
assert.equal(m.movementRules.grammarContrast.progressive.startsWith('We are '),true);
assert.equal(m.originalEditorialReviews[0].status,'EDITORIAL_REVIEW_NOT_CORRECTION');
assert.equal(m.existenceRules.independentFromQWs,true);
for(const f of m.functions){
 const master=source.functions.find(x=>x.id===f.id);
 assert.ok(master,f.id+' absent in Master index');
 if(f.id==='movement'||f.id==='quality'||f.id==='state'||f.id==='existence')
  assert.equal(f.masterPattern,master.pattern,f.id+' wrong source anchor');
}
for(const e of seeds){
 const subset=m.cells.filter(x=>x.experienceId===e.id);
 assert.equal(subset.length,5,e.id);
 assert.equal(new Set(subset.map(x=>x.functionId)).size,5);
 for(const c of subset){
  assert.equal(c.status,'PENDING_HOMOLOGATION');
  assert.equal(c.provenance,'SIYAYO_ADAPTATION');
  assert.equal(c.notMasterQuotation,true);
  assert.equal(c.assessmentAuthority,false);
  assert.equal(c.assessmentEvidence,false);
  assert.equal(c.qwLinksNotPrerequisites,true);
  assert.ok(c.example.en&&c.example.es&&c.example.pt);
  assert.ok(c.qwLinksSuggested.every(qw=>e.thinkingMind.some(x=>x.questionWord===qw)),e.id+'/'+c.functionId+' links may not invent QWs');
  if(c.functionId==='action')assert.equal(c.sceneAssumption,'hypothetical-habit-not-established-in-scene');
  if(c.functionId==='existence'){
   const candidate=existence.find(x=>x.experienceId===e.id);
   assert.ok(candidate);
   for(const l of langs)assert.equal(c.example[l],candidate.examples[l],e.id+' '+l+' existence source drift');
   assert.equal(candidate.status,'PENDING_HOMOLOGATION');
  }
 }
}
assert.equal(policy.assessmentAuthority,false);
assert.equal(m.architecture.assessmentAuthority,false);
assert.equal(m.architecture.assessmentEvidence,false);
assert.equal(m.architecture.greenPass,false);
console.log('PASS H14.7 5 Master functions × 4 Experiences × EN/ES/PT = 20 reference cells; 4 EXISTENCE source candidates; zero evidence');
