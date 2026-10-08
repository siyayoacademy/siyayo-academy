#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const s3=seeds.find(x=>x.id==='having-dinner');
const what=s3.thinkingMind.find(q=>q.questionWord==='what');
assert.ok(what&&what.dependencyFocus&&what.dependencyHeadProbe);
assert.equal(what.assessmentTarget,undefined,'S3 WHAT remains transfer destination; no new assessment birth');
for(const language of ['en','es','pt']){
  const id=what.dependencyFocus.structureIds[language];
  const structure=JSON.parse(fs.readFileSync('data/learning/dependencies/'+id+'.json','utf8'));
  assert.equal(structure.language,language);
  assert.equal(structure.sentence,what.question[language]);
  assert.equal(structure.pedagogy.mode,'read-only-focus');
  for(const claim of ['learner-evidence','green-pass','mastery','progression','route'])
    assert.ok(structure.pedagogy.doesNotClaim.includes(claim));
  assert.ok(structure.tokens.some(t=>t.id==='what'));
  assert.ok(structure.tokens.some(t=>t.id==='eat'));
  assert.ok(structure.relations.some(r=>r.head==='eat'&&r.dependent==='what'&&r.relation==='obj'));
  assert.ok(structure.relations.some(r=>r.head==='eat'&&r.dependent==='first'&&r.relation==='advmod'));
  assert.equal(what.dependencyFocus.defaultFocus,'eat');
  assert.equal(what.dependencyHeadProbe.structureIds[language],id);
  assert.equal(what.dependencyHeadProbe.targetTokenId,'what');
  assert.ok(what.dependencyHeadProbe.alternativeTokenIdsByLanguage[language].includes('eat'));
}
console.log('PASS — S3 WHAT EN/ES/PT Dependency Focus grounds WHAT -> EAT as object, remains transfer-only, and makes no assessment claim.');
