#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const s3=seeds.find(x=>x.id==='having-dinner');
const why=s3.thinkingMind.find(q=>q.questionWord==='why');
assert.ok(why&&why.dependencyFocus&&why.dependencyHeadProbe);
for(const language of ['en','es','pt']){
  const id=why.dependencyFocus.structureIds[language];
  const structure=JSON.parse(fs.readFileSync('data/learning/dependencies/'+id+'.json','utf8'));
  assert.equal(structure.language,language);
  assert.equal(structure.sentence,why.question[language]);
  assert.equal(structure.pedagogy.mode,'read-only-focus');
  for(const claim of ['learner-evidence','green-pass','mastery','progression','route'])
    assert.ok(structure.pedagogy.doesNotClaim.includes(claim));
  assert.ok(structure.tokens.some(t=>t.id==='why'));
  assert.ok(structure.tokens.some(t=>t.id==='special'));
  assert.ok(structure.relations.some(r=>r.head==='special'&&r.dependent==='why'&&r.relation==='advmod'));
  assert.equal(why.dependencyFocus.defaultFocus,'special');
  assert.equal(why.dependencyHeadProbe.structureIds[language],id);
  assert.equal(why.dependencyHeadProbe.targetTokenId,'why');
  assert.ok(why.dependencyHeadProbe.alternativeTokenIdsByLanguage[language].includes('special'));
}
console.log('PASS — S3 WHY EN/ES/PT Dependency Focus grounds WHY -> SPECIAL as read-only syntax with its own diagnostic and no assessment claim.');
