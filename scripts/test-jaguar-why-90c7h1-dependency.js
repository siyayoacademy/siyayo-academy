#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const Definition=require('../js/adaptive-dependency-head-probe-definition.js');
const catalog=require('../data/learning/experience-seeds.json').items;
for(const exp of ['shopping-for-dinner','preparing-dinner']){
 const q=catalog.find(x=>x.id===exp).thinkingMind.find(x=>x.questionWord==='why');
 assert.ok(q.presentationGrounding);assert.equal(q.presentationGrounding.assessmentAuthority,false);
 assert.equal(q.assessmentTarget,undefined);
 for(const lang of ['en','es','pt']){
  const id=q.dependencyFocus.structureIds[lang],s=JSON.parse(fs.readFileSync('data/learning/dependencies/'+id+'.json','utf8'));
  assert.equal(s.id,id);assert.equal(s.language,lang);assert.equal(s.pedagogy.assessmentAuthority,false);
  const d=Definition.create(s,{experienceId:exp,targetTokenId:'why',prompt:q.dependencyHeadProbe.prompt[lang],alternativeTokenIds:q.dependencyHeadProbe.alternativeTokenIds});
  assert.ok(d,'missing canonical head probe '+id);assert.equal(d.result,undefined);
  assert.equal(d.expectedHeadTokenId,exp==='shopping-for-dinner'?'prefer':'preparing');
  const expected=exp==='shopping-for-dinner'?q.presentationGrounding.questionOverride[lang]:q.question[lang];
  assert.equal(s.sentence,expected,'DF must show same question as LINES');
 }
}
const app=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(app.includes('dependencies/shopping-why-'));
assert.ok(app.includes('dependencies/preparing-why-'));
console.log('PASS 90C.7H.1 WHY S1/S2 DF/DHP × EN ES PT; exploratory only; exact LINES provenance');
