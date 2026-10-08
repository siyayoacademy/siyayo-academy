#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs');
const seeds=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const s4=seeds.find(x=>x.id==='after-dinner-conversation');
const why=s4.thinkingMind.find(q=>q.questionWord==='why');
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
  assert.ok(structure.tokens.some(t=>t.id==='enjoy'));
  assert.ok(structure.relations.some(r=>r.head==='enjoy'&&r.dependent==='why'&&r.relation==='advmod'));
  assert.equal(why.dependencyFocus.defaultFocus,'enjoy');
  assert.equal(why.dependencyHeadProbe.structureIds[language],id);
  assert.equal(why.dependencyHeadProbe.targetTokenId,'why');
  assert.ok(why.dependencyHeadProbe.alternativeTokenIdsByLanguage[language].includes('enjoy'));
}
const pt=JSON.parse(fs.readFileSync('data/learning/dependencies/after-dinner-why-pt.json','utf8'));
assert.ok(pt.relations.some(r=>r.head==='enjoy'&&r.dependent==='conversation'&&r.relation==='obl'),
  'Portuguese gostar de complement must remain prepositional/oblique rather than copied as EN/ES direct object');
console.log('PASS — S4 WHY EN/ES/PT Dependency Focus grounds WHY -> main verb, preserves PT gostar de as oblique complement, and makes no assessment claim.');
