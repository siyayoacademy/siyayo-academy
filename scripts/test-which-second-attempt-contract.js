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
  'js/adaptive-determiner-use-probe-support-sensor.js','js/adaptive-determiner-use-probe-evidence-bridge.js',
  'js/adaptive-determiner-use-probe-attempt-boundary.js'
]) vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});

const skill=JSON.parse(fs.readFileSync('data/learning/skills/which.json','utf8'));
const policy=JSON.parse(fs.readFileSync('data/learning/green-pass-authority.json','utf8'));
const Profile=sandbox.GreenPassProfile, Cycle=sandbox.AdaptiveLearningCycle;
const session={decision:{experienceId:'shopping-for-dinner',skill:'which.use.determiner',language:'en',chapter:'question-words'},trace:[]};
let profile=Profile.createProfile('learner-test');
let context={passContract:skill.passContract,greenPassAuthority:'contract',greenPassAuthorityPolicy:policy,currentExperience:'shopping-for-dinner',evidencePackets:[]};

const first={skill:'which.use.determiner',language:'en',chapter:'question-words',correct:true,confidence:1,dimension:'choice-function',result:'pass',support:'none',context:'shopping-for-dinner'};
let result=Cycle.submit(profile,session,first,context);
profile=result.greenProfile; context=result.nextContext;
assert.equal(result.contractEvaluation.status,'WAITING_FOR_EVIDENCE');
assert.equal(context.evidencePackets.length,1);

const learnerEvent={observed:true,actor:'learner',source:'determiner-use-probe-select',occurrenceId:'determiner-use-probe-select:1',choice:'cheese',experienceId:'shopping-for-dinner',dimension:'determiner-use',targetForm:'which',targetNoun:'cheese'};
const probeResult={occurrenceId:learnerEvent.occurrenceId,experienceId:'shopping-for-dinner',skill:'which.use.determiner',dimension:'determiner-use',targetForm:'which',targetNoun:'cheese',selectedAlternativeId:'cheese',result:'pass'};
const sensor=sandbox.AdaptiveDeterminerUseProbeSupportSensor.create();
const evidence=sandbox.AdaptiveDeterminerUseProbeEvidenceBridge.fromResult({result:probeResult,learnerEvent,supportSensor:sensor});
assert.equal(evidence.support,'none');
const second=sandbox.AdaptiveDeterminerUseProbeAttemptBoundary.assemble({learnerEvent,evidence});
assert.ok(second);
assert.equal(second.mode,'local');

result=Cycle.submit(profile,session,second,context);
assert.equal(result.contractEvaluation.status,'WAITING_FOR_EVIDENCE');
assert.equal(result.contractEligible,false);
assert.equal(result.advanceSelection,null);
assert.equal(result.nextContext.evidencePackets.length,2);
assert.equal(result.contractEvaluation.missing.length,1);
assert.equal(result.contractEvaluation.missing[0].dimension,'determiner-use');
assert.equal(result.contractEvaluation.missing[0].mode,'transfer');
assert.equal(result.contractEvaluation.missing[0].support,'none');

console.log('WHICH second Attempt contract: PASS — local determiner-use with support none is retained; only transfer evidence remains and GREEN/NEXT stay closed.');
