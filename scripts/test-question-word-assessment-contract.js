#!/usr/bin/env node
const assert=require('node:assert/strict');
const Contract=require('../js/question-word-assessment-contract.js');
const capabilities=require('../data/learning/question-word-capabilities.json');
const seeds=require('../data/learning/experience-seeds.json').items;
function cap(word){const item=capabilities.canonical.find(x=>x.questionWord===word);return {questionWord:word,skill:item.skill,opportunityOnly:true,evidenceProduced:false};}

const shopping=seeds.find(x=>x.id==='shopping-for-dinner');
const what=shopping.thinkingMind.find(x=>x.questionWord==='what');
const which=shopping.thinkingMind.find(x=>x.questionWord==='which');
const where=shopping.thinkingMind.find(x=>x.questionWord==='where');

for(const q of [what,which]){
 const c=Contract.inspect(q,cap(q.questionWord));
 assert.equal(c.status,'ASSESSMENT_DECLARED');
 assert.equal(c.assessmentDeclared,true);
 assert.equal(c.automaticPromotion,false);
 assert.ok(c.assessmentSkill);
 assert.ok(c.definitionPath);
}
const whereContract=Contract.inspect(where,cap('where'));
assert.equal(whereContract.status,'OPPORTUNITY_ONLY');
assert.equal(whereContract.capabilitySkill,'where.identify.place');
assert.equal(whereContract.assessmentSkill,null);
assert.equal(Contract.targetForSelection(where,cap('where')),null,'WHERE capability must not become assessment without assessmentTarget');

const fakeWhere={...where,assessmentTarget:{skill:'where.identify.place',definitionPath:'data/learning/skills/where.json'}};
const explicit=Contract.inspect(fakeWhere,cap('where'));
assert.equal(explicit.status,'ASSESSMENT_DECLARED','an explicit declaration may create an assessment boundary later');
assert.equal(explicit.assessmentSkill,'where.identify.place');

assert.equal(Contract.inspect(what,{...cap('what'),opportunityOnly:false}),null);
assert.equal(Contract.inspect(what,cap('why')),null);
assert.equal(Contract.inspect({questionWord:'what',assessmentTarget:{skill:'',definitionPath:'x'}},cap('what')).status,'OPPORTUNITY_ONLY');
assert.equal(Contract.inspect({questionWord:'what',assessmentTarget:{skill:'a',definitionPath:'a'},assessmentResumeTarget:{skill:'b',definitionPath:'b'}},cap('what')),null);

console.log('PASS — capability remains opportunity-only; assessment requires an explicit target and is never inferred.');
