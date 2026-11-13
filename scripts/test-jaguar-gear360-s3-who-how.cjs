'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const headProbe=require('../js/adaptive-dependency-head-probe-definition.js');
const catalog=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const exp=catalog.items.find(e=>e.id==='having-dinner');assert.ok(exp,'S3 missing');
let n=0;
for(const qw of ['who','how']){
 const q=exp.thinkingMind.find(q=>q.questionWord===qw);
 assert.ok(q?.dependencyFocus&&q?.dependencyHeadProbe,'S3 wiring missing '+qw);
 assert.ok(!q.assessmentTarget,'No new S3 assessment contract is authorized for '+qw);
 for(const language of ['en','es','pt']){
  const id='having-'+qw+'-'+language;
  const data=JSON.parse(fs.readFileSync('data/learning/dependencies/'+id+'.json','utf8'));
  assert.equal(data.id,id);assert.equal(data.language,language);
  assert.equal(data.sentence,q.question[language],'must preserve original corpus');
  assert.equal(data.pedagogy.mode,'read-only-focus');
  assert.ok(data.pedagogy.doesNotClaim.includes('green-pass'));
  assert.equal(q.dependencyFocus.structureIds[language],id);
  assert.equal(q.dependencyHeadProbe.structureIds[language],id);
  const expected=q.dependencyFocus.defaultFocusByLanguage[language];
  const tokens=new Map(data.tokens.map(t=>[t.id,t]));
  assert.equal(tokens.size,data.tokens.length,'duplicate token');
  for(const edge of data.relations){
   assert.ok(tokens.has(edge.head)&&tokens.has(edge.dependent),'invalid graph edge '+id);
  }
  for(const token of data.tokens)assert.ok(token.pedagogy?.wordType?.[language]&&token.pedagogy?.role?.[language],'missing contextual semantics '+id);
  assert.ok(tokens.has(expected),'invalid default focus '+id);
  const task=headProbe.create(data,{experienceId:exp.id,
   targetTokenId:q.dependencyHeadProbe.targetTokenId,
   prompt:q.dependencyHeadProbe.prompt[language],
   alternativeTokenIds:q.dependencyHeadProbe.alternativeTokenIdsByLanguage[language]});
  assert.ok(task,'invalid Head Probe '+id);
  assert.equal(task.expectedHeadTokenId,expected,'incorrect head relation '+id);
  n++;
 }
}
for(const qw of ['what','why']){
 const q=exp.thinkingMind.find(x=>x.questionWord===qw);
 assert.ok(q?.dependencyFocus&&q?.dependencyHeadProbe,'previous S3 specialization removed '+qw);
}
const runtime=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(runtime.includes('["who","how"].map(q=>"data/learning/dependencies/having-"'),'loader missing');
console.log('PASS S3 WHO/HOW 6 EN ES PT authored structures, canonical probes, existing WHAT/WHY and no assessment authority');
