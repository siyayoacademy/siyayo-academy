#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let location='preparing-dinner',language='pt',activations=0;
const button={hidden:true,addEventListener(type,handler){if(type==='click')this.click=handler;}};
const note={hidden:true,textContent:'',setAttribute(){}};
const heading={nextSibling:null};
const view={firstChild:null,insertBefore(){}};
const doc={
  getElementById(id){return id==='experienceView'?view:id==='continueAssessmentHere'?this.button:id==='assessmentAdoptionStatus'?this.note:null;},
  querySelector(){return heading;},
  createElement(){if(!this.button){this.button=button;return button;}this.note=note;return note;}
};
const authorization={
  status:'transition-authorized',fromExperience:'preparing-dinner',toExperience:'having-dinner',
  nextDecision:{skill:'what.use.object-question'}
};
let pending=null;
const session={decision:{experienceId:'preparing-dinner',skill:'what.use.object-question'}};
const root={
  document:doc,
  SIYAYOVerbExplorerPendingTransitionAuthority:{get:()=>pending},
  SIYAYOVerbExplorerVisitedSessionAdoptionAuthority:{inspect(){return location==='having-dinner'&&session.decision.skill==='what.use.object-question'?{session,skill:'what.use.object-question',toExperience:location}:null;},authorize(){return authorization;}},
  SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>({currentExperienceId:location,experienceLanguage:language})},
  SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>({session})},
  SIYAYOVerbExplorerCanonicalSkillSource:{getSkill:()=> 'what.use.object-question',getPassContract:()=>({requiredEvidence:[]})},
  SIYAYOVerbExplorerNextAssessmentTarget:{prepare(input){
    assert.equal(input.learnerEvent.intent,'continue-assessment');
    return Promise.resolve({authorization:input.authorization,passContract:{requires:[]},
      previousDefinition:{id:'what.use.object-question'},target:{skill:'why.use.contextual-reason'}});
  }},
  SIYAYOVerbExplorerExperienceNavigation:{getExperience:()=>({id:'having-dinner'})},
  SIYAYOVerbExplorerWhatAssessmentLive:{hide(){return true;}},
  SIYAYOVerbExplorerWhyAssessmentLive:{mount(){return true;}},
  SIYAYOVerbExplorerPedagogicalSessionAdoption:{activate(input){
    assert.equal(input.learnerEvent.source,'pedagogical-session-adopt');
    assert.equal(input.learnerEvent.experienceId,'having-dinner');
    activations++;session.decision={experienceId:'having-dinner',skill:'why.use.contextual-reason'};return {status:'S3_ACTIVE',skill:'why.use.contextual-reason',experienceId:'having-dinner'};
  }}
};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-pedagogical-session-adoption-surface.js','utf8'),{globalThis:root,Object});
const surface=root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface;
assert.equal(surface.install({document:doc}),true);
assert.equal(button.hidden,true);
assert.equal(note.hidden,true);
location='having-dinner';
assert.equal(activations,0,'arrival alone must not adopt');
surface.install({document:doc});
assert.equal(button.hidden,false);
assert.match(note.textContent,/S2 ● concluída → S3 ○ exploração livre/);
assert.match(button.textContent,/COMEÇAR MEU PROGRESSO AQUI/);
button.click();
setImmediate(()=>{
  assert.equal(activations,1);
  assert.equal(button.hidden,true);
  assert.equal(note.hidden,true);
  console.log('S3 adoption surface: PASS');
});
