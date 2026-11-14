'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const definition=require('../js/adaptive-dependency-head-probe-definition.js');
const corpus=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const exp=corpus.items.find(x=>x.id==='preparing-dinner');assert.ok(exp);
let total=0;
for(const word of ['when','how','who']){
 const q=exp.thinkingMind.find(q=>q.questionWord===word);
 assert.ok(q?.dependencyFocus&&q?.dependencyHeadProbe,'Missing S2 metadata '+word);
 assert.ok(!q.assessmentTarget,'Unauthorized S2 contract '+word);
 for(const lang of ['en','es','pt']){
  const id='preparing-'+word+'-'+lang;
  const d=JSON.parse(fs.readFileSync('data/learning/dependencies/'+id+'.json','utf8'));
  assert.equal(d.id,id);assert.equal(d.language,lang);assert.equal(d.sentence,q.question[lang]);
  assert.equal(d.pedagogy.mode,'read-only-focus');
  assert.ok(d.pedagogy.doesNotClaim.includes('green-pass'));
  assert.equal(q.dependencyFocus.structureIds[lang],id);
  assert.equal(q.dependencyHeadProbe.structureIds[lang],id);
  const tokens=new Map(d.tokens.map(t=>[t.id,t]));
  assert.equal(tokens.size,d.tokens.length,'Duplicate token '+id);
  for(const token of d.tokens)assert.ok(token.pedagogy?.wordType?.[lang]&&token.pedagogy?.role?.[lang],'Token pedagogy missing '+id);
  for(const edge of d.relations)assert.ok(tokens.has(edge.head)&&tokens.has(edge.dependent),'Graph edge invalid '+id);
  const task=definition.create(d,{experienceId:exp.id,targetTokenId:q.dependencyHeadProbe.targetTokenId,
    prompt:q.dependencyHeadProbe.prompt[lang],
    alternativeTokenIds:q.dependencyHeadProbe.alternativeTokenIdsByLanguage[lang]});
  assert.ok(task,'Head Probe invalid '+id);
  assert.equal(task.expectedHeadTokenId,q.dependencyFocus.defaultFocus,'Wrong contextual head '+id);
  total++;
 }
}
for(const word of ['what','where','which','why']){const q=exp.thinkingMind.find(x=>x.questionWord===word);assert.ok(q?.dependencyFocus&&q?.dependencyHeadProbe,'Regression '+word);}
const source=fs.readFileSync('js/verb-explorer.js','utf8');
assert.ok(source.includes('["when","how","who"].map(q=>"data/learning/dependencies/preparing-"'),'Missing loader');
console.log('PASS S2 9/9 WHEN HOW WHO canonical graphs + prior QWs, no assessment authority');
