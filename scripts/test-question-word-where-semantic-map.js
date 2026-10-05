#!/usr/bin/env node
const assert=require('node:assert/strict');
const map=require('../data/learning/question-word-where-semantic-map.json');
const dinner=require('../data/learning/experience-seeds.json').items;
const college=require('../data/learning/college-experience-seeds.json').items;
assert.equal(map.status,'study-only');
assert.equal(map.assessmentSkill,null);
assert.equal(map.assessmentDeclared,false);
assert.equal(map.semanticFamily,'spatial-target');
assert.ok(map.subtypes.location);
assert.ok(map.subtypes.destination);
assert.ok(map.subtypes.destination.languageForms.es.includes('adónde'));
assert.ok(map.subtypes.destination.languageForms.pt.includes('para onde'));

for(const x of [...dinner,...college]){
  for(const q of (x.thinkingMind||[]).filter(q=>q.questionWord==='where')){
    assert.equal(q.assessmentTarget,undefined,x.id+' WHERE must remain exploration-only');
    assert.equal(q.assessmentResumeTarget,undefined,x.id+' WHERE must not masquerade as recovery');
  }
}
const shopping=dinner.find(x=>x.id==='shopping-for-dinner').thinkingMind.find(q=>q.questionWord==='where');
const preparing=dinner.find(x=>x.id==='preparing-dinner').thinkingMind.find(q=>q.questionWord==='where');
const going=college.find(x=>x.id==='going-to-college').thinkingMind.find(q=>q.questionWord==='where');
assert.ok(shopping.dialogueForms,'Shopping WHERE is the current dialogue reference');
assert.ok(preparing.dialogueForms,'Preparing WHERE now has grounded EN/ES/PT dialogueForms');
assert.equal(shopping.dependencyFocus,undefined,'Shopping WHERE dependency DNA remains a later grounding step');
assert.deepEqual(preparing.dependencyFocus.structureIds,{en:'preparing-where-en',es:'preparing-where-es',pt:'preparing-where-pt'});
assert.equal(preparing.dependencyFocus.defaultFocus,'put');
assert.equal(preparing.dependencyHeadProbe.targetTokenId,'where');
assert.deepEqual(preparing.dependencyHeadProbe.alternativeTokenIdsByLanguage.en,['should','put','vegetables']);
assert.equal(preparing.responses.en,'We should put the vegetables on the plate.');
assert.equal(preparing.responses.es,'Debemos poner las verduras en el plato.');
assert.equal(preparing.responses.pt,'Devemos colocar os legumes no prato.');
assert.equal(shopping.answerGrounding,undefined);
assert.equal(preparing.answerGrounding,undefined,'presentation grounding must not masquerade as assessment answerGrounding');
assert.match(going.question.es,/Adónde/);
assert.match(going.question.pt,/Para onde/);
console.log('PASS — WHERE is mapped as spatial-target with location/destination contrast and remains assessment-free until grounded.');
