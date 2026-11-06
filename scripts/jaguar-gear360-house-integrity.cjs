'use strict';
// JAGUAR · GEAR360 HOUSE INTEGRITY. A regression gate, not a claim that
// every planned Question Word has already been implemented.
const fs=require('node:fs'),assert=require('node:assert/strict');
const data=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const experiences=data.items||[];
const baseline={
 'shopping-for-dinner':{q:['what','where','how-much','which','why','who'],focus:['what','where','which','why'],head:['what','where','which','why']},
 'preparing-dinner':{q:['what','where','when','how','which','why','who'],focus:['what','where','which','why'],head:['what','where','which','why']},
 'having-dinner':{q:['what','who','how','why'],focus:['what','why'],head:['what','why']},
 'after-dinner-conversation':{q:['what','who','why','how'],focus:['why'],head:['why']}
};
const languages=['en','es','pt'];
for(const [id,expected] of Object.entries(baseline)){
 const exp=experiences.find(e=>e.id===id);
 assert.ok(exp,'STOP: Experience removed: '+id);
 const questions=exp.thinkingMind||[];
 const actual=questions.map(q=>q.questionWord);
 for(const qw of expected.q){
  assert.ok(actual.includes(qw),'STOP: known QW '+id+'/'+qw+' disappeared');
  const q=questions.find(x=>x.questionWord===qw);
  for(const lang of languages){
   assert.ok(typeof q.question?.[lang]==='string'&&q.question[lang].trim(),
    'STOP: translated question missing '+id+'/'+qw+'/'+lang);
   assert.ok(typeof q.questionWordLabel?.[lang]==='string'&&q.questionWordLabel[lang].trim(),
    'STOP: QW label missing '+id+'/'+qw+'/'+lang);
  }
 }
 for(const qw of expected.focus){
  assert.ok(questions.find(q=>q.questionWord===qw)?.dependencyFocus,
   'STOP: previously available Dependency Focus removed: '+id+'/'+qw);
 }
 for(const qw of expected.head){
  assert.ok(questions.find(q=>q.questionWord===qw)?.dependencyHeadProbe,
   'STOP: previously available Head Probe removed: '+id+'/'+qw);
 }
}
const s=fs.readFileSync('js/verb-explorer.js','utf8');
for(const name of ['renderDependencyFocus(x)','renderDependencyHeadProbe(x)','LearnerTrailSurface','PatitaInteractionTrail','questionGear']){
 assert.ok(s.includes(name),'STOP: shared Explorer connection lost '+name);
}
const html=fs.readFileSync('verb-explorer.html','utf8');
const sources=[...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m=>m[1]);
assert.ok(sources.length>=48,'STOP: incomplete Explorer script loader');
for(const name of ['dependencyFocusSurface','dependencyHeadProbePanel','learningTrailWordPathModule','learnerTrailSurface','questionGear']){
 assert.ok(html.includes(name),'STOP: Explorer container missing '+name);
}
assert.ok(s.includes('if(!structure||!focusId){surface.hidden=true'),
 'STOP: missing-data behavior changed; do not fabricate dependency graphs');
console.log('PASS GEAR360 house regression baseline: '+Object.keys(baseline).length+
 ' Experiences; '+Object.values(baseline).reduce((n,x)=>n+x.q.length,0)+
 ' QW placements; 3 languages; '+sources.length+' scripts; current focus/probe coverage preserved');
console.log('Known not-yet-authored modules are NOT treated as regressions.');
