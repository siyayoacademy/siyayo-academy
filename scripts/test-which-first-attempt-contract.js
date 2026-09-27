#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const sandbox=vm.createContext({Object,Array,Number,String,Boolean,Math,TypeError});
sandbox.globalThis=sandbox;
for(const path of [
  'js/adaptive-pedagogical-orchestrator.js',
  'js/adaptive-attempt-loop.js',
  'js/green-pass-profile.js',
  'js/adaptive-advance-selector.js',
  'js/pedagogical-resonance.js',
  'js/adaptive-learning-router.js',
  'js/adaptive-wait-classifier.js',
  'js/adaptive-agency-resume-context.js',
  'js/adaptive-learning-cycle.js'
]){
  vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
}

const skill=JSON.parse(fs.readFileSync('data/learning/skills/which.json','utf8'));
const policy=JSON.parse(fs.readFileSync('data/learning/green-pass-authority.json','utf8'));
const Cycle=sandbox.AdaptiveLearningCycle;
const Profile=sandbox.GreenPassProfile;

const session={
  decision:{experienceId:'shopping-for-dinner',skill:'which.use.determiner',language:'en',chapter:'question-words'},
  trace:[]
};
const profile=Profile.createProfile('learner-test');
const attempt={
  skill:'which.use.determiner',
  language:'en',
  chapter:'question-words',
  correct:true,
  confidence:1,
  dimension:'choice-function',
  result:'pass',
  support:'none',
  context:'shopping-for-dinner'
};
const context={
  passContract:skill.passContract,
  greenPassAuthority:'contract',
  greenPassAuthorityPolicy:policy,
  currentExperience:'shopping-for-dinner',
  evidencePackets:[]
};

const result=Cycle.submit(profile,session,attempt,context);
assert.equal(result.operationalAuthority,'contract');
assert.equal(result.evidencePacket.dimension,'choice-function');
assert.equal(result.contractEvaluation.status,'WAITING_FOR_EVIDENCE');
assert.equal(result.contractEligible,false);
assert.equal(result.recommendation.action,'continue-assessment');
assert.equal(result.recommendation.reason,'waiting-for-contract-evidence');
assert.equal(result.advanceSelection,null);
assert.equal(result.nextContext.evidencePackets.length,1);

const missing=result.contractEvaluation.missing;
assert.equal(missing.length,2);
assert.ok(missing.some(x=>x.dimension==='determiner-use'&&x.support==='none'&&!x.mode));
assert.ok(missing.some(x=>x.dimension==='determiner-use'&&x.mode==='transfer'&&x.support==='none'));

assert.equal(result.greenPassComparison.contractGreenPass,false);
assert.ok(session.trace.some(x=>x.event==='learner-attempt'));
assert.ok(session.trace.some(x=>x.event==='green-pass-contract-evaluated'&&x.status==='WAITING_FOR_EVIDENCE'));

console.log('WHICH first Attempt contract: PASS — choice-function evidence is retained, two determiner-use requirements remain, GREEN/NEXT are not released.');
