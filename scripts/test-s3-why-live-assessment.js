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
// 90B: 89U introduced one speaker + one evaluative button inside EACH response row.
// The original flat options.children[0] is now a row wrapper, not an Attempt source.
function responseParts(probe){
  const options=probe.children.find(el=>el.className==='why-probe-options');
  assert.ok(options,'WHY possible responses component is present');
  const parts=options.children.map(row=>{
    assert.equal(row.className,'why-probe-response-row','full-width visual response row retained');
    const audio=row.children.find(item=>item.className==='why-probe-audio');
    const answer=row.children.find(item=>item.className==='why-probe-option');
    assert.ok(audio&&answer,'speaker and evaluative answer remain separate');
    assert.ok(audio.children.some(item=>item.className==='siyayo-speaker'),'speaker SVG retained');
    return {audio,answer};
  });
  assert.ok(parts.length>=2,'canonical alternatives must remain available');
  return parts;
}
function answer(probe,label){
  const btns=responseParts(probe).map(p=>p.answer);
  const button=label===undefined?btns[0]:btns.find(x=>x.textContent===label);
  assert.ok(button,'canonical response alternative found');
  return button;
}
assert.equal(live.mount({document:doc,experience:seeds[1],language:'pt'}),false,
  'S2 visit cannot mount the adopted S3 WHY probe');
assert.equal(live.mount({document:doc,experience:seeds[2],language:'pt'}),true);
let panel=byId.whyAssessmentPanel;
assert.equal(panel.children.filter(el=>el.className==='why-contextual-reason-probe').length,2);
let groups=panel.children.filter(el=>el.className==='why-contextual-reason-probe');
assert.match(groups[0].children[0].textContent,/palavra interrogativa/);
assert.match(groups[1].children[0].textContent,/por que/);
// Speech is presentation only; no Attempt, Evidence, or Green Pass.
groups[0].children[1].click();
responseParts(groups[0])[0].audio.click();
assert.equal(attempts.length,0,'listening does not create canonical evidence');
answer(groups[0]).click();
assert.equal(attempts.length,1);
assert.equal(attempts[0].dimension,'question-function');
answer(groups[1],'Porque a preparamos juntos.').click();
assert.equal(attempts.length,2);
assert.equal(attempts[1].dimension,'reason-answer');
assert.equal(attempts[1].result,'pass');
experienceId='after-dinner-conversation';
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),true);
groups=panel.children.filter(el=>el.className==='why-contextual-reason-probe');
assert.equal(groups.length,1);
assert.match(groups[0].children[0].textContent,/após o jantar/);
answer(groups[0],'Porque gostamos de conversar juntos.').click();
assert.equal(attempts.length,3);
assert.equal(attempts[2].mode,'transfer');
assert.equal(attempts[2].context.fromExperienceId,'having-dinner');
assert.equal(attempts[2].context.experienceId,'after-dinner-conversation');
assert.equal(panel.children.at(-1).textContent,'GREEN PASS · POR QUÊ confirmado');
let visualWord='why',badgeRefreshes=0;
sandbox.SIYAYOVerbExplorerExperienceRuntime={activeQuestionWord:()=>visualWord,
  refreshAssessmentHighlight(){badgeRefreshes++;}};
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),true);
const oldButton=answer(panel.children.find(el=>el.className==='why-contextual-reason-probe'));
const oldAudio=responseParts(panel.children.find(el=>el.className==='why-contextual-reason-probe'))[0].audio;
visualWord='where';oldButton.click();oldAudio.click();
assert.equal(attempts.length,3,'QWord drift blocks an old WHY response');
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),false);
assert.equal(panel.hidden,true);
visualWord='why';
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),true);
oldButton.click();assert.equal(attempts.length,3,'remount does not revive a detached old response');
answer(panel.children.find(el=>el.className==='why-contextual-reason-probe')).click();
assert.equal(attempts.length,4);assert.equal(badgeRefreshes,1);
active.session={decision:{skill:'which.use.determiner',experienceId:'having-dinner'}};
assert.equal(live.mount({document:doc,experience:seeds[3],language:'pt'}),false);
assert.equal(attempts.length,4);
console.log('PASS 90B — WHY responds only to evaluative buttons, preserving S3/S4 Attempt logic; speech and stale controls never credit.');
