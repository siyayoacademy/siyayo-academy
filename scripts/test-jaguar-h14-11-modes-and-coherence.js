#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const h=read('data/learning/references/jaguar-h14-11-mode-contextual-coherence-v0.1.json');
const prior=read('data/learning/references/jaguar-h14-10-first-two-practice-pilots-v0.1.json');
const seeds=read('data/learning/experience-seeds.json').items;
const master=read('data/learning/references/master-vip-verb-functions-v0.1.json');
const html=fs.readFileSync('labs/master-vip-mode-context-h14-11/index.html','utf8');
const embedded=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(embedded,'page must contain literal script for syntax check');
new vm.Script(embedded[1]);
assert.equal(h.tasks.length,2);
assert.deepEqual(h.languageOrder,['en','es','pt']);
assert.deepEqual(h.dimensions.modes,['affirmative','negative','interrogative']);
assert.equal(h.dimensions.tense,'PRESENT');assert.equal(h.dimensions.period,'NONE');
assert.equal(h.dimensions.pastNarrativeAnchorNotNewTenseExercise,true);
assert.equal(h.contracts.newLearnerAttempt,false);
assert.equal(h.contracts.newEvidence,false);
assert.equal(h.contracts.newGreenPass,false);
assert.equal(h.gatePolicy.grammaticalWellFormedDoesNotImplySceneTruth,true);
assert.equal(h.gatePolicy.noAutomaticPerfectOrFuturePeriod,true);
for(const t of h.tasks){
 const old=prior.tasks.find(x=>x.id===t.id);
 const m=master.functions.find(x=>x.id===t.functionId);
 const e=seeds.find(x=>x.id===t.experienceId);
 assert.ok(old&&m&&e);
 assert.equal(t.masterPattern,m.pattern);
 assert.deepEqual(t.originalCanonicalPerspectiveExamples,e.perspectives[t.perspectiveId].examples);
 assert.deepEqual(t.originalH1410ReferenceAnswer,old.contextualPrompt.referenceAnswer);
 assert.equal(t.optionalQuestionWord,old.optionalQW.id);
 const g=t.grammaticalScope;
 assert.equal(g.masterPattern,m.pattern);
 assert.deepEqual(Object.keys(g.forms),['affirmative','negative','interrogative']);
 for(const [mode,v] of Object.entries(g.forms)){
  for(const lang of h.languageOrder){
    assert.ok(v.sentence[lang]&&v.note[lang],t.id+'/'+mode+'/'+lang);
    assert.ok(html.includes(JSON.stringify(v.sentence[lang])),t.id+'/'+mode+'/'+lang+' absent from static HTML');
  }
  assert.ok(v.sceneStatus&&v.answerRole);
 }
 assert.deepEqual(g.forms.affirmative.sentence,old.contextualPrompt.referenceAnswer);
 assert.equal(g.forms.interrogative.answerRole,'YES_NO_QUESTION_NOT_AUTOMATIC_PROOF');
 assert.ok(g.forms.interrogative.referenceReply);
}
const s3=h.tasks.find(x=>x.functionId==='state').grammaticalScope.forms;
assert.equal(s3.negative.sceneStatus,'COUNTERFACTUAL_GRAMMAR_ONLY');
assert.equal(s3.negative.referenceReply,undefined);
const s2=h.tasks.find(x=>x.functionId==='movement').grammaticalScope.forms;
assert.equal(s2.negative.sceneStatus,'SCENE_SUPPORTED_CONTRAST_WITH_DIFFERENT_PREDICATE');
assert.ok(s2.negative.literalTransformationNotValidInScene);
for(const lang of h.languageOrder){
 assert.notEqual(s2.negative.sentence[lang],s2.negative.literalTransformationNotValidInScene[lang]);
 assert.notEqual(s3.interrogative.sentence[lang],s3.interrogative.referenceReply[lang]);
}
for(const token of ['data-task="0"','data-task="1"','data-mode="affirmative"','data-mode="negative"','data-mode="interrogative"','data-lang="en"','data-lang="es"','data-lang="pt"','id="draft"','aria-expanded'])assert.ok(html.includes(token),token);
for(const bad of [/fetch\s*\(/,/localStorage/,/sessionStorage/,/indexedDB/,/XMLHttpRequest/,/sendBeacon/,/WebSocket/,/\bsubmitObservedAttempt\b/])assert.doesNotMatch(html,bad);
console.log('PASS H14.11: 2 pilots × 3 modes × EN/ES/PT, time-context and polarity gate, grammar-only vs scene-grounded, no assessment');
