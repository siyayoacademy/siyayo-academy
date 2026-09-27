#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const capabilities=JSON.parse(fs.readFileSync('data/learning/question-word-capabilities.json','utf8'));
const experiences=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const sandbox=vm.createContext({Object,Array,Number});
sandbox.globalThis=sandbox;
for(const path of ['js/thinking-mind-information-gap-resolver.js','js/thinking-mind-runtime-decision.js']){
  vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
}
const runtime=sandbox.SIYAYOThinkingMindRuntimeDecision.create({capabilities});
assert.ok(runtime);
const shopping=experiences.find(x=>x.id==='shopping-for-dinner');
const initial=runtime.inspect(shopping,0);
assert.equal(initial.selectionAuthority,'learner');
assert.equal(initial.autoSelection,false);
assert.equal(initial.active.resolution.questionWord,'what');
assert.equal(initial.active.resolution.informationFocus,'thing-information');
assert.equal(initial.evidenceProduced,false);

const whereIndex=shopping.thinkingMind.findIndex(x=>x.questionWord==='where');
const chosen=runtime.choose(shopping,whereIndex);
assert.equal(chosen.selectedBy,'learner');
assert.equal(chosen.resolution.questionWord,'where');
assert.equal(chosen.resolution.informationFocus,'place');
assert.equal(chosen.evidenceProduced,false);

assert.equal(runtime.choose(shopping,999),null);
assert.equal(runtime.choose({id:'broken',thinkingMind:[{questionWord:'where',intention:'reason'}]},0),null);

console.log('Thinking Mind runtime decision: PASS — canonical opportunities are inspected, while the learner remains the only selection authority and no Evidence is produced.');
