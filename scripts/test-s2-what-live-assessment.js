#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
const nouns=require('../data/lexicon/nouns/nouns.json');
const skill=require('../data/learning/skills/what.json');
const byId={};
function node(tag){
  const item={tag,children:[],hidden:false,_html:'',dataset:{},handlers:{},
    set id(value){this._id=value;byId[value]=this;},get id(){return this._id;},
    set innerHTML(value){this._html=value;this.children=[];},get innerHTML(){return this._html;},
    appendChild(child){this.children.push(child);return child;},
    insertBefore(child){this.children.push(child);return child;},
    querySelector(){return null;},setAttribute(){},
    addEventListener(type,handler){this.handlers[type]=handler;},
    click(){if(this.handlers.click)this.handlers.click({target:this});}
  };return item;
}
const view=node('div');view.id='experienceView';
const doc={getElementById:id=>byId[id]||null,createElement:node};
const sandbox={Object,Array,Set,document:doc};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),sandbox);
sandbox.AdaptiveWhatObjectQuestionProbeSpecificationSource=require('../js/adaptive-what-object-question-probe-specification-source.js');
sandbox.AdaptiveWhatObjectQuestionProbeResult=require('../js/adaptive-what-object-question-probe-result.js');
sandbox.AdaptiveWhatObjectQuestionProbeEvidenceBridge=require('../js/adaptive-what-object-question-probe-evidence-bridge.js');
sandbox.AdaptiveWhatObjectQuestionProbeAttemptBoundary=require('../js/adaptive-what-object-question-probe-attempt-boundary.js');
sandbox.SIYAYOVerbExplorerCanonicalSkillSource={getDefinition:()=>skill};
sandbox.SIYAYOVerbExplorerExperienceNavigation={getExperience:id=>seeds.find(e=>e.id===id),getNouns:()=>nouns};
let experienceId='preparing-dinner';
sandbox.SIYAYOVerbExplorerAdaptiveStateBridge={getState:()=>({currentExperienceId:experienceId,experienceLanguage:'pt'})};
const active={session:{decision:{skill:skill.id,experienceId:'preparing-dinner'}}};
const attempts=[];
let adoptionInvitation=false;
sandbox.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface={install(){
  adoptionInvitation=attempts.length===3;return true;
}};
sandbox.SIYAYOVerbExplorerAdaptiveCoordinator={
  snapshot:()=>active,
  submitObservedAttempt(attempt,event){
    assert.equal(attempt.occurrenceId,event.occurrenceId);
    attempts.push(attempt);
    return {cycleResult:{contractEvaluation:{status:attempts.length===3?'GREEN_PASS':'IN_PROGRESS',satisfied:attempts.length===3}}};
  }
};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-what-assessment-live.js','utf8'),sandbox);
const live=sandbox.SIYAYOVerbExplorerWhatAssessmentLive;
assert.equal(live.mount({document:doc,experience:seeds[0],language:'pt'}),false,
  'S1 visit cannot mount the adopted S2 WHAT probe');
assert.equal(live.mount({document:doc,experience:seeds[1],language:'pt'}),true);
let panel=byId.whatAssessmentPanel;
assert.equal(panel.children.filter(el=>el.className==='what-object-question-probe').length,2);
let groups=panel.children.filter(el=>el.className==='what-object-question-probe');
assert.match(groups[0].children[0].textContent,/palavra interrogativa/);
assert.match(groups[1].children[0].textContent,/preparando/);
groups[0].children[2].children[0].click();
assert.equal(attempts.length,1);
assert.equal(attempts[0].dimension,'question-function');
groups[1].children[2].children.find(el=>el.textContent==='Estamos preparando tomates primeiro.').click();
assert.equal(attempts.length,2);
assert.equal(attempts[1].dimension,'object-answer');
assert.equal(attempts[1].result,'pass');
assert.equal(adoptionInvitation,false,'S3 adoption is not offered before transfer');
experienceId='having-dinner';
assert.equal(live.mount({document:doc,experience:seeds[2],language:'pt'}),true);
groups=panel.children.filter(el=>el.className==='what-object-question-probe');
assert.equal(groups.length,1);
assert.match(groups[0].children[0].textContent,/à mesa/);
groups[0].children[2].children.find(el=>el.textContent==='salmão').click();
assert.equal(attempts.length,3);
assert.equal(attempts[2].mode,'transfer');
assert.equal(attempts[2].context.fromExperienceId,'preparing-dinner');
assert.equal(attempts[2].context.experienceId,'having-dinner');
assert.equal(adoptionInvitation,true,'Green WHAT transfer refreshes the S3 adoption invitation');
assert.equal(panel.children.at(-1).textContent,'GREEN PASS · O QUE confirmado');
active.session={decision:{skill:'which.use.determiner',experienceId:'preparing-dinner'}};
assert.equal(live.mount({document:doc,experience:seeds[2],language:'pt'}),false);
assert.equal(attempts.length,3);
console.log('PASS — WHAT panel submits distinct S2 and S3 Attempts only for the active WHAT Session.');

