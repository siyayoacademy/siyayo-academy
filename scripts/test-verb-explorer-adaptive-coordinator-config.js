#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const calls={coordinator:0,attempt:0};
const state=Object.freeze({currentExperienceId:'shopping-for-dinner'});
const profile=Object.freeze({id:'learner-1'});
const session=Object.freeze({decision:Object.freeze({skill:'which.use.determiner',experienceId:'shopping-for-dinner'})});
const baseContext=Object.freeze({passContract:Object.freeze({id:'which-pass'}),evidencePackets:Object.freeze([])});
const learnerEvent=Object.freeze({choice:'fresh-mild-cheese'});
const documentRef=Object.freeze({id:'doc'});
let received=null;

const sandbox=vm.createContext({Object,Array});
sandbox.globalThis=sandbox;
sandbox.GreenPassAuthorityPolicy=Object.freeze({contractAuthoritySkills:Object.freeze(['which.use.determiner'])});
sandbox.SIYAYOVerbExplorerAdaptiveCoordinator=Object.freeze({
  configure(input){calls.coordinator+=1;received=input;return true;}
});
sandbox.SIYAYOVerbExplorerChoiceAttemptProvider=Object.freeze({
  getAttempt(choice,currentState,target,event,doc){
    calls.attempt+=1;
    assert.equal(choice,'fresh-mild-cheese');
    assert.equal(currentState,state);
    assert.equal(target,'choice-card');
    assert.equal(event,learnerEvent);
    assert.equal(doc,documentRef);
    return Object.freeze({dimension:'choice-function',result:'pass'});
  }
});
sandbox.SIYAYOVerbExplorerSessionStateBoundary=Object.freeze({
  align(currentSession,currentState){
    if(currentSession!==session||currentState!==state)return null;
    return Object.freeze({skill:'which.use.determiner',currentExperience:'shopping-for-dinner'});
  }
});

for(const file of [
  'js/verb-explorer-adaptive-context-source.js',
  'js/verb-explorer-adaptive-coordinator-config.js'
]) vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});

const config=sandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;
const getState=()=>state;
assert.equal(config.configure({profile,session,context:baseContext,getState,document:documentRef}),true);
assert.equal(calls.coordinator,1);
assert.equal(received.profile,profile);
assert.equal(received.session,session);
assert.equal(received.context.skill,'which.use.determiner');
assert.equal(received.context.currentExperience,'shopping-for-dinner');
assert.equal(received.context.passContract,baseContext.passContract);
assert.equal(received.context.evidencePackets,baseContext.evidencePackets);
assert.equal(typeof received.getAttempt,'function');
const attempt=received.getAttempt('fresh-mild-cheese',state,'choice-card',learnerEvent);
assert.equal(attempt.dimension,'choice-function');
assert.equal(calls.attempt,1);

const conflicting=Object.freeze({skill:'another.skill'});
assert.equal(config.configure({profile,session,context:conflicting,getState}),false,'conflicting grounded context must fail closed');
assert.equal(calls.coordinator,1,'failed configuration must not reach Coordinator');
assert.equal(config.configure({profile,session,getState:()=>null}),false,'missing grounded state must fail closed');
assert.equal(calls.coordinator,1);

console.log('Adaptive Coordinator config: PASS — grounded P/S/C configure Coordinator, A stays event-time through ChoiceAttemptProvider, conflicts fail closed.');
