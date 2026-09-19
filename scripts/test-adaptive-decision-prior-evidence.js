const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile.js');
const Loop = require('../js/adaptive-attempt-loop.js');

const profile = Profile.createProfile('learner-never-zero');
Profile.record(profile, {
  source: 'session-one',
  status: 'pattern-observed',
  requiresReview: true,
  conflict: true,
  requiresReinforcement: false
}, {
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  confirmed: false
});

const context = {
  currentExperience: 'shopping-for-dinner',
  skill: 'which.use.determiner'
};

const sessionTwo = Loop.begin(Profile, profile, context);
assert.strictEqual(sessionTwo.decision.priorEvidence.length, 1);
assert.strictEqual(sessionTwo.decision.priorEvidence[0].source, 'session-one');
assert.strictEqual(Object.isFrozen(sessionTwo.decision.priorEvidence), true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(sessionTwo.decision.priorEvidence[0], 'action'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(sessionTwo.decision.priorEvidence[0], 'score'), false);

Profile.record(profile, {
  source: 'session-two',
  status: 'transfer-confirmed',
  requiresReview: false,
  conflict: false,
  requiresReinforcement: true
}, {
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  confirmed: true
});

// Decision₂ remains the snapshot from the instant S₂ began.
assert.strictEqual(sessionTwo.decision.priorEvidence.length, 1);
assert.strictEqual(sessionTwo.decision.priorEvidence[0].source, 'session-one');

// A later Session sees the accumulated history available at its own Decision boundary.
const sessionThree = Loop.begin(Profile, profile, context);
assert.strictEqual(sessionThree.decision.priorEvidence.length, 2);
assert.deepStrictEqual(sessionThree.decision.priorEvidence.map(entry => entry.source), ['session-one', 'session-two']);

// Prior evidence is informational and does not manufacture progression authority.
assert.strictEqual(Object.prototype.hasOwnProperty.call(sessionThree.decision, 'nextDecision'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(sessionThree.decision, 'transition'), false);

console.log('PASS new Decisions receive a read-only prior-evidence snapshot without rewriting active Session history or creating progression authority.');
