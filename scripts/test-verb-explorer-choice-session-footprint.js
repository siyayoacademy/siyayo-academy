#!/usr/bin/env node
// The real Choice click must reach the contract and the longitudinal Trail.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Cycle=require('../js/adaptive-learning-cycle.js');
const Loop=require('../js/adaptive-attempt-loop.js');
const Green=require('../js/green-pass-profile.js');
const Evidence=require('../js/adaptive-evidence-profile.js');
const which=require('../data/learning/skills/which.json');
const corpus=require('../data/learning/experience-seeds.json');
const sandbox=vm.createContext({
  Object,AdaptiveLearningCycle:Cycle,AdaptiveAttemptLoop:Loop,
  AdaptiveObservedAttemptEvidenceSource:require('../js/adaptive-observed-attempt-evidence-source.js'),
  AdaptiveEvidenceProfile:Evidence
});
sandbox.globalThis=sandbox;
const history=Evidence.createProfile('choice-provenance');
sandbox.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource=Object.freeze({getProfile:()=>history});
const session={decision:{experienceId:'shopping-for-dinner',skill:which.id,language:'en',chapter:'question-words'},trace:[]};
const state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en',experienceQuestion:3,experienceChoiceCandidate:'choose'};
let sequence=0;
sandbox.SIYAYOVerbExplorerLearnerEvent=Object.freeze({fromChoiceSelect(choice){
  return Object.freeze({observed:true,actor:'learner',source:'choice-select',
    occurrenceId:'choice-select:'+ ++sequence,choice,experienceId:state.currentExperienceId,question:state.experienceQuestion});
}});
for(const path of [
  'js/verb-explorer-choice-evidence-packet-bridge.js',
  'js/verb-explorer-adaptive-controller.js',
  'js/verb-explorer-adaptive-coordinator.js'
])vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
const coordinator=sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
assert.equal(coordinator.configure({
  profile:Green.createProfile('choice-provenance'),session,
  context:{passContract:which.passContract,evidencePackets:[],experiences:corpus.items},
  getState:()=>state,
  getAttempt:(choice,liveState,target,event)=>Object.freeze({
    occurrenceId:event.occurrenceId,dimension:'choice-function',result:'pass',support:'none',
    context:Object.freeze({currentExperienceId:liveState.currentExperienceId,
      experienceLanguage:liveState.experienceLanguage,experienceQuestion:liveState.experienceQuestion,
      experienceChoiceCandidate:liveState.experienceChoiceCandidate})
  }),
  getResumeState:()=>state
}),true);
const output=coordinator.submitChoice('choose');
assert.ok(output,'real Choice must reach Cycle');
assert.equal(output.cycleResult.contractEvaluation.requirements[0].satisfied,true);
assert.equal(output.cycleResult.contractEvaluation.status,'WAITING_FOR_EVIDENCE');
assert.equal(coordinator.snapshot().context.evidencePackets.length,1);
assert.equal(coordinator.snapshot().context.evidencePackets[0].skill,which.id);
assert.equal(coordinator.snapshot().context.evidencePackets[0].context.occurrenceId,'choice-select:1');
assert.equal(history.observations.length,1);
assert.equal(history.observations[0].context.dimension,'choice-function');
assert.equal(history.observations[0].context.confirmed,false);
assert.equal(coordinator.submitChoice('wrong'),null);
assert.equal(history.observations.length,1);
console.log('Choice Session footprint: PASS — grounded Choice satisfies 1/3 without premature Green.');
