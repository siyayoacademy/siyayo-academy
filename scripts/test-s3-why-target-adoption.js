#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const seeds=require('../data/learning/experience-seeds.json').items;
const why=require('../data/learning/skills/why.json');
const what=require('../data/learning/skills/what.json');
const probes=require('../js/adaptive-why-contextual-reason-probe-specification-source.js');
const s2={decision:{experienceId:'preparing-dinner',skill:what.id}};
const previous={status:'transition-authorized',fromExperience:'preparing-dinner',toExperience:'having-dinner',
  advanceSelection:{action:'advance',status:'selected',fromExperience:'preparing-dinner',experienceId:'having-dinner'},
  nextDecision:{action:'advance',experienceId:'having-dinner',skill:what.id}};
const event={observed:true,actor:'learner',intent:'continue-assessment',source:'pedagogical-session-adopt',
  occurrenceId:'adopt:1',experienceId:'having-dinner'};
let current=what,loads=0,configurations=0;
let location='having-dinner';
const sandbox={Promise,Object,Array,Set};sandbox.globalThis=sandbox;
sandbox.SIYAYOVerbExplorerExperienceNavigation={
  getExperience:id=>seeds.find(e=>e.id===id),getNouns:()=>({}),getExperiences:()=>seeds
};
sandbox.SIYAYOVerbExplorerCanonicalSkillSource={
  getDefinition:()=>current,adopt(definition){current=definition;return true;}
};
sandbox.SIYAYOVerbExplorerCanonicalSkillLoader={load(path){
  loads++;if(path!=='data/learning/skills/why.json')return Promise.resolve(false);
  current=why;return Promise.resolve(true);
}};
sandbox.AdaptiveWhyContextualReasonProbeSpecificationSource=probes;
sandbox.SIYAYOVerbExplorerWhyAssessmentLive={mount(){return true;}};
sandbox.AdaptiveSessionTransitionBoundary={authorize(input){
  assert.equal(input.currentSession,s2);
  assert.equal(input.nextDecision.skill,why.id);
  return {status:'transition-authorized',fromExperience:'preparing-dinner',toExperience:'having-dinner',
    advanceSelection:input.advanceSelection,nextDecision:input.nextDecision};
}};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-next-assessment-target.js','utf8'),sandbox);
const target=sandbox.SIYAYOVerbExplorerNextAssessmentTarget;
sandbox.SIYAYOVerbExplorerAdaptiveProfileSource={getProfile:()=>({id:'learner',greenPass:true})};
sandbox.SIYAYOVerbExplorerAdaptiveStateBridge={getState:()=>({currentExperienceId:location,experienceLanguage:'pt'})};
sandbox.SIYAYOVerbExplorerNextSessionSource={begin(input){
  assert.equal(input.transitionAuthorization.nextDecision.skill,why.id);
  return {decision:{experienceId:'having-dinner',skill:why.id}};
}};
sandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig={configure(input){
  configurations++;assert.equal(input.session.decision.skill,why.id);
  assert.equal(input.context.passContract,why.passContract);
  assert.deepEqual(Array.from(input.context.evidencePackets),[]);
  return true;
}};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-next-session-activation.js','utf8'),sandbox);
(async()=>{
  assert.equal(await target.prepare({authorization:previous,previousSession:s2,language:'pt'}),null,
    'adoption target cannot be prepared without a human gesture');
  assert.equal(await target.prepare({authorization:previous,previousSession:s2,language:'pt',learnerEvent:{...event,experienceId:'after-dinner-conversation'}}),null);
  assert.equal(current,what);
  assert.equal(loads,0);
  const prepared=await target.prepare({authorization:previous,previousSession:s2,language:'pt',learnerEvent:event});
  assert.equal(loads,1);
  assert.equal(prepared.authorization.nextDecision.skill,why.id);
  assert.equal(prepared.passContract,why.passContract);
  assert.equal(current,why);
  const activated=sandbox.SIYAYOVerbExplorerNextSessionActivation.activate({
    transitionAuthorization:prepared.authorization,previousSession:s2,
    passContract:prepared.passContract,language:'pt'
  });
  assert.equal(activated.status,'S3_ACTIVE');
  assert.equal(activated.skill,why.id);
  assert.equal(configurations,1);
  assert.equal(s2.decision.skill,what.id);
  location='preparing-dinner';
  assert.equal(sandbox.SIYAYOVerbExplorerNextSessionActivation.activate({
    transitionAuthorization:prepared.authorization,previousSession:s2,passContract:why.passContract
  }),null,'learner must already be visiting S3');
  assert.equal(configurations,1);
  console.log('PASS — explicit adoption creates a fresh S3 WHY Session and leaves S2 WHAT intact.');
})().catch(error=>{console.error(error);process.exitCode=1;});
