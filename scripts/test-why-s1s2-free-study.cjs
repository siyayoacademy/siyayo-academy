'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('js/verb-explorer-why-assessment-live.js','utf8');
const experiences=JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8')).items;
function node(tag){
 return {tag,children:[],attributes:{},hidden:false,textContent:'',appendChild(child){this.children.push(child);return child},
 setAttribute(k,v){this.attributes[k]=v},insertBefore(child){this.children.push(child)},
 querySelector(){return null},
 querySelectorAll(selector){let out=[];const scan=n=>{for(const c of n.children){if(selector==='.why-probe-option'&&c.className==='why-probe-option')out.push(c);scan(c)}};scan(this);return out},
 addEventListener(k,fn){(this.handlers||(this.handlers={}))[k]=fn}};
}
function makeDom(){
 const view=node('section');view.id='experienceView';const doc={createElement:node,getElementById(id){if(id==='experienceView')return view;return view.children.find(c=>c.id===id)||null}};return doc;
}
const calls=[],root={};root.globalThis=root;
let selected='why',state={experienceTense:'present',experienceForm:'affirmative'};
root.SIYAYOVerbExplorerExperienceRuntime={activeQuestionWord(){return selected},speak(){}};
root.SIYAYOVerbExplorerAdaptiveStateBridge={getState(){return state}};
root.SIYAYOPatitaInteractionTrail={recordOutcome(x){calls.push(x)}};
const context=vm.createContext(root);
vm.runInContext(source,context,{filename:'why-assessment-live.js'});
const live=root.SIYAYOVerbExplorerWhyAssessmentLive;
for(const exp of experiences.filter(e=>['shopping-for-dinner','preparing-dinner'].includes(e.id))){
 for(const lang of ['en','es','pt']){
  state={experienceTense:'present',experienceForm:'affirmative'};selected='why';
  const document=makeDom();assert.equal(live.mount({document,experience:exp,language:lang}),true);
  const panel=document.getElementById('whyAssessmentPanel');
  assert.equal(panel.hidden,false);
  const names=panel.children.flatMap(c=>c.children||[]);
  assert.ok(names.some(n=>n.className==='why-probe-question'),'Missing free WHY question '+exp.id+' '+lang);
  const answers=panel.querySelectorAll('.why-probe-option');
  assert.equal(answers.length,2);
  assert.ok(panel.children.some(n=>/FREE|LIBRE|LIVRE/.test(n.textContent)),'No free-only disclosure');
  assert.equal(calls.length,0);
  answers[0].handlers.click();assert.equal(calls.length,1);
  assert.equal(calls[0].source,'why-exploration');assert.equal(calls[0].experienceId,exp.id);
  assert.equal(calls[0].language,lang);assert.equal(calls[0].questionWord,'why');
  calls.length=0;
  state={experienceTense:'past',experienceForm:'negative'};
  assert.equal(live.mount({document,experience:exp,language:lang}),true);
  assert.equal(document.getElementById('whyAssessmentPanel').querySelectorAll('.why-probe-option').length,0,
   'Unapproved tense/mode must not show contextual responses');
  assert.equal(calls.length,0);
  selected='what';assert.equal(live.mount({document,experience:exp,language:lang}),false);
  assert.equal(document.getElementById('whyAssessmentPanel').hidden,true);
 }
}
assert.ok(!source.slice(source.indexOf('function mountEarlyWhyStudy'),source.indexOf('// Canonical presentation-only fallback')).includes('submitObservedAttempt'));
console.log('PASS WHY S1/S2 × EN ES PT: no NICK; 2 authored choices; PATITA only; no credit; tense/mode gated; QW switching');
