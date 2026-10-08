#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let location='shopping-for-dinner',sessionOrigin='shopping-for-dinner',language='pt',activations=0,clears=0;
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
  status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',
  nextDecision:{skill:'which.use.determiner'}
};
let pending={status:'S2_ACTIVATION_PENDING',activationAuthorized:false,occurrenceId:'next-1',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',authorization};
const session={decision:{experienceId:'shopping-for-dinner'}};
let synchronized=null;
const root={
  SIYAYOVerbExplorerExperienceRuntime:{adoptAssessmentPresentation(skill){synchronized=skill;}},
  document:doc,
  SIYAYOVerbExplorerPendingTransitionAuthority:{get:()=>pending,clear(id){assert.equal(id,'next-1');clears++;pending=null;return true;}},
  SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>({currentExperienceId:location,experienceLanguage:language})},
  SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>({session})},
  SIYAYOVerbExplorerCanonicalSkillSource:{getSkill:()=> 'which.use.determiner',getPassContract:()=>({requiredEvidence:[]})},
  SIYAYOVerbExplorerNextAssessmentTarget:{prepare(input){
    assert.equal(input.learnerEvent.intent,'continue-assessment');
    return Promise.resolve({authorization:input.authorization,passContract:{requires:[]},
      previousDefinition:{id:'which.use.determiner'},target:{skill:'what.use.object-question'}});
  }},
  SIYAYOVerbExplorerExperienceNavigation:{getExperience:()=>({id:'preparing-dinner'})},
  SIYAYOVerbExplorerWhatAssessmentLive:{mount:()=>true},
  SIYAYOVerbExplorerPedagogicalSessionAdoption:{activate(input){
    assert.equal(input.learnerEvent.source,'pedagogical-session-adopt');
    assert.equal(input.learnerEvent.experienceId,'preparing-dinner');
    activations++;sessionOrigin='preparing-dinner';session.decision={experienceId:sessionOrigin};return {status:'S2_ACTIVE',skill:'what.use.object-question',experienceId:'preparing-dinner'};
  }}
};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-pedagogical-session-adoption-surface.js','utf8'),{globalThis:root,Object});
const surface=root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface;
assert.equal(surface.install({document:doc}),true);
assert.equal(button.hidden,true);
assert.equal(note.hidden,true);
location='preparing-dinner';
assert.equal(activations,0,'arrival alone must not adopt');
surface.install({document:doc});
assert.equal(button.hidden,false);
assert.match(note.textContent,/S1 ● concluída → S2 ○ exploração livre/);
assert.match(button.textContent,/COMEÇAR MEU PROGRESSO AQUI/);
button.click();
setImmediate(()=>{
  assert.equal(activations,1);
  assert.equal(synchronized,"what.use.object-question");
  assert.equal(clears,1);
  assert.equal(button.hidden,true);
  assert.equal(note.hidden,true);
  console.log('S2 adoption surface: PASS');
});
