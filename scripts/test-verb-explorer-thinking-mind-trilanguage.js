#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
for(const experience of corpus.items){
  for(const q of experience.thinkingMind||[]){
    assert.ok(q.questionWord,'technical questionWord identity is required');
    assert.ok(q.questionWordLabel,'human question-word label is required');
    for(const language of ['en','es','pt']){
      assert.equal(typeof q.questionWordLabel[language],'string');
      assert.ok(q.questionWordLabel[language].trim(),experience.id+' '+q.questionWord+' '+language+' label must exist');
      assert.ok(q.question?.[language],experience.id+' '+q.questionWord+' '+language+' question must exist');
    }
  }
}
const shopping=corpus.items.find(x=>x.id==='shopping-for-dinner');
const which=shopping.thinkingMind.find(q=>q.questionWord==='which');
assert.deepEqual(which.questionWordLabel,{en:'WHICH',es:'QUÉ',pt:'QUAL'});
const preparing=corpus.items.find(x=>x.id==='preparing-dinner');
const preparingWhich=preparing.thinkingMind.find(q=>q.questionWord==='which');
assert.deepEqual(preparingWhich.questionWordLabel,{en:'WHICH',es:'QUÉ',pt:'QUAIS'});
assert.match(runtime,/q\.questionWordLabel\?\.\[experienceLanguage\]/);
console.log('Thinking Mind tri-language labels: PASS — technical identity stays stable while EN/ES/PT human forms follow each canonical Experience question.');
