'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const definition=require('../js/adaptive-dependency-head-probe-definition.js');
const structures=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const s4=structures.items.find(e=>e.id==='after-dinner-conversation');
let total=0;
for(const word of ['what','who','how']){
 const q=s4.thinkingMind.find(x=>x.questionWord===word);
 assert.ok(q?.dependencyFocus&&q?.dependencyHeadProbe,'Missing runtime wiring '+word);
 assert.ok(!q.assessmentTarget,'Unauthorized S4 assessment target '+word);
 for(const lang of ['en','es','pt']){
  const id='after-dinner-'+word+'-'+lang;
  const file='data/learning/dependencies/'+id+'.json';
  const structure=JSON.parse(fs.readFileSync(file,'utf8'));
  assert.equal(structure.id,id);
  assert.equal(structure.language,lang);
  assert.equal(structure.sentence,q.question[lang],'Question must match authored S4 corpus');
  assert.equal(structure.pedagogy.mode,'read-only-focus');
  assert.ok(structure.pedagogy.doesNotClaim.includes('green-pass'));
  assert.equal(q.dependencyFocus.structureIds[lang],id);
  assert.equal(q.dependencyHeadProbe.structureIds[lang],id);
  const tokens=new Map(structure.tokens.map(t=>[t.id,t]));
  assert.equal(tokens.size,structure.tokens.length);
  for(const edge of structure.relations){
   assert.ok(tokens.has(edge.head)&&tokens.has(edge.dependent),'Broken graph relation '+id);
  }
  assert.ok(tokens.has(q.dependencyFocus.defaultFocus));
  const choices=q.dependencyHeadProbe.alternativeTokenIdsByLanguage[lang];
  const task=definition.create(structure,{
   experienceId:s4.id,
   targetTokenId:q.dependencyHeadProbe.targetTokenId,
   prompt:q.dependencyHeadProbe.prompt[lang],
   alternativeTokenIds:choices});
  assert.ok(task,'Invalid canonical Head Probe '+id);
  assert.ok(choices.includes(task.expectedHeadTokenId));
  assert.equal(task.expectedHeadTokenId,q.dependencyFocus.defaultFocus);
  assert.ok(structure.tokens.every(t=>t.pedagogy?.wordType?.[lang]&&t.pedagogy?.role?.[lang]),'Missing token pedagogy '+id);
  total++;
 }
}
const why=s4.thinkingMind.find(q=>q.questionWord==='why');
assert.ok(why.dependencyFocus&&why.dependencyHeadProbe);
assert.ok(!why.assessmentTarget);
console.log('PASS S4 WHAT/WHO/HOW: '+total+' EN/ES/PT dependency graphs, authored forms, canonical Head Probe answers, no assessment authority; WHY preserved');
