#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function buildSandbox(options={}){
  const calls={greenBegin:0,evidenceBegin:0,sessionBegin:0,configure:0};
  const learnerId=options.learnerId||'learner-27';
  const passContract=Object.freeze({requires:Object.freeze([{dimension:'choice-function',result:'pass'}])});
  const state=Object.freeze({currentExperienceId:'shopping-for-dinner'});
  const documentRef=Object.freeze({id:'verb-explorer-document'});

  let greenProfile=options.greenProfile===undefined?null:options.greenProfile;
  let evidenceProfile=options.evidenceProfile===undefined?null:options.evidenceProfile;
  let received=null;
  let active=null;

  const sandbox=vm.createContext({Object,Array});
  sandbox.globalThis=sandbox;
  sandbox.SIYAYOVerbExplorerLearnerIdentitySource=Object.freeze({getId:()=>learnerId});
  sandbox.SIYAYOVerbExplorerCanonicalSkillSource=Object.freeze({
    getSkill:()=> 'which.use.determiner',
    getPassContract:()=>passContract
  });
  sandbox.SIYAYOVerbExplorerAdaptiveProfileSource=Object.freeze({
    getProfile:()=>greenProfile,
    begin(id){
      calls.greenBegin+=1;
      greenProfile=Object.freeze({id});
      return greenProfile;
    }
  });
  sandbox.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource=Object.freeze({
    getProfile:()=>evidenceProfile,
    begin(id){
      calls.evidenceBegin+=1;
      evidenceProfile=Object.freeze({id,observations:Object.freeze([])});
      return evidenceProfile;
    }
  });
  sandbox.SIYAYOVerbExplorerAdaptiveSessionSource=Object.freeze({
    begin(profile,context){
      calls.sessionBegin+=1;
      assert.equal(profile,evidenceProfile);
      assert.equal(context.skill,'which.use.determiner');
      assert.equal(context.currentExperience,'shopping-for-dinner');
      assert.equal(context.passContract,passContract);
      return {decision:Object.freeze({skill:context.skill,experienceId:context.currentExperience}),trace:[]};
    }
  });
  sandbox.SIYAYOVerbExplorerAdaptiveStateBridge=Object.freeze({
    getState:()=>state,
    getResumeState:()=>state
  });
  sandbox.SIYAYOVerbExplorerAdaptiveCoordinator=Object.freeze({
    snapshot:()=>active,
    clear:()=>{active=null;}
  });
  sandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig=Object.freeze({
    configure(input){
      calls.configure+=1;
      received=input;
      active={profile:input.profile,session:input.session,context:input.context};
      return true;
    }
  });

  vm.runInContext(fs.readFileSync('js/verb-explorer-adaptive-composer.js','utf8'),sandbox,{filename:'js/verb-explorer-adaptive-composer.js'});
  return {sandbox,calls,state,documentRef,getReceived:()=>received,getActive:()=>active,clearActive:()=>{active=null;}};
}

{
  const t=buildSandbox();
  const composer=t.sandbox.SIYAYOVerbExplorerAdaptiveComposer;
  assert.equal(composer.compose({document:t.documentRef}),true);
  assert.equal(t.calls.greenBegin,1,'missing Green Profile must be created once');
  assert.equal(t.calls.evidenceBegin,1,'missing Evidence Profile must be created once');
  assert.equal(t.calls.sessionBegin,1,'composition creates one Session');
  assert.equal(t.calls.configure,1,'grounded P/S/C must reach CoordinatorConfig once');
  assert.equal(t.getReceived().profile.id,'learner-27');
  assert.equal(t.getReceived().session.decision.skill,'which.use.determiner');
  assert.equal(t.getReceived().context.currentExperience,'shopping-for-dinner');
  assert.equal(t.getReceived().document,t.documentRef,'document must be preserved for event-time Attempt resolution');
  assert.equal('attempt' in t.getReceived(),false,'Composer must not pre-create Attempt A');

  const firstSession=t.getActive().session;
  firstSession.trace.push({event:'learner-attempt'});
  assert.equal(composer.compose({document:t.documentRef}),false,'active Session must block silent recomposition');
  assert.equal(t.calls.sessionBegin,1,'active Session must not be recreated');
  assert.equal(t.calls.configure,1,'active Coordinator must not be reconfigured');
  assert.equal(t.getActive().session,firstSession,'Coordinator must retain the same Session reference');
  assert.equal(t.getActive().session.trace.length,1,'active Session trace must be preserved');

  t.clearActive();
  assert.equal(composer.compose({document:t.documentRef}),true,'explicit lifecycle clear permits a new Session');
  assert.equal(t.calls.sessionBegin,2,'new Session may begin only after active lifecycle is cleared');
  assert.equal(t.calls.configure,2);
  assert.notEqual(t.getActive().session,firstSession,'cleared lifecycle must receive a new Session reference');
}

{
  const matchingGreen=Object.freeze({id:'learner-27'});
  const matchingEvidence=Object.freeze({id:'learner-27',observations:Object.freeze([])});
  const t=buildSandbox({greenProfile:matchingGreen,evidenceProfile:matchingEvidence});
  assert.equal(t.sandbox.SIYAYOVerbExplorerAdaptiveComposer.compose({document:t.documentRef}),true);
  assert.equal(t.calls.greenBegin,0,'matching Green Profile must be reused');
  assert.equal(t.calls.evidenceBegin,0,'matching Evidence Profile must be reused');
  assert.equal(t.calls.sessionBegin,1);
  assert.equal(t.calls.configure,1);
}

{
  const t=buildSandbox({greenProfile:Object.freeze({id:'learner-08'})});
  assert.equal(t.sandbox.SIYAYOVerbExplorerAdaptiveComposer.compose({document:t.documentRef}),false,'Green Profile identity mismatch must WAIT/fail closed');
  assert.equal(t.calls.evidenceBegin,0);
  assert.equal(t.calls.sessionBegin,0);
  assert.equal(t.calls.configure,0);
}

{
  const matchingGreen=Object.freeze({id:'learner-27'});
  const wrongEvidence=Object.freeze({id:'learner-08',observations:Object.freeze([])});
  const t=buildSandbox({greenProfile:matchingGreen,evidenceProfile:wrongEvidence});
  assert.equal(t.sandbox.SIYAYOVerbExplorerAdaptiveComposer.compose({document:t.documentRef}),false,'Evidence Profile identity mismatch must WAIT/fail closed');
  assert.equal(t.calls.greenBegin,0);
  assert.equal(t.calls.sessionBegin,0);
  assert.equal(t.calls.configure,0);
}

console.log('Adaptive Composer: PASS — identity-bound P/S/C; active S is preserved until explicit lifecycle clear; mismatches WAIT; A remains event-time only.');
