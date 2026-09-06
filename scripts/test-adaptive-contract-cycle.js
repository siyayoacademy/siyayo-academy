#!/usr/bin/env node

const assert = require('node:assert/strict');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

function createSession(id) {
  const evidenceProfile = AdaptiveEvidenceProfile.createProfile(id);
  AdaptiveEvidenceProfile.record(evidenceProfile, { source: 'contract-cycle-seed', status: 'transfer-confirmed', requiresReview: false, conflict: false, requiresReinforcement: true }, { confirmed: true, language: 'en', chapter: 'question-words', skill: 'which.use.determiner' });
  const session = AdaptiveAttemptLoop.begin(AdaptiveEvidenceProfile, evidenceProfile, {});
  session.decision.skill = 'which.use.determiner';
  session.decision.experienceId = 'shopping-for-dinner';
  return session;
}

const baseAttempt = { language: 'en', chapter: 'question-words', skill: 'which.use.determiner', correct: true, confidence: 0.95 };
const choiceAssisted = { ...baseAttempt, dimension: 'choice-function', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' };
const determinerAssisted = { ...baseAttempt, dimension: 'determiner-use', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' };
const determinerIndependent = { ...baseAttempt, dimension: 'determiner-use', result: 'pass', mode: 'free-production', support: 'none', context: 'preparing-dinner' };
const determinerTransfer = { ...baseAttempt, dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none', context: 'shopping-clothes' };

// 1. No contract: legacy remains the only authority.
{
  const session = createSession('authority-no-contract');
  let profile = GreenPassProfile.createProfile('authority-no-contract');
  const result = AdaptiveLearningCycle.submit(profile, session, baseAttempt, {});
  assert.equal(result.operationalAuthority, 'legacy');
  assert.equal(result.contractEvaluation, null);
  assert.deepEqual(result.recommendation, result.legacyRecommendation);
}

// 2. Contract present without opt-in: parallel observation, legacy remains authority.
{
  const session = createSession('authority-default-legacy');
  let profile = GreenPassProfile.createProfile('authority-default-legacy');
  let context = { passContract: which.passContract, evidencePackets: [] };
  let result = AdaptiveLearningCycle.submit(profile, session, choiceAssisted, context);
  profile = result.greenProfile; context = result.nextContext;
  result = AdaptiveLearningCycle.submit(profile, session, determinerAssisted, context);
  assert.equal(result.operationalAuthority, 'legacy');
  assert.equal(result.greenPassComparison.legacyGreenPass, true);
  assert.equal(result.greenPassComparison.contractGreenPass, false);
  assert.equal(result.recommendation.action, 'advance');
  assert.deepEqual(result.recommendation, result.legacyRecommendation);
}

// 3. Explicit contract opt-in: legacy may want advance, but Contract holds until its evidence is complete.
{
  const session = createSession('authority-contract');
  let profile = GreenPassProfile.createProfile('authority-contract');
  let context = { passContract: which.passContract, greenPassAuthority: 'contract', evidencePackets: [] };
  function submit(attempt) {
    const result = AdaptiveLearningCycle.submit(profile, session, attempt, context);
    profile = result.greenProfile; context = result.nextContext;
    return result;
  }

  let result = submit(choiceAssisted);
  assert.equal(result.operationalAuthority, 'contract');
  assert.equal(result.recommendation.action, 'reinforce');

  result = submit(determinerAssisted);
  assert.equal(result.legacyRecommendation.action, 'advance');
  assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(result.recommendation.action, 'reinforce');
  assert.equal(result.recommendation.authority, 'contract');
  assert.equal(result.advanceSelection, null);

  result = submit(determinerIndependent);
  assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(result.recommendation.action, 'reinforce');

  result = submit(determinerTransfer);
  assert.equal(result.contractEvaluation.status, 'GREEN_PASS');
  assert.equal(result.recommendation.action, 'advance');
  assert.equal(result.recommendation.authority, 'contract');
  assert.equal(result.greenPassComparison.agreement, true);

  const comparisonTrace = session.trace.filter(entry => entry.event === 'green-pass-comparison');
  assert.equal(comparisonTrace.length, 4);
  assert.equal(comparisonTrace[1].agreement, false);
  assert.equal(comparisonTrace[1].operationalAuthority, 'contract');
  assert.equal(comparisonTrace.at(-1).agreement, true);
}

assert.equal(AdaptiveLearningCycle.resolveAuthority({}), 'legacy');
assert.equal(AdaptiveLearningCycle.resolveAuthority({ passContract: which.passContract }), 'legacy');
assert.equal(AdaptiveLearningCycle.resolveAuthority({ passContract: which.passContract, greenPassAuthority: 'contract' }), 'contract');

console.log('Adaptive contract cycle integration: PASS');
console.log('Authority policy: no contract -> legacy; contract default -> legacy; explicit opt-in -> contract.');
