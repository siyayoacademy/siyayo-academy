#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const corpus=require('../data/learning/experience-seeds.json');
const nouns=require('../data/lexicon/nouns/nouns.json');
const which=require('../data/learning/skills/which.json');
const EvidenceProfile=require('../js/adaptive-evidence-profile.js');
const AttemptLoop=require('../js/adaptive-attempt-loop.js');
const LearningCycle=require('../js/adaptive-learning-cycle.js');
const GreenProfile=require('../js/green-pass-profile.js');
const localSource=require('../js/adaptive-determiner-use-probe-specification-source.js');
const transferSource=require('../js/adaptive-determiner-use-transfer-probe-specification-source.js');
const resultApi=require('../js/adaptive-determiner-use-transfer-probe-result.js');
const evidenceBridge=require('../js/adaptive-determiner-use-transfer-probe-evidence-bridge.js');
const attemptBoundary=require('../js/adaptive-determiner-use-transfer-probe-attempt-boundary.js');
const support=require('../js/adaptive-determiner-use-transfer-probe-support-sensor.js').create();
const transferAuthority=require('../js/verb-explorer-transfer-attempt-authority.js');
const observedSource=require('../js/adaptive-observed-attempt-evidence-source.js');
const closureSource=require('../js/adaptive-contract-closure-evidence-source.js');
const shopping=corpus.items.find(item=>item.id==='shopping-for-dinner');
const preparing=corpus.items.find(item=>item.id==='preparing-dinner');
const catalog={getExperience:id=>corpus.items.find(item=>item.id===id)||null,getNouns:()=>nouns};
const spec=transferSource.resolve(which,localSource.resolve(which,shopping,'en'),preparing,nouns,'en');
assert.ok(spec);
const env=vm.createContext({
  Object,Date,
  AdaptiveLearningCycle:LearningCycle,
  AdaptiveObservedAttemptEvidenceSource:observedSource,
  AdaptiveContractClosureEvidenceSource:closureSource,
  AdaptiveEvidenceProfile:EvidenceProfile,
  SIYAYOVerbExplorerTransferAttemptAuthority:transferAuthority,
  SIYAYOVerbExplorerExperienceNavigation:catalog
});
env.globalThis=env;
for(const path of ['js/verb-explorer-learner-event.js','js/verb-explorer-adaptive-coordinator.js']){
  vm.runInContext(fs.readFileSync(path,'utf8'),env,{filename:path});
}
const learner=env.SIYAYOVerbExplorerLearnerEvent;
const coordinator=env.SIYAYOVerbExplorerAdaptiveCoordinator;
const evidenceProfile=EvidenceProfile.createProfile('transfer-visit-learner');
env.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource={getProfile:()=>evidenceProfile};
let greenProfile=GreenProfile.createProfile('transfer-visit-learner');
let session=AttemptLoop.begin(EvidenceProfile,evidenceProfile,{
  skill:'which.use.determiner',currentExperience:'shopping-for-dinner'
});
session.decision.skill='which.use.determiner';
session.decision.experienceId='shopping-for-dinner';
const choice={skill:'which.use.determiner',dimension:'choice-function',result:'pass',support:'none',context:{
  occurrenceId:'choice-select:1',experienceId:'shopping-for-dinner',selectedAlternativeId:'fresh-mild-cheese'
}};
const local={skill:'which.use.determiner',dimension:'determiner-use',result:'pass',support:'none',context:{
  occurrenceId:'determiner-use-probe-select:1',experienceId:'shopping-for-dinner',
  targetForm:'which',targetNoun:'cheese',selectedAlternativeId:'cheese'
}};
const context={skill:'which.use.determiner',currentExperience:'shopping-for-dinner',
  passContract:which.passContract,evidencePackets:[choice,local],experiences:corpus.items};
let state={currentExperienceId:'preparing-dinner',experienceLanguage:'en'};
let dispatches=0;
env.SIYAYOVerbExplorerCycleResumeDispatch={run:()=>{dispatches++;return null;}};
assert.equal(coordinator.configure({profile:greenProfile,session,context,getState:()=>state,getResumeState:()=>state}),true);
function build(choiceId){
  const event=learner.fromDeterminerUseTransferProbeSelect(choiceId,{
    fromExperienceId:'shopping-for-dinner',currentExperienceId:'preparing-dinner',
    dimension:'determiner-use',mode:'transfer',targetForm:'which',targetNoun:spec.targetNoun
  });
  const result=resultApi.evaluate(spec,event);
  const evidence=evidenceBridge.fromResult({result,learnerEvent:event,supportSensor:support});
  const attempt=attemptBoundary.assemble({learnerEvent:event,evidence});
  return {event,attempt};
}
const correct=build(spec.expectedAlternativeId);
assert.equal(transferAuthority.accepts({session,attempt:correct.attempt,learnerEvent:correct.event,state,catalog}),true);
assert.equal(coordinator.submitObservedAttempt(correct.attempt,{...correct.event,fromExperienceId:'unknown'}),null);
assert.equal(coordinator.snapshot().context.evidencePackets.length,2);
state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'};
assert.equal(coordinator.submitObservedAttempt(correct.attempt,correct.event),null);
state={currentExperienceId:'preparing-dinner',experienceLanguage:'en'};
const output=coordinator.submitObservedAttempt(correct.attempt,correct.event);
assert.ok(output,'canonical S2 response must reach S1 Cycle');
assert.equal(output.cycleResult.contractEvaluation.status,'GREEN_PASS');
assert.equal(output.cycleResult.contractEligible,true);
assert.equal(output.cycleResult.advanceSelection,null);
assert.equal(output.dispatchResult,null);
assert.equal(dispatches,0,'transfer must not resume S1 automatically');
assert.equal(coordinator.snapshot().session,session,'S1 Session persists after Green');
assert.equal(session.decision.experienceId,'shopping-for-dinner');
assert.ok(evidenceProfile.observations.some(entry=>entry.source==='learner-attempt'&&entry.context.experienceId==='preparing-dinner'&&entry.context.confirmed===false));
assert.ok(evidenceProfile.observations.some(entry=>entry.source==='green-pass-contract'&&entry.context.experienceId==='shopping-for-dinner'&&entry.context.confirmed===true));
assert.equal(coordinator.submitObservedAttempt(correct.attempt,correct.event),null,'same occurrence cannot close twice');
console.log('Transfer visit: PASS — S2 observed response closes S1 canonical contract; visit, spoofed origin and duplicate cannot replace Session or navigate.');
