#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const fn=require('./jaguar-h14-18-function-window-contract.js');
const mirror=require('./jaguar-h14-13-specialized-mirror-reference.js');
const design=read('data/learning/references/jaguar-h14-18-function-window-design-v0.1.json');
const experiences=read('data/learning/experience-seeds.json').items;
const matrix=read('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json');
const master=read('data/learning/references/master-vip-verb-functions-v0.1.json');
const review=read('data/learning/references/jaguar-h14-9-semantic-80-review-v0.1.json');
const sources={experiences,matrix,master,review,mirror};
const counts={SOURCE_CLOSE:0,BRIDGE:0,CONTRAST:0};
let tested=0;
for(const exp of experiences)for(const cell of matrix.cells.filter(x=>x.experienceId===exp.id))for(const perspective of ['describing','narrating','debating','concluding']){
 for(const language of ['en','es','pt']){
  const s={experienceId:exp.id,functionId:cell.functionId,language,tense:'present',mode:'affirmative',period:null,wordType:'verb',perspective,questionWord:null};
  const snap=fn.snapshot(s),x=fn.inspect({selection:s,sources});
  assert.ok(snap&&x,JSON.stringify(s));assert.equal(snap.period,null);
  assert.equal(x.function.masterPattern,master.functions.find(v=>v.id===cell.functionId).pattern);
  assert.deepEqual(x.context.sourceLines,exp.perspectives[perspective].examples[language]);
  assert.equal(x.function.adaptationProvenance,'SIYAYO_ADAPTATION_PENDING_HOMOLOGATION');
  assert.equal(x.authority.evidence,false);assert.equal(x.authority.assessment,false);
  assert.equal(x.function.adaptedExample,cell.tense==='present'||cell.tense==='present-habitual'?cell.example[language]:null);
  const blocked=fn.inspect({selection:{...s,mode:'negative'},sources});assert.ok(blocked);assert.equal(blocked.function.adaptedExample,null);
  assert.equal(fn.inspect({selection:{...s,period:'presentPerfect'},sources}),null);
  tested++;
 }
 counts[fn.inspect({selection:{experienceId:exp.id,functionId:cell.functionId,perspective,language:'en',tense:'present',mode:'affirmative'},sources}).fineStudy.review]++;
}
assert.equal(tested,240);assert.deepEqual(counts,{SOURCE_CLOSE:1,BRIDGE:57,CONTRAST:22});
assert.equal(fn.inspect({selection:{experienceId:experiences[0].id,functionId:'existence',language:'en',tense:'present',mode:'affirmative',perspective:null,questionWord:null},sources}).perspectiveFallbackDisplayOnly,true);
assert.equal(fn.snapshot({experienceId:experiences[0].id,language:'en',tense:'present',mode:'affirmative',perspective:'bad'}),null);
const html=fs.readFileSync('labs/func13-function-window-h14-18/index.html','utf8');
assert.equal((html.match(/data-function=/g)||[]).length,5);
assert.ok(html.includes('overflow-x:auto')&&html.includes('@media(max-width:650px)')&&html.includes('grid-template-columns:1fr'));
assert.ok(html.includes('OCULTO na navegação normal'));
for(const word of ['localStorage','sessionStorage','submitObservedAttempt','recordOutcome(','createEvidence('])assert.ok(!html.includes(word),word);
for(const script of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)])new vm.Script(script[1]);
assert.equal(design.hiddenInNormalExplorer,true);assert.equal(design.finalHtmlPlacement,'UNDECIDED');
assert.equal(design.period.currentExplorerGear,false);assert.equal(design.rules.noEvidence,true);
console.log('PASS H14.18: 80 relationships, 240 EN/ES/PT projections, independent Gear ownership, unsupported PERIOD blocked, module hidden, no evidence');
