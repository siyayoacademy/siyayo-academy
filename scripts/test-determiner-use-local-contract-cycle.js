#!/usr/bin/env node

const assert = require('node:assert/strict');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

const evidenceProfile = AdaptiveEvidenceProfile.createProfile('determiner-local-learner');
const session = AdaptiveAttemptLoop.begin(
  AdaptiveEvidenceProfile,
  evidenceProfile,
  {
    skill: 'which.use.determiner',
    currentExperience: 'shopping-for-dinner'
  }
);
session.decision.skill = 'which.use.determiner';
session.decision.experienceId = 'shopping-for-dinner';

const profile = GreenPassProfile.createProfile('determiner-local-learner');

const existingChoiceEvidence = Object.freeze({
  skill: 'which.use.determiner',
  dimension: 'choice-function',
  result: 'pass',
  support: 'none',
  context: Object.freeze({
    occurrenceId: 'choice-select:1',
    experienceId: 'shopping-for-dinner',
    selectedAlternativeId: 'fresh-mild-cheese'
  })
});

const context = {
  skill: 'which.use.determiner',
  currentExperience: 'shopping-for-dinner',
  passContract: which.passContract,
  evidencePackets: [existingChoiceEvidence]
};

const before = GreenPassProfile.evaluateContract(
  which.passContract,
  context.evidencePackets
);
assert.equal(before.status, 'WAITING_FOR_EVIDENCE');
assert.equal(before.satisfied, false);
assert.equal(before.requirements[0].satisfied, true);
assert.equal(before.requirements[1].satisfied, false);
assert.equal(before.requirements[2].satisfied, false);

const localAttempt = Object.freeze({
  occurrenceId: 'determiner-use-probe-select:1',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  support: 'none',
  context: Object.freeze({
    occurrenceId: 'determiner-use-probe-select:1',
    experienceId: 'shopping-for-dinner',
    targetForm: 'which',
    targetNoun: 'cheese',
    selectedAlternativeId: 'cheese'
  })
});

const result = AdaptiveLearningCycle.submit(
  profile,
  session,
  localAttempt,
  context
);

assert.ok(result);
assert.equal(result.evidencePacket.dimension, 'determiner-use');
assert.equal(result.evidencePacket.result, 'pass');
assert.equal(result.evidencePacket.support, 'none');
assert.equal(
  Object.prototype.hasOwnProperty.call(result.evidencePacket, 'mode'),
  false,
  'local determiner-use evidence must remain non-transfer'
);

assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(result.contractEvaluation.satisfied, false);
assert.equal(result.contractEvaluation.requirements[0].satisfied, true);
assert.equal(result.contractEvaluation.requirements[1].satisfied, true);
assert.equal(result.contractEvaluation.requirements[2].satisfied, false);

assert.equal(result.operationalAuthority, 'contract');
assert.equal(result.contractEligible, false);
assert.equal(result.recommendation.action, 'continue-assessment');
assert.equal(result.advanceSelection, null);
assert.equal(result.nextContext.currentExperience, 'shopping-for-dinner');
assert.equal(result.nextContext.evidencePackets.length, 2);

assert.equal(
  session.trace.filter(entry => entry.event === 'adaptive-next-selected').length,
  0,
  '2/3 contract state must not authorize NEXT'
);
assert.equal(
  session.trace.filter(entry => entry.event === 'learner-attempt').length,
  1,
  'local determiner-use contributes exactly one Cycle Attempt'
);

console.log(
  'Determiner-use local contract Cycle: PASS — canonical local determiner-use moves WHICH contract from 1/3 to 2/3, preserves current Experience, and authorizes no NEXT.'
);
