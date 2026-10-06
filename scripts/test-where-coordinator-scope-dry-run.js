#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const Scope=require('../js/adaptive-assessment-scope.js');
const EvidenceProfile=require('../js/adaptive-evidence-profile.js');
const GreenPass=require('../js/green-pass-profile.js');
const AttemptLoop=require('../js/adaptive-attempt-loop.js');
const LearningCycle=require('../js/adaptive-learning-cycle.js');
const TransferAuthority=require('../js/verb-explorer-transfer-attempt-authority.js');
const where=require('../data/learning/skills/where.json');
const corpus=require('../data/learning/experience-seeds.json');
const grounding=require('../data/learning/where-spatial-answer-grounding.json');
const Spec=require('../js/adaptive-where-location-probe-specification-source.js');
const Result=require('../js/adaptive-where-location-probe-result.js');
const Evidence=require('../js/adaptive-where-location-probe-evidence-bridge.js');
const Attempt=require('../js/adaptive-where-location-probe-attempt-boundary.js');

const learnerId='where-dry-run';
const scope=Scope.create({learnerId,skill:where.id,language:'en',originExperienceId:'shopping-for-dinner'});
assert.ok(scope);
const profile=GreenPass.createProfile(learnerId);
const evidenceProfile=EvidenceProfile.createProfile(learnerId);
let session=AttemptLoop.begin(EvidenceProfile,evidenceProfile,{skill:where.id,currentExperience:'shopping-for-dinner'});
session.decision.skill=where.id;
session.decision.experienceId='shopping-for-dinner';
session.decision.assessmentScope=scope;

const context={
  assessmentScope:scope,language:'en',skill:where.id,currentExperience:'shopping-for-dinner',
  passContract:where.passContract,evidencePackets:[],experiences:corpus.items
};
const catalog={getExperience:id=>corpus.items.find(x=>x.id===id)||null,getExperiences:()=>corpus.items};

const sandbox=vm.createContext({
  Object,
  AdaptiveAssessmentScope:Scope,
  AdaptiveLearningCycle:LearningCycle,
  SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>learnerId},
  SIYAYOVerbExplorerTransferAttemptAuthority:TransferAuthority,
  SIYAYOVerbExplorerExperienceNavigation:catalog
});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('js/verb-explorer-adaptive-coordinator.js','utf8'),sandbox,{filename:'js/verb-explorer-adaptive-coordinator.js'});
const coordinator=sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;

let state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'};
assert.equal(coordinator.configure({
  profile,session,context,getState:()=>state,getResumeState:()=>state
}),true,'canonical EN WHERE dry-run context must configure');

coordinator.clear();
assert.equal(coordinator.configure({
  profile,session,
  context:{...context,language:'es'},
  getState:()=>state,getResumeState:()=>state
}),false,'Coordinator must reject context language that disagrees with assessment scope');

assert.equal(coordinator.configure({
  profile,session,context,getState:()=>state,getResumeState:()=>state
}),true);

const local=corpus.items.find(x=>x.id==='shopping-for-dinner');
const transfer=corpus.items.find(x=>x.id==='preparing-dinner');
const specs=Spec.resolve(where,local,transfer,grounding,'en');
assert.ok(specs);

function make(spec,occurrence){
  const event={
    observed:true,actor:'learner',intent:'answer',source:'where-location-probe-select',
    occurrenceId:occurrence,skill:spec.skill,dimension:spec.dimension,mode:spec.mode,
    language:spec.language,experienceId:spec.experienceId,
    fromExperienceId:spec.fromExperienceId||null,choice:spec.expectedAlternativeId
  };
  const result=Result.evaluate(spec,event);
  const evidence=Evidence.fromResult({result,learnerEvent:event,supportSensor:{support:()=> 'none'}});
  const attempt=Attempt.assemble({learnerEvent:event,evidence});
  return {event,result,evidence,attempt};
}

const localAttempt=make(specs.localProbe,'where-local-1');
const scopedLocal=Scope.bindAttempt({
  scope,attempt:localAttempt.attempt,learnerEvent:localAttempt.event,
  state:{experienceLanguage:'en'},learnerId
});
assert.ok(scopedLocal);
assert.equal(scopedLocal.context.assessmentScope.key,scope.key);

state={currentExperienceId:'preparing-dinner',experienceLanguage:'en'};
const transferAttempt=make(specs.transferProbe,'where-transfer-1');
const scopedTransfer=Scope.bindAttempt({
  scope,attempt:transferAttempt.attempt,learnerEvent:transferAttempt.event,
  state:{experienceLanguage:'en'},learnerId
});
assert.ok(scopedTransfer);
assert.equal(scopedTransfer.context.fromExperienceId,'shopping-for-dinner');
assert.equal(scopedTransfer.context.assessmentScope.key,scope.key);

assert.equal(TransferAuthority.accepts({
  session,attempt:transferAttempt.attempt,learnerEvent:transferAttempt.event,state,catalog
}),true,'explicit scoped WHERE transfer is admitted for the grounded pilot circuit');

const before=coordinator.snapshot();
assert.equal(before.session,session);
assert.equal(before.session.decision.experienceId,'shopping-for-dinner');
assert.equal(before.session.decision.assessmentScope.key,scope.key);
assert.equal(before.context.currentExperience,'shopping-for-dinner');
assert.equal(state.currentExperienceId,'preparing-dinner','learner may visit transfer destination');
assert.equal(coordinator.snapshot().session,session,'visit must not replace WHERE origin Session');

const wrongLanguage=Scope.bindAttempt({
  scope,attempt:transferAttempt.attempt,
  learnerEvent:{...transferAttempt.event,language:'es'},
  state:{experienceLanguage:'es'},learnerId
});
assert.equal(wrongLanguage,null);

console.log('PASS — WHERE dry-run preserves learner+skill+language+origin scope and admits transfer without replacing the Shopping Session on a Preparing visit.');
