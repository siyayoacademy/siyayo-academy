const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile');
const Loop = require('../js/adaptive-attempt-loop');

const profile = Profile.createProfile('learner');
Profile.record(profile, {
  source: 'multilingual-contrast-verifier',
  status: 'confirmed-interference',
  requiresReview: true,
  requiresReinforcement: true
}, {
  confirmed: true,
  language: 'pt',
  chapter: 'verbs',
  skill: 'auxiliary-be'
});

const session = Loop.begin(Profile, profile);
assert.strictEqual(session.decision.action, 'reinforce');
assert.strictEqual(session.decision.experienceId, 'preparing-dinner');
assert.strictEqual(session.trace.length, 1);
assert.strictEqual(session.trace[0].archetype, 'patita');
assert.strictEqual(session.trace[0].event, 'experience-selected');

const footprint = Loop.recordAttempt(session, {
  correct: true,
  confidence: 0.85
});
assert.strictEqual(footprint.event, 'learner-attempt');
assert.strictEqual(footprint.experienceId, 'preparing-dinner');
assert.strictEqual(footprint.skill, 'auxiliary-be');
assert.strictEqual(footprint.correct, true);
assert.strictEqual(session.trace.length, 2);

const greenPassAttempt = Loop.toGreenPassAttempt(session, {
  correct: true,
  confidence: 0.85
});
assert.deepStrictEqual(greenPassAttempt, {
  language: 'pt',
  chapter: 'verbs',
  skill: 'auxiliary-be',
  correct: true,
  confidence: 0.85,
  source: 'adaptive-experience-attempt',
  experienceId: 'preparing-dinner'
});

const observing = Profile.createProfile('observing');
const observationSession = Loop.begin(Profile, observing, { currentExperience: 'having-dinner' });
assert.strictEqual(observationSession.decision.action, 'continue-assessment');
assert.strictEqual(observationSession.decision.experienceId, 'having-dinner');

console.log('Adaptive experience attempt loop: PASS');
