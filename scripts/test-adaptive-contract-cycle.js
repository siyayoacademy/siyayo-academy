#!/usr/bin/env node

const assert = require('node:assert/strict');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');
const authorityPolicy = require('../data/learning/green-pass-authority.json');

function createSession(id, skill = 'which.use.determiner') {
  const evidenceProfile = AdaptiveEvidenceProfile.createProfile(id);
  AdaptiveEvidenceProfile.record(evidenceProfile, { source: 'contract-cycle-seed', status: 'transfer-confirmed', requiresReview: false, conflict: false, requiresReinforcement: true }, { confirmed: true, language: 'en', chapter: 'question-words', skill });
  const session = AdaptiveAttemptLoop.begin(AdaptiveEvidenceProfile, evidenceProfile, {});
  session.decision.skill = skill;
  session.decision.experienceId = 'shopping-for-dinner';
  return session;
}

const baseAttempt = { language: 'en', chapter: 'question-words', skill: 'which.use.determiner', correct: true, confidence: 0.95 };
const choiceAssisted = { ...baseAttempt, dimension: 'choice-function', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' };
const determinerAssisted = { ...baseAttempt, dimension: 'determiner-use', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' };
const determinerIndependent = { ...baseAttempt, dimension: 'determiner-use', result: 'pass', mode: 'free-production', support: 'none', context: 'preparing-dinner' };
const determinerTransfer = { ...baseAttempt, dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none', context: 'shopping-clothes' };

{
  const session = createSession('authority-no-contract');
  const profile = GreenPassProfile.createProfile('authority-no-contract');
  const result = AdaptiveLearningCycle.submit(profile, session, baseAttempt, {});
  assert.equal(result.operationalAuthority, 'legacy');
  assert.equal(result.contractEvaluation, null);
  assert.deepEqual(result.recommendation, result.legacyRecommendation);
}

// Missing Contract evidence is observational uncertainty, not automatic reinforcement.
{
  const session = createSession('authority-policy-which');
  let profile = GreenPassProfile.createProfile('authority-policy-which');
  let context = { passContract: which.passContract, evidencePackets: [] };
  function submit(attempt) {
    const result = AdaptiveLearningCycle.submit(profile, session, attempt, context);
    profile = result.greenProfile; context = result.nextContext;
    return result;
  }

  let result = submit(choiceAssisted);
  assert.equal(result.operationalAuthority, 'contract');
  assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(result.recommendation.action, 'continue-assessment');
  assert.equal(result.recommendation.reason, 'waiting-for-contract-evidence');
  assert.equal(result.advanceSelection, null);

  result = submit(determinerAssisted);
  assert.equal(result.legacyRecommendation.action, 'advance');
  assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(result.recommendation.action, 'continue-assessment');
  assert.equal(result.recommendation.authority, 'contract');
  assert.equal(result.advanceSelection, null);

  result = submit(determinerIndependent);
  assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(result.contractEvaluation.missing.length, 1);
  assert.equal(result.contractEvaluation.missing[0].mode, 'transfer');
  assert.equal(result.recommendation.action, 'continue-assessment');

  result = submit(determinerTransfer);
  assert.equal(result.contractEvaluation.status, 'GREEN_PASS');
  assert.equal(result.recommendation.action, 'advance');
  assert.equal(result.recommendation.authority, 'contract');
  assert.equal(result.greenPassComparison.agreement, true);
}

// HOW MUCH genericity remains on legacy authority while using the same Contract evaluator.
{
  const skill = 'how-much.use.uncountable';
  const passContract = { requires: [
    { dimension: 'quantity-function', result: 'pass' },
    { dimension: 'uncountable-use', result: 'pass', support: 'none' },
    { dimension: 'uncountable-use', result: 'pass', mode: 'transfer', support: 'none' }
  ] };
  const session = createSession('how-much-cycle-genericity', skill);
  let profile = GreenPassProfile.createProfile('how-much-cycle-genericity');
  let context = { passContract, evidencePackets: [] };
  const common = { language: 'en', chapter: 'question-words', skill, correct: true, confidence: 0.95 };
  function submit(attempt) {
    const result = AdaptiveLearningCycle.submit(profile, session, attempt, context);
    profile = result.greenProfile; context = result.nextContext;
    return result;
  }

  let result = submit({ ...common, dimension: 'quantity-function', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'preparing-dinner' });
  assert.equal(result.operationalAuthority, 'legacy');
  assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');

  result = submit({ ...common, dimension: 'uncountable-use', result: 'pass', mode: 'free-production', support: 'none', context: 'preparing-dinner' });
  assert.equal(result.operationalAuthority, 'legacy');
  assert.equal(result.contractEvaluation.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(result.contractEvaluation.missing[0].mode, 'transfer');

  result = submit({ ...common, dimension: 'uncountable-use', result: 'pass', mode: 'transfer', support: 'none', context: 'shopping-drinks' });
  assert.equal(result.operationalAuthority, 'legacy');
  assert.equal(result.contractEvaluation.status, 'GREEN_PASS');
  assert.equal(result.evidencePacket.skill, skill);
}

assert.equal(authorityPolicy.contractAuthoritySkills.includes('which.use.determiner'), true);
assert.equal(authorityPolicy.contractAuthoritySkills.includes('how-much.use.uncountable'), false);
assert.equal(AdaptiveLearningCycle.resolveAuthority({}, 'which.use.determiner'), 'legacy');
assert.equal(AdaptiveLearningCycle.resolveAuthority({ passContract: which.passContract }, 'which.use.determiner'), 'contract');

console.log('Adaptive contract cycle integration: PASS');
console.log('Evidence humility: WAITING_FOR_EVIDENCE -> continue-assessment, not forced reinforcement.');
console.log('Runtime genericity probe: synthetic HOW MUCH still reaches GREEN_PASS through the same adaptive cycle.');
