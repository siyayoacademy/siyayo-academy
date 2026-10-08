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
    if(x.id==='shopping-for-dinner')assert.deepEqual(q.assessmentTarget,{
      skill:'where.use.location-question',definitionPath:'data/learning/skills/where.json'
    },'only Shopping explicitly starts the WHERE location pilot');
    else assert.equal(q.assessmentTarget,undefined,x.id+' WHERE remains exploration-only');
    if(x.id==='preparing-dinner')assert.deepEqual(q.assessmentResumeTarget,{
      skill:'where.use.location-question',definitionPath:'data/learning/skills/where.json'
    },'Preparing only recovers the retained Shopping WHERE circuit');
    else assert.equal(q.assessmentResumeTarget,undefined,x.id+' WHERE must not masquerade as recovery');
  }
}
const shopping=dinner.find(x=>x.id==='shopping-for-dinner').thinkingMind.find(q=>q.questionWord==='where');
const preparing=dinner.find(x=>x.id==='preparing-dinner').thinkingMind.find(q=>q.questionWord==='where');
const going=college.find(x=>x.id==='going-to-college').thinkingMind.find(q=>q.questionWord==='where');
assert.ok(shopping.dialogueForms,'Shopping WHERE is the current dialogue reference');
assert.ok(preparing.dialogueForms,'Preparing WHERE now has grounded EN/ES/PT dialogueForms');
assert.deepEqual(shopping.dependencyFocus.structureIds,{en:'shopping-where-en',es:'shopping-where-es',pt:'shopping-where-pt'});
assert.equal(shopping.dependencyFocus.defaultFocus,'find');
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
console.log('PASS — the WHERE study map remains non-evaluative; only Shopping explicitly declares the location pilot, with no destination or College promotion.');
