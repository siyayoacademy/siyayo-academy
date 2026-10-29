#!/usr/bin/env node
'use strict';
// Read-only WHY S1-S4 multilingual presentation contract. No learner attempts.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
const explorer=fs.readFileSync('js/verb-explorer.js','utf8');
const html=fs.readFileSync('verb-explorer.html','utf8');
assert.equal(corpus.length,4,'Expected four Experiences');
for(const [index,experience] of corpus.entries()){
 const questions=(experience.thinkingMind||[]).filter(q=>q.questionWord==='why');
 assert.equal(questions.length,1,'WHY must occur once at S'+(index+1));
 for(const lang of ['en','es','pt']){
  assert.ok(questions[0].question?.[lang], 'Missing WHY question S'+(index+1)+' '+lang);
  assert.ok(questions[0].questionWordLabel?.[lang], 'Missing WHY label S'+(index+1)+' '+lang);
 }
}
assert.match(explorer,/function experienceLines\(x\)/);
assert.match(explorer,/question\?\.questionWord==="why"/);
assert.match(explorer,/window\.SIYAYOVerbExplorerContextualCoherence/);
assert.match(explorer,/window\.SIYAYOVerbExplorerWhyAssessmentLive/);
assert.match(html,/src="js\/verb-explorer-contextual-coherence\.js"/);
assert.match(html,/src="js\/verb-explorer-why-assessment-live\.js"/);
console.log('WHY observational S1-S4 EN ES PT source coverage PASS; no live assessment asserted');
