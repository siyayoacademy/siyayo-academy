#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const sandbox=vm.createContext({Object,Array,Number,String,Boolean,Math,TypeError});
sandbox.globalThis=sandbox;
for(const path of [
 'js/adaptive-pedagogical-orchestrator.js','js/adaptive-attempt-loop.js','js/green-pass-profile.js',
 'js/adaptive-advance-selector.js','js/pedagogical-resonance.js','js/adaptive-learning-router.js',
 'js/adaptive-wait-classifier.js','js/adaptive-agency-resume-context.js','js/adaptive-learning-cycle.js',
 'js/adaptive-determiner-use-transfer-probe-support-sensor.js',
 'js/adaptive-determiner-use-transfer-probe-evidence-bridge.js',
 'js/adaptive-determiner-use-transfer-probe-attempt-boundary.js'
]) vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});

const skill=JSON.parse(fs.readFileSync('data/learning/skills/which.json','utf8'));
const policy=JSON.parse(fs.readFileSync('data/learning/green-pass-authority.json','utf8'));
const Profile=sandbox.GreenPassProfile, Cycle=sandbox.AdaptiveLearningCycle;
const session={decision:{experienceId:'shopping-for-dinner',skill:'which.use.determiner',language:'en',chapter:'question-words'},trace:[]};
let profile=Profile.createProfile('learner-test');
let context={
 passContract:skill.passContract,greenPassAuthority:'contract',greenPassAuthorityPolicy:policy,
 currentExperience:'shopping-for-dinner',
 evidencePackets:[
  {skill:'which.use.determiner',dimension:'choice-function',result:'pass',support:'none',context:'shopping-for-dinner'},
  {skill:'which.use.determiner',dimension:'determiner-use',result:'pass',support:'none',context:'shopping-for-dinner'}
 ]
};

const learnerEvent={
 observed:true,actor:'learner',source:'determiner-use-transfer-probe-select',
 occurrenceId:'determiner-use-transfer-probe-select:1',choice:'carrots',
 fromExperienceId:'shopping-for-dinner',experienceId:'preparing-dinner',
 dimension:'determiner-use',mode:'transfer',targetForm:'which',targetNoun:'carrots'
};
const probeResult={
 occurrenceId:learnerEvent.occurrenceId,fromExperienceId:'shopping-for-dinner',experienceId:'preparing-dinner',
 skill:'which.use.determiner',dimension:'determiner-use',mode:'transfer',targetForm:'which',
 targetNoun:'carrots',selectedAlternativeId:'carrots',result:'pass'
};
const sensor=sandbox.AdaptiveDeterminerUseTransferProbeSupportSensor.create();
const evidence=sandbox.AdaptiveDeterminerUseTransferProbeEvidenceBridge.fromResult({result:probeResult,learnerEvent,supportSensor:sensor});
assert.equal(evidence.support,'none');
assert.equal(evidence.mode,'transfer');
assert.notEqual(evidence.context.fromExperienceId,evidence.context.experienceId);

const third=sandbox.AdaptiveDeterminerUseTransferProbeAttemptBoundary.assemble({learnerEvent,evidence});
assert.ok(third);
assert.equal(third.mode,'transfer');
assert.equal(third.support,'none');

const result=Cycle.submit(profile,session,third,context);
assert.equal(result.contractEvaluation.status,'GREEN_PASS');
assert.equal(result.contractEligible,true);
assert.equal(result.contractEvaluation.missing.length,0);
assert.equal(result.nextContext.evidencePackets.length,3);
assert.equal(result.recommendation.action,'continue-assessment');
assert.equal(result.recommendation.authority,'contract');
assert.equal(result.recommendation.reason,'green-pass-eligible-awaiting-route');
assert.equal(result.advanceSelection,null,'GREEN eligibility must not manufacture NEXT');
assert.ok(result.routeInspection);
assert.equal(result.routeInspection.action,'continue-assessment');

console.log('WHICH third Attempt contract: PASS — cross-Experience transfer completes the 3-footprint contract; GREEN becomes eligible while NEXT remains separately unauthorized.');
