#!/usr/bin/env node

const assert = require('node:assert/strict');
const Profile = require('../js/adaptive-evidence-profile.js');
const Source = require('../js/adaptive-contract-closure-evidence-source.js');

const profile = Profile.createProfile('learner-trace');

const cycleResult = Object.freeze({
  contractEligible: true,
  contractEvaluation: Object.freeze({
    status: 'GREEN_PASS',
    satisfied: true,
    requirements: Object.freeze([
      Object.freeze({ dimension: 'choice-function', result: 'pass', satisfied: true }),
      Object.freeze({ dimension: 'determiner-use', result: 'pass', support: 'none', satisfied: true }),
      Object.freeze({ dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none', satisfied: true })
    ]),
    missing: Object.freeze([])
  })
});

const session = Object.freeze({
  decision: Object.freeze({
    skill: 'which.use.determiner',
    experienceId: 'shopping-for-dinner'
  })
});

const context = Object.freeze({
  language: 'en',
  chapter: 'question-words'
});

const recorded = Source.record(Profile, profile, {
  cycleResult,
  session,
  context
});

assert.strictEqual(recorded, profile);
assert.equal(profile.observations.length, 1);

const entry = profile.observations[0];
assert.equal(entry.source, 'green-pass-contract');
assert.equal(entry.status, 'transfer-confirmed');
assert.equal(entry.requiresReview, false);
assert.equal(entry.conflict, false);
assert.equal(entry.requiresReinforcement, false);
assert.deepEqual(entry.repeated, []);
assert.equal(entry.context.skill, 'which.use.determiner');
assert.equal(entry.context.language, 'en');
assert.equal(entry.context.chapter, 'question-words');
assert.equal(entry.context.confirmed, true);
assert.equal(entry.context.experienceId, 'shopping-for-dinner');
assert.equal(entry.context.contractStatus, 'GREEN_PASS');

const before = profile.observations.length;
assert.strictEqual(
  Source.record(Profile, profile, { cycleResult, session, context }),
  profile,
  'repeated closure recording should be idempotent'
);
assert.equal(profile.observations.length, before);

assert.equal(
  Source.record(Profile, profile, {
    cycleResult: {
      ...cycleResult,
      contractEligible: false
    },
    session,
    context
  }),
  null,
  'contract eligibility is required'
);

assert.equal(
  Source.record(Profile, profile, {
    cycleResult: {
      ...cycleResult,
      contractEvaluation: { status: 'WAITING_FOR_EVIDENCE', satisfied: false }
    },
    session,
    context
  }),
  null,
  'incomplete contract must not create confirmed longitudinal evidence'
);

assert.equal(
  Source.record(Profile, profile, {
    cycleResult,
    session: { decision: { experienceId: 'shopping-for-dinner' } },
    context
  }),
  null,
  'resolved canonical skill is required'
);

assert.equal(
  Source.record(null, profile, { cycleResult, session, context }),
  null,
  'canonical AdaptiveEvidenceProfile API is required'
);

console.log(
  'Adaptive contract closure Evidence source: PASS — one GREEN_PASS closure becomes one idempotent longitudinal transfer-confirmed observation without inventing review, reinforcement, or progression.'
);
