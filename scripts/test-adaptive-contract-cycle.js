#!/usr/bin/env node

const assert = require('node:assert/strict');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

const profileApi = {
  getReinforcementQueue() {
    return [{ language: 'en', chapter: 'question-words', skill: 'which.use.determiner' }];
  }
};

const evidenceProfile = {};
const session = AdaptiveAttemptLoop.begin(profileApi, evidenceProfile, {
  preferredExperience: 'shopping-for-dinner'
});

// Keep the reference skill explicit even if the legacy router chooses a fallback experience.
session.decision.skill = 'which.use.determiner';
session.decision.experienceId = 'shopping-for-dinner';

let greenProfile = GreenPassProfile.createProfile('which-contract-cycle');
let context = {
  passContract: which.passContract,
  evidencePackets: []
};

function submit(attempt) {
  const result = AdaptiveLearningCycle.submit(greenProfile, session, attempt, context);
  greenProfile = result.greenProfile;
  context = result.nextContext;
  return result;
}

let result = submit({
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  correct: true,
  confidence: 0.95,
  dimension: 'choice-function',
  result: 'pass',
  mode: 'controlled-production',
  support: 'audio',
  context: 'shopping-for-dinner'
});
assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(result.evidencePacket.support, 'audio');
assert.equal(context.evidencePackets.length, 1);

result = submit({
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  correct: true,
  confidence: 0.95,
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'controlled-production',
  support: 'audio',
  context: 'shopping-for-dinner'
});
assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(context.evidencePackets.length, 2);

result = submit({
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  correct: true,
  confidence: 0.95,
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'free-production',
  support: 'none',
  context: 'preparing-dinner'
});
assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(result.contractEvaluation.missing.length, 1);
assert.equal(result.contractEvaluation.missing[0].mode, 'transfer');
assert.equal(context.evidencePackets.length, 3);

result = submit({
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  correct: true,
  confidence: 0.95,
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'transfer',
  support: 'none',
  context: 'shopping-clothes'
});
assert.equal(result.contractEvaluation.status, 'GREEN_PASS');
assert.equal(result.contractEvaluation.satisfied, true);
assert.equal(context.evidencePackets.length, 4);

const contractTrace = session.trace.filter(entry => entry.event === 'green-pass-contract-evaluated');
assert.equal(contractTrace.length, 4);
assert.equal(contractTrace.at(-1).status, 'GREEN_PASS');

// Parallel mode: contract result is observable, but legacy recommendation remains operational authority.
assert.equal(result.recommendation.action, 'advance');
assert.equal(result.contractEvaluation.status, 'GREEN_PASS');

assert.throws(() => AdaptiveLearningCycle.submit(greenProfile, session, {
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  correct: true,
  confidence: 0.95
}, {
  passContract: which.passContract,
  evidencePackets: context.evidencePackets
}), /Evidence packet requires explicit/);

console.log('Adaptive contract cycle integration: PASS');
console.log('Attempt -> Evidence Packet -> accumulated Evidence -> Pass Contract -> observable GREEN_PASS');
