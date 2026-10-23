#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('fs');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const resolver=require('../js/verb-explorer-contextual-coherence.js');
const cases=[
 ['shopping-for-dinner','Why do you prefer the fresh cheese?','Because the fresh, mild cheese pairs well with the salmon.'],
 ['preparing-dinner','Why are we preparing this dinner together?','Because preparing it together lets us share the experience.']
];
for(const [id,q,a] of cases){
 const entry=corpus.find(x=>x.id===id).thinkingMind.find(x=>x.questionWord==='why');
 assert.equal(entry.assessmentTarget,undefined);assert.equal(entry.assessmentResumeTarget,undefined);
 assert.equal(entry.presentationGrounding.assessmentAuthority,false);
 for(const language of ['en','es','pt']){
  const r=resolver.resolve({question:entry,language,tense:'present',form:'affirmative'});
  assert.equal(r.status,'grounded');assert.equal(r.exploratory,true);assert.equal(r.assessmentEvidence,false);assert.equal(r.greenPass,false);
  assert.ok(r.question.length>10&&r.response.length>20);
  for(const tense of ['past','future']) assert.equal(resolver.resolve({question:entry,language,tense,form:'affirmative'}).status,'not-authored');
  for(const form of ['negative','interrogative']) assert.equal(resolver.resolve({question:entry,language,tense:'present',form}).status,'not-authored');
 }
 const en=resolver.resolve({question:entry,language:'en',tense:'present',form:'affirmative'});
 assert.equal(en.question,q);assert.equal(en.response,a);
}
for(const id of ['having-dinner','after-dinner-conversation']){
 const entry=corpus.find(x=>x.id===id).thinkingMind.find(x=>x.questionWord==='why');
 assert.equal(entry.presentationGrounding,undefined);
 assert.equal(resolver.resolve({question:entry,language:'en',tense:'present',form:'affirmative'}).exploratory,undefined);
}
const source=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(source.indexOf('question?.presentationGrounding')<source.indexOf('if(question?.dialogueForms)'), 'WHY exploration must precede generic dialogue forms');
console.log('PASS 90C.6 WHY PRESENT 4 Experiences × EN/ES/PT: S1/S2 free, S3/S4 assessed intact');
