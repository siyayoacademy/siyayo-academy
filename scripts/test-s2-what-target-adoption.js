#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
const what=require('../data/learning/skills/what.json');
const which=require('../data/learning/skills/which.json');
const nouns=require('../data/lexicon/nouns/nouns.json');
const probes=require('../js/adaptive-what-object-question-probe-specification-source.js');
const s1={decision:{experienceId:'shopping-for-dinner',skill:which.id}};
const previous={status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',
  advanceSelection:{action:'advance',status:'selected',fromExperience:'shopping-for-dinner',experienceId:'preparing-dinner'},
  nextDecision:{action:'advance',experienceId:'preparing-dinner',skill:which.id}};
const event={observed:true,actor:'learner',intent:'continue-assessment',source:'pedagogical-session-adopt',
  occurrenceId:'adopt:1',experienceId:'preparing-dinner'};
let current=which,loads=0,configurations=0;
let location='preparing-dinner';
const sandbox={Promise,Object,Array,Set};sandbox.globalThis=sandbox;
sandbox.SIYAYOVerbExplorerExperienceNavigation={
  getExperience:id=>seeds.find(e=>e.id===id),getNouns:()=>nouns,getExperiences:()=>seeds
};
sandbox.SIYAYOVerbExplorerCanonicalSkillSource={
  getDefinition:()=>current,adopt(definition){current=definition;return true;}
};
sandbox.SIYAYOVerbExplorerCanonicalSkillLoader={load(path){
  loads++;if(path!=='data/learning/skills/what.json')return Promise.resolve(false);
  current=what;return Promise.resolve(true);
}};
sandbox.AdaptiveWhatObjectQuestionProbeSpecificationSource=probes;
sandbox.SIYAYOVerbExplorerWhatAssessmentLive={mount(){return true;}};
sandbox.AdaptiveSessionTransitionBoundary={authorize(input){
  assert.equal(input.currentSession,s1);
  assert.equal(input.nextDecision.skill,what.id);
  return {status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner',
    advanceSelection:input.advanceSelection,nextDecision:input.nextDecision};
}};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-next-assessment-target.js','utf8'),sandbox);
const target=sandbox.SIYAYOVerbExplorerNextAssessmentTarget;
sandbox.SIYAYOVerbExplorerAdaptiveProfileSource={getProfile:()=>({id:'learner',greenPass:true})};
sandbox.SIYAYOVerbExplorerAdaptiveStateBridge={getState:()=>({currentExperienceId:location,experienceLanguage:'pt'})};
sandbox.SIYAYOVerbExplorerNextSessionSource={begin(input){
  assert.equal(input.transitionAuthorization.nextDecision.skill,what.id);
  return {decision:{experienceId:'preparing-dinner',skill:what.id}};
}};
sandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig={configure(input){
  configurations++;assert.equal(input.session.decision.skill,what.id);
  assert.equal(input.context.passContract,what.passContract);
  assert.deepEqual(Array.from(input.context.evidencePackets),[]);
  return true;
}};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-next-session-activation.js','utf8'),sandbox);
(async()=>{
  assert.equal(await target.prepare({authorization:previous,previousSession:s1,language:'pt'}),null,
    'adoption target cannot be prepared without a human gesture');
  assert.equal(await target.prepare({authorization:previous,previousSession:s1,language:'pt',learnerEvent:{...event,experienceId:'having-dinner'}}),null);
  assert.equal(current,which);
  assert.equal(loads,0);
  const prepared=await target.prepare({authorization:previous,previousSession:s1,language:'pt',learnerEvent:event});
  assert.equal(loads,1);
  assert.equal(prepared.authorization.nextDecision.skill,what.id);
  assert.equal(prepared.passContract,what.passContract);
  assert.equal(current,what);
  const activated=sandbox.SIYAYOVerbExplorerNextSessionActivation.activate({
    transitionAuthorization:prepared.authorization,previousSession:s1,
    passContract:prepared.passContract,language:'pt'
  });
  assert.equal(activated.status,'S2_ACTIVE');
  assert.equal(activated.skill,what.id);
  assert.equal(configurations,1);
  assert.equal(s1.decision.skill,which.id);
  location='shopping-for-dinner';
  assert.equal(sandbox.SIYAYOVerbExplorerNextSessionActivation.activate({
    transitionAuthorization:prepared.authorization,previousSession:s1,passContract:what.passContract
  }),null,'learner must already be visiting S2');
  assert.equal(configurations,1);
  console.log('PASS — explicit adoption creates a fresh S2 WHAT Session and leaves S1 WHICH intact.');
})().catch(error=>{console.error(error);process.exitCode=1;});
