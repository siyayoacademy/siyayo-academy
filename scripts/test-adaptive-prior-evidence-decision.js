const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile.js');
const AttemptLoop = require('../js/adaptive-attempt-loop.js');

const skill = 'which.use.determiner';
const context = {
  skill,
  language: 'en',
  chapter: 'question-words',
  currentExperience: 'shopping-for-dinner'
};

const profile = Profile.createProfile('learner-history');

function record(source, confirmed) {
  Profile.record(profile, {
    source,
    status: confirmed ? 'transfer-confirmed' : 'pattern-observed',
    repeated: [],
    requiresReview: !confirmed,
    conflict: !confirmed,
    requiresReinforcement: confirmed
  }, {
    skill,
    language: 'en',
    chapter: 'question-words',
    confirmed
  });
}

// Evidence observed before S2 exists.
record('session-1', false);

const session2 = AttemptLoop.begin(Profile, profile, context);
const decision2 = session2.decision;

assert.strictEqual(decision2.priorEvidence.length, 1);
assert.strictEqual(decision2.priorEvidence[0].source, 'session-1');
assert.strictEqual(decision2.skill, skill);
assert.strictEqual(decision2.experienceId, 'shopping-for-dinner');
assert.strictEqual(decision2.action, 'continue-assessment');
assert.strictEqual(Object.prototype.hasOwnProperty.call(decision2, 'nextDecision'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(decision2, 'transition'), false);

// New evidence belongs to the longitudinal profile, not retroactively to Decision2.
record('session-2', true);
assert.strictEqual(profile.observations.length, 2);
assert.strictEqual(decision2.priorEvidence.length, 1);
assert.strictEqual(decision2.priorEvidence[0].source, 'session-1');

// A later Decision sees the accumulated grounded history available at its birth.
const session3 = AttemptLoop.begin(Profile, profile, context);
const decision3 = session3.decision;
assert.strictEqual(decision3.priorEvidence.length, 2);
assert.deepStrictEqual(decision3.priorEvidence.map(entry => entry.source), ['session-1', 'session-2']);
assert.strictEqual(decision3.skill, skill);
assert.strictEqual(Object.prototype.hasOwnProperty.call(decision3, 'nextDecision'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(decision3, 'transition'), false);

// The snapshot itself carries evidence only, not progression authority.
decision3.priorEvidence.forEach(entry => {
  assert.strictEqual(Object.prototype.hasOwnProperty.call(entry, 'action'), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(entry, 'score'), false);
  assert.strictEqual(Object.prototype.hasOwnProperty.call(entry, 'experienceId'), false);
});

console.log('PASS prior evidence is snapshotted per Decision without becoming progression authority.');
