#!/usr/bin/env node

const assert = require('node:assert/strict');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');
const corpus = require('../data/learning/experience-seeds.json');

const evidenceProfile = AdaptiveEvidenceProfile.createProfile('determiner-transfer-learner');
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

const profile = GreenPassProfile.createProfile('determiner-transfer-learner');

const choiceEvidence = Object.freeze({
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

const localDeterminerEvidence = Object.freeze({
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

const before = GreenPassProfile.evaluateContract(
  which.passContract,
  [choiceEvidence, localDeterminerEvidence]
);
assert.equal(before.status, 'WAITING_FOR_EVIDENCE');
assert.equal(before.satisfied, false);
assert.equal(before.requirements[0].satisfied, true);
assert.equal(before.requirements[1].satisfied, true);
assert.equal(before.requirements[2].satisfied, false);

const transferAttempt = Object.freeze({
  occurrenceId: 'determiner-use-transfer-probe-select:1',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'transfer',
  support: 'none',
  context: Object.freeze({
    occurrenceId: 'determiner-use-transfer-probe-select:1',
    fromExperienceId: 'shopping-for-dinner',
    experienceId: 'preparing-dinner',
    targetForm: 'which',
    targetNoun: 'carrots',
    selectedAlternativeId: 'carrots'
  })
});

const context = {
  skill: 'which.use.determiner',
  currentExperience: 'shopping-for-dinner',
  experiences: corpus.items,
  minimumResonanceScore: 1,
  passContract: which.passContract,
  evidencePackets: [choiceEvidence, localDeterminerEvidence]
};

const result = AdaptiveLearningCycle.submit(
  profile,
  session,
  transferAttempt,
  context
);

assert.ok(result);
assert.equal(result.evidencePacket.dimension, 'determiner-use');
assert.equal(result.evidencePacket.result, 'pass');
assert.equal(result.evidencePacket.mode, 'transfer');
assert.equal(result.evidencePacket.support, 'none');

assert.equal(result.contractEvaluation.status, 'GREEN_PASS');
assert.equal(result.contractEvaluation.satisfied, true);
assert.equal(result.contractEvaluation.requirements[0].satisfied, true);
assert.equal(result.contractEvaluation.requirements[1].satisfied, true);
assert.equal(result.contractEvaluation.requirements[2].satisfied, true);
assert.deepEqual(result.contractEvaluation.missing, []);

assert.equal(result.operationalAuthority, 'contract');
assert.equal(result.contractEligible, true);

assert.equal(
  result.recommendation.action,
  'continue-assessment',
  'Green Pass eligibility must not manufacture NEXT'
);
assert.equal(result.recommendation.authority, 'contract');
assert.equal(result.recommendation.reason, 'green-pass-eligible-awaiting-route');

assert.ok(result.routeInspection);
assert.equal(result.routeInspection.action, 'continue-assessment');
assert.equal(result.routeInspection.contractEligible, true);
assert.equal(result.routeInspection.focus, 'eligible-opportunity');
assert.equal(result.routeInspection.experienceId, 'shopping-for-dinner');
assert.equal(result.routeInspection.reason, 'green-pass-eligible-opportunity-found');

assert.equal(result.advanceSelection, null);
assert.equal(result.nextContext.currentExperience, 'shopping-for-dinner');
assert.equal(result.nextContext.evidencePackets.length, 3);

assert.equal(
  session.trace.filter(entry => entry.event === 'adaptive-next-selected').length,
  0,
  'contract GREEN_PASS alone must not select NEXT'
);
assert.equal(
  session.trace.filter(entry => entry.event === 'learner-attempt').length,
  1,
  'transfer contributes exactly one Cycle Attempt'
);

const contractTrace = session.trace.find(entry =>
  entry.event === 'green-pass-contract-evaluated' &&
  entry.status === 'GREEN_PASS'
);
assert.ok(contractTrace, 'Cycle trace must record canonical GREEN_PASS contract closure');

const routeTrace = session.trace.find(entry =>
  entry.event === 'adaptive-route-inspected' &&
  entry.contractEligible === true
);
assert.ok(routeTrace, 'Cycle trace must record eligible route inspection');

console.log(
  'Determiner-use transfer contract Cycle: PASS — transfer Evidence closes WHICH 3/3 GREEN_PASS, marks contract eligibility, preserves the active Experience, and authorizes no automatic NEXT.'
);
