#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const which=require('../data/learning/skills/which.json');
const corpus=require('../data/learning/experience-seeds.json');
const nouns=require('../data/lexicon/nouns/nouns.json');
const shopping=corpus.items.find(item=>item.id==='shopping-for-dinner');
const preparing=corpus.items.find(item=>item.id==='preparing-dinner');
const listeners=[];
const container={innerHTML:'',addEventListener(name,handler){if(name==='click')listeners.push(handler);}};
const feedback={hidden:true,textContent:''};
const panel={hidden:true,dataset:{}};
const view={};
const nodes={
  experienceView:view,determinerUseAssessmentPanel:panel,
  determinerUseAssessmentOptions:container,determinerUseAssessmentFeedback:feedback
};
const doc={getElementById:id=>nodes[id]||null};
let state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'};
const session={decision:{skill:'which.use.determiner',experienceId:'shopping-for-dinner'}};
let attempts=[];
let assessment={session};
let navigationCalls=0;
let trailCalls=0;
const root=vm.createContext({
  Object,Date,document:doc,
  SIYAYOVerbExplorerAdaptiveCoordinator:{
    snapshot:()=>assessment,
    submitObservedAttempt(attempt,event){
      attempts.push({attempt,event});
      return {cycleResult:{contractEvaluation:{status:'WAITING_FOR_EVIDENCE',satisfied:false}}};
    }
  },
  SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>state},
  SIYAYOVerbExplorerCanonicalSkillSource:{getDefinition:()=>which},
  SIYAYOVerbExplorerExperienceNavigation:{
    getExperience:id=>corpus.items.find(item=>item.id===id)||null,
    getNouns:()=>nouns,goToExperience:()=>{navigationCalls++;}
  },
  AdaptiveAttemptLoop:{toEvidencePacket:()=>null},
  AdaptiveDeterminerUseProbeSpecificationSource:require('../js/adaptive-determiner-use-probe-specification-source.js'),
  AdaptiveDeterminerUseProbePresenter:require('../js/adaptive-determiner-use-probe-presenter.js'),
  AdaptiveDeterminerUseProbeResult:require('../js/adaptive-determiner-use-probe-result.js'),
  AdaptiveDeterminerUseProbeEvidenceBridge:require('../js/adaptive-determiner-use-probe-evidence-bridge.js'),
  AdaptiveDeterminerUseProbeAttemptBoundary:require('../js/adaptive-determiner-use-probe-attempt-boundary.js'),
  SIYAYODeterminerUseProbeSupportSensor:require('../js/adaptive-determiner-use-probe-support-sensor.js').create(),
  AdaptiveDeterminerUseTransferProbeSpecificationSource:require('../js/adaptive-determiner-use-transfer-probe-specification-source.js'),
  AdaptiveDeterminerUseTransferProbePresenter:require('../js/adaptive-determiner-use-transfer-probe-presenter.js'),
  AdaptiveDeterminerUseTransferProbeResult:require('../js/adaptive-determiner-use-transfer-probe-result.js'),
  AdaptiveDeterminerUseTransferProbeEvidenceBridge:require('../js/adaptive-determiner-use-transfer-probe-evidence-bridge.js'),
  AdaptiveDeterminerUseTransferProbeAttemptBoundary:require('../js/adaptive-determiner-use-transfer-probe-attempt-boundary.js'),
  SIYAYODeterminerUseTransferProbeSupportSensor:require('../js/adaptive-determiner-use-transfer-probe-support-sensor.js').create(),
  SIYAYOVerbExplorerLearnerTrailSurface:{refresh:()=>{trailCalls++;}},
  SIYAYOVerbExplorerPedagogicalSessionAdoptionSurface:{install:()=>true}
});
root.globalThis=root;
for(const path of [
  'js/verb-explorer-learner-event.js',
  'js/adaptive-determiner-use-probe-browser-wire.js',
  'js/adaptive-determiner-use-transfer-probe-browser-wire.js',
  'js/verb-explorer-determiner-use-assessment-live.js'
])vm.runInContext(fs.readFileSync(path,'utf8'),root,{filename:path});
const live=root.SIYAYOVerbExplorerDeterminerUseAssessmentLive;
assert.equal(live.mount({document:doc,experience:shopping,language:'en'}),true);
assert.equal(panel.hidden,false);
assert.equal(panel.dataset.assessmentMode,'local');
assert.match(container.innerHTML,/Which ___ should we choose/);
function click(key,value){
  const target={dataset:{[key]:value},closest:()=>target};
  for(const handler of listeners)handler({target});
}
click('determinerUseProbeSelect','cheese');
assert.equal(attempts.length,1);
assert.equal(attempts[0].attempt.result,'pass');
assert.equal(attempts[0].attempt.mode,'local');
assert.equal(attempts[0].event.experienceId,'shopping-for-dinner');
state={currentExperienceId:'preparing-dinner',experienceLanguage:'en'};
assert.equal(live.mount({document:doc,experience:preparing,language:'en'}),true);
assert.equal(panel.dataset.assessmentMode,'transfer');
assert.match(container.innerHTML,/Which ___ should we cook first/);
click('determinerUseTransferProbeSelect','carrots');
assert.equal(attempts.length,2);
assert.equal(attempts[1].attempt.result,'pass');
assert.equal(attempts[1].attempt.mode,'transfer');
assert.equal(attempts[1].attempt.context.fromExperienceId,'shopping-for-dinner');
assert.equal(attempts[1].event.experienceId,'preparing-dinner');
assert.equal(navigationCalls,0);
assert.equal(trailCalls,2);
state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'es'};
assert.equal(live.mount({document:doc,experience:shopping,language:'es'}),true);
assert.match(container.innerHTML,/¿Qué ___ deberíamos elegir/);
click('determinerUseProbeSelect','cheese');
assert.equal(attempts.length,3);
assert.equal(attempts[2].attempt.result,'pass');
assert.equal(attempts[2].attempt.mode,'local');
state={currentExperienceId:'preparing-dinner',experienceLanguage:'es'};
assert.equal(live.mount({document:doc,experience:preparing,language:'es'}),true);
assert.match(container.innerHTML,/¿Qué ___ deberíamos cocinar primero/);
click('determinerUseTransferProbeSelect','carrots');
assert.equal(attempts.length,4);
assert.equal(attempts[3].attempt.result,'pass');
assert.equal(attempts[3].attempt.mode,'transfer');
assert.equal(navigationCalls,0);
state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'pt'};
assert.equal(live.mount({document:doc,experience:shopping,language:'pt'}),true);
assert.match(container.innerHTML,/Qual ___ devemos escolher/);
click('determinerUseProbeSelect','cheese');
assert.equal(attempts.length,5);
assert.equal(attempts[4].attempt.result,'pass');
assert.equal(attempts[4].attempt.mode,'local');
state={currentExperienceId:'preparing-dinner',experienceLanguage:'pt'};
assert.equal(live.mount({document:doc,experience:preparing,language:'pt'}),true);
assert.match(container.innerHTML,/Quais ___ devemos cozinhar primeiro/);
click('determinerUseTransferProbeSelect','carrots');
assert.equal(attempts.length,6);
assert.equal(attempts[5].attempt.result,'pass');
assert.equal(attempts[5].attempt.mode,'transfer');
assert.equal(navigationCalls,0);
assessment=null;
assert.equal(live.mount({document:doc,experience:preparing,language:'en'}),false);
assert.equal(panel.hidden,true);
console.log('Determiner live presentation: PASS — S1 local and visited S2 transfer clicks submit grounded Attempts without local navigation or Session creation.');
