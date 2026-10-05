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
assert.equal(preparing.dialogueForms,undefined,'Preparing WHERE still lacks dialogueForms');
assert.equal(shopping.dependencyFocus,undefined);
assert.equal(preparing.dependencyFocus,undefined);
assert.equal(shopping.answerGrounding,undefined);
assert.equal(preparing.answerGrounding,undefined);
assert.match(going.question.es,/Adónde/);
assert.match(going.question.pt,/Para onde/);
console.log('PASS — WHERE is mapped as spatial-target with location/destination contrast and remains assessment-free until grounded.');
