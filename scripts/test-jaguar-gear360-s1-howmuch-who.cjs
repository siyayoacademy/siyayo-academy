'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const definition=require('../js/adaptive-dependency-head-probe-definition.js');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const exp=corpus.items.find(e=>e.id==='shopping-for-dinner');
assert.ok(exp,'Shopping Experience missing');
let total=0;
for(const word of ['how-much','who']){
 const q=exp.thinkingMind.find(q=>q.questionWord===word);
 assert.ok(q?.dependencyFocus&&q?.dependencyHeadProbe,'missing focus/probe '+word);
 assert.ok(!q.assessmentTarget,'S1 '+word+' must not create new assessment authorization');
 for(const lang of ['en','es','pt']){
  const id='shopping-'+word+'-'+lang;
  const d=JSON.parse(fs.readFileSync('data/learning/dependencies/'+id+'.json','utf8'));
  assert.equal(d.id,id);assert.equal(d.language,lang);assert.equal(d.sentence,q.question[lang]);
  assert.equal(d.pedagogy.mode,'read-only-focus');
  assert.ok(d.pedagogy.doesNotClaim.includes('green-pass'));
  assert.equal(q.dependencyFocus.structureIds[lang],id);
  assert.equal(q.dependencyHeadProbe.structureIds[lang],id);
  const tokens=new Map(d.tokens.map(t=>[t.id,t]));
  assert.equal(tokens.size,d.tokens.length,'duplicate token IDs '+id);
  for(const token of d.tokens)assert.ok(token.pedagogy?.wordType?.[lang]&&token.pedagogy?.role?.[lang],'missing word class/role '+id);
  for(const edge of d.relations)assert.ok(tokens.has(edge.head)&&tokens.has(edge.dependent),'broken dependency '+id);
  const head=q.dependencyFocus.defaultFocusByLanguage[lang];
  assert.ok(tokens.has(head),'focus head missing '+id);
  const task=definition.create(d,{experienceId:exp.id,targetTokenId:q.dependencyHeadProbe.targetTokenId,
   prompt:q.dependencyHeadProbe.prompt[lang],alternativeTokenIds:q.dependencyHeadProbe.alternativeTokenIdsByLanguage[lang]});
  assert.ok(task,'invalid canonical Head Probe '+id);
  assert.equal(task.expectedHeadTokenId,head,'QW/Head relationship mismatch '+id);
  total++;
 }
}
for(const qw of ['what','where','which','why']){
 const q=exp.thinkingMind.find(q=>q.questionWord===qw);
 assert.ok(q?.dependencyFocus&&q?.dependencyHeadProbe,'previous S1 specialty missing '+qw);
}
const loader=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(loader.includes('["how-much","who"].map(q=>"data/learning/dependencies/shopping-"'),'six new files missing from shared loader');
console.log('PASS S1 HOW MUCH/WHO: six EN ES PT graphs, canonical Head Probes, existing S1 structures, no new credit');
