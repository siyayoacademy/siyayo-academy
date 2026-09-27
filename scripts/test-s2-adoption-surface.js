#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
let location='shopping-for-dinner',activations=0,clears=0;
const button={hidden:true,addEventListener(type,handler){if(type==='click')this.click=handler;}};
const heading={nextSibling:null};
const view={firstChild:null,insertBefore(){}};
const doc={
  getElementById(id){return id==='experienceView'?view:id==='continueAssessmentHere'?this.button:null;},
  querySelector(){return heading;},
  createElement(){this.button=button;return button;}
};
const authorization={
  status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',
  nextDecision:{skill:'which.use.determiner'}
};
let pending={status:'S2_ACTIVATION_PENDING',activationAuthorized:false,occurrenceId:'next-1',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',authorization};
const root={
  document:doc,
  SIYAYOVerbExplorerPendingTransitionAuthority:{get:()=>pending,clear(id){assert.equal(id,'next-1');clears++;pending=null;return true;}},
  SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>({currentExperienceId:location,experienceLanguage:'en'})},
  SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>({session:{decision:{experienceId:'shopping-for-dinner'}}})},
  SIYAYOVerbExplorerCanonicalSkillSource:{getSkill:()=> 'which.use.determiner',getPassContract:()=>({requiredEvidence:[]})},
  SIYAYOVerbExplorerPedagogicalSessionAdoption:{activate(input){
    assert.equal(input.learnerEvent.source,'pedagogical-session-adopt');
    assert.equal(input.learnerEvent.experienceId,'preparing-dinner');
    activations++;return {status:'S2_ACTIVE'};
  }}
};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-pedagogical-session-adoption-surface.js','utf8'),{globalThis:root,Object});
const surface=root.SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface;
assert.equal(surface.install({document:doc}),true);
assert.equal(button.hidden,true);
location='preparing-dinner';
assert.equal(activations,0,'arrival alone must not adopt');
surface.install({document:doc});
assert.equal(button.hidden,false);
button.click();
assert.equal(activations,1);
assert.equal(clears,1);
assert.equal(button.hidden,true);
console.log('S2 adoption surface: PASS');
