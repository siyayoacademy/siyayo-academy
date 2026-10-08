#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const resolverCode=fs.readFileSync('js/thinking-mind-information-gap-resolver.js','utf8');
const capabilities=JSON.parse(fs.readFileSync('data/learning/question-word-capabilities.json','utf8'));
const dinner=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const college=JSON.parse(fs.readFileSync('data/learning/college-experience-seeds.json','utf8'));

const sandbox=vm.createContext({Object,Array});
sandbox.globalThis=sandbox;
vm.runInContext(resolverCode,sandbox,{filename:'js/thinking-mind-information-gap-resolver.js'});
const Resolver=sandbox.SIYAYOThinkingMindInformationGapResolver;

assert.ok(Resolver);
const expected={
  what:'thing-information',
  where:'place',
  when:'time',
  who:'person',
  which:'delimited-choice',
  why:'reason',
  how:'manner-method',
  'how-much':'amount-price'
};

for(const experience of [...dinner.items,...college.items]){
  const resolved=Resolver.resolveExperience(experience,capabilities);
  assert.equal(resolved.length,experience.thinkingMind.length,experience.id+' must resolve every declared Thinking Mind information gap');
  for(const {index,resolution} of resolved){
    const question=experience.thinkingMind[index];
    assert.equal(resolution.questionWord,question.questionWord);
    if(expected[question.questionWord])assert.equal(resolution.informationFocus,expected[question.questionWord]);
    assert.equal(resolution.opportunityOnly,true);
    assert.equal(resolution.evidenceProduced,false);
  }
}

assert.equal(Resolver.resolve({questionWord:'where',intention:'reason'},capabilities),null,'mismatched intention must fail closed');
assert.equal(Resolver.resolve({questionWord:'how-far',intention:'distance'},capabilities).informationFocus,'distance');
assert.equal(Resolver.resolve({questionWord:'how-many',intention:'count'},capabilities).informationFocus,'countable-quantity');
assert.equal(Resolver.resolve({questionWord:'whose',intention:'possession'},capabilities).informationFocus,'possession');
assert.equal(Resolver.resolve({questionWord:'whom',intention:'object-person'},capabilities).informationFocus,'object-person');
assert.equal(Resolver.resolve({questionWord:'how-long',intention:'duration'},capabilities).informationFocus,'duration-length');
assert.equal(Resolver.resolve({questionWord:'how-often',intention:'frequency'},capabilities).informationFocus,'frequency');
assert.equal(Resolver.resolve({questionWord:'how-old',intention:'age'},capabilities),null,'practical extension is not part of the canonical 14 resolver input');

console.log('Thinking Mind information gap resolver: PASS — Experience intention resolves canonical information focus without producing Evidence or inferring a new Question Word.');
