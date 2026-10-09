#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
const skill=require('../data/learning/skills/why.json');
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
sandbox.AdaptiveWhyContextualReasonProbeSpecificationSource=require('../js/adaptive-why-contextual-reason-probe-specification-source.js');
sandbox.AdaptiveWhyContextualReasonProbeResult=require('../js/adaptive-why-contextual-reason-probe-result.js');
sandbox.AdaptiveWhyContextualReasonProbeEvidenceBridge=require('../js/adaptive-why-contextual-reason-probe-evidence-bridge.js');
sandbox.AdaptiveWhyContextualReasonProbeAttemptBoundary=require('../js/adaptive-why-contextual-reason-probe-attempt-boundary.js');
sandbox.SIYAYOVerbExplorerCanonicalSkillSource={getDefinition:()=>skill};
sandbox.SIYAYOVerbExplorerExperienceNavigation={getExperience:id=>seeds.find(e=>e.id===id)};
let experienceId='having-dinner';
sandbox.SIYAYOVerbExplorerAdaptiveStateBridge={getState:()=>({currentExperienceId:experienceId,experienceLanguage:'pt'})};
const active={session:{decision:{skill:skill.id,experienceId:'having-dinner'}}};
const attempts=[];
sandbox.SIYAYOVerbExplorerAdaptiveCoordinator={
  snapshot:()=>active,
  submitObservedAttempt(attempt,event){
    assert.equal(attempt.occurrenceId,event.occurrenceId);
    attempts.push(attempt);
    return {cycleResult:{contractEvaluation:{status:attempts.length===3?'GREEN_PASS':'IN_PROGRESS',satisfied:attempts.length===3}}};
  }
};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-why-assessment-live.js','utf8'),sandbox);
const live=sandbox.SIYAYOVerbExplorerWhyAssessmentLive;
assert.equal(live.mount({document:doc,experience:seeds[1],language:'pt'}),false,
  'S2 visit cannot mount the adopted S3 WHY probe');
assert.equal(live.mount({document:doc,experience:seeds[2],language:'pt'}),true);
let panel=byId.whyAssessmentPanel;
assert.equal(panel.children.filter(el=>el.className==='why-contextual-reason-probe').length,2);
let groups=panel.children.filter(el=>el.className==='why-contextual-reason-probe');
assert.match(groups[0].children[0].textContent,/palavra interrogativa/);
assert.match(groups[1].children[0].textContent,/por que/);
groups[0].children[2].children[0].click();
assert.equal(attempts.length,1);
assert.equal(attempts[0].dimension,'question-function');
groups[1].children[2].children.find(el=>el.textContent==='Porque a preparamos juntos.').click();
assert.equal(attempts.length,2);
assert.equal(attempts[1].dimension,'reason-answer');
assert.equal(attempts[1].result,'pass');
experienceId='after-dinner-conversation';
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),true);
groups=panel.children.filter(el=>el.className==='why-contextual-reason-probe');
assert.equal(groups.length,1);
assert.match(groups[0].children[0].textContent,/após o jantar/);
groups[0].children[2].children.find(el=>el.textContent==='Porque gostamos de conversar juntos.').click();
assert.equal(attempts.length,3);
assert.equal(attempts[2].mode,'transfer');
assert.equal(attempts[2].context.fromExperienceId,'having-dinner');
assert.equal(attempts[2].context.experienceId,'after-dinner-conversation');
assert.equal(panel.children.at(-1).textContent,'GREEN PASS · POR QUÊ confirmado');
let visualWord='why',badgeRefreshes=0;
sandbox.SIYAYOVerbExplorerExperienceRuntime={activeQuestionWord:()=>visualWord,
  refreshAssessmentHighlight(){badgeRefreshes++;}};
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),true);
const oldButton=panel.children.find(el=>el.className==='why-contextual-reason-probe').children[2].children[0];
visualWord='where';oldButton.click();
assert.equal(attempts.length,3,'QWord drift blocks an old WHY response');
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),false);
assert.equal(panel.hidden,true);
visualWord='why';
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),true);
oldButton.click();assert.equal(attempts.length,3,'remount does not revive a detached old response');
panel.children.find(el=>el.className==='why-contextual-reason-probe').children[2].children[0].click();
assert.equal(attempts.length,4);assert.equal(badgeRefreshes,1);
active.session={decision:{skill:'which.use.determiner',experienceId:'having-dinner'}};
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),false);
assert.equal(attempts.length,4);
console.log('PASS — WHY panel submits distinct S3 and S4 Attempts only for the active WHY Session.');
