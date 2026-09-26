#!/usr/bin/env node

const assert = require('node:assert/strict');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

const evidenceProfile = AdaptiveEvidenceProfile.createProfile('dependency-head-cycle');
const session = AdaptiveAttemptLoop.begin(
  AdaptiveEvidenceProfile,
  evidenceProfile,
  {
    skill:'which.use.determiner',
    currentExperience:'shopping-for-dinner'
  }
);
session.decision.skill='which.use.determiner';
session.decision.experienceId='shopping-for-dinner';

const profile = GreenPassProfile.createProfile('dependency-head-cycle');

const existingPackets = [
  Object.freeze({
    skill:'which.use.determiner',
    dimension:'choice-function',
    result:'pass',
    support:'none',
    context:Object.freeze({
      occurrenceId:'choice-select:1',
      experienceId:'shopping-for-dinner',
      selectedAlternativeId:'fresh-mild-cheese'
    })
  }),
  Object.freeze({
    skill:'which.use.determiner',
    dimension:'determiner-use',
    result:'pass',
    support:'none',
    context:Object.freeze({
      occurrenceId:'determiner-use-probe-select:1',
      experienceId:'shopping-for-dinner',
      targetForm:'which',
      targetNoun:'cheese',
      selectedAlternativeId:'cheese'
    })
  })
];

const context={
  skill:'which.use.determiner',
  currentExperience:'shopping-for-dinner',
  passContract:which.passContract,
  evidencePackets:existingPackets
};

const before=GreenPassProfile.evaluateContract(which.passContract,existingPackets);
assert.equal(before.status,'WAITING_FOR_EVIDENCE');
assert.equal(before.requirements[0].satisfied,true);
assert.equal(before.requirements[1].satisfied,true);
assert.equal(before.requirements[2].satisfied,false);

const attempt=Object.freeze({
  occurrenceId:'dependency-head-probe-select:1',
  skill:'which.use.determiner',
  dimension:'head-identification',
  result:'pass',
  support:'none',
  context:Object.freeze({
    occurrenceId:'dependency-head-probe-select:1',
    experienceId:'shopping-for-dinner',
    structureId:'all-these-three-books',
    language:'en',
    targetTokenId:'three',
    selectedAlternativeId:'books'
  })
});

const result=AdaptiveLearningCycle.submit(profile,session,attempt,context);

assert.ok(result);
assert.equal(result.evidencePacket.skill,'which.use.determiner');
assert.equal(result.evidencePacket.dimension,'head-identification');
assert.equal(result.evidencePacket.result,'pass');
assert.equal(result.evidencePacket.support,'none');
assert.equal(Object.prototype.hasOwnProperty.call(result.evidencePacket,'mode'),false);

assert.equal(result.contractEvaluation.status,'WAITING_FOR_EVIDENCE');
assert.equal(result.contractEvaluation.satisfied,false);
assert.equal(result.contractEvaluation.requirements[0].satisfied,true);
assert.equal(result.contractEvaluation.requirements[1].satisfied,true);
assert.equal(result.contractEvaluation.requirements[2].satisfied,false);

assert.equal(result.contractEligible,false);
assert.equal(result.advanceSelection,null);
assert.equal(result.nextContext.currentExperience,'shopping-for-dinner');
assert.equal(result.nextContext.evidencePackets.length,3);
assert.equal(
  result.nextContext.evidencePackets.filter(packet=>packet.dimension==='head-identification').length,
  1
);
assert.equal(
  session.trace.filter(entry=>entry.event==='adaptive-next-selected').length,
  0,
  'head-identification Evidence must not silently authorize NEXT'
);
assert.equal(
  session.trace.filter(entry=>entry.event==='learner-attempt').length,
  1,
  'one Dependency Head Probe occurrence must contribute exactly one Cycle Attempt'
);

console.log(
  'Dependency Head Probe Cycle: PASS — head-identification enters the real adaptive Cycle as one Evidence packet, remains outside the current WHICH Pass Contract requirements, and authorizes neither Green Pass nor NEXT.'
);
