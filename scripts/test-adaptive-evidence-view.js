const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile.js');
const EvidenceView = require('../js/adaptive-evidence-view.js');

const profile = Profile.createProfile('learner-history');

assert.deepStrictEqual(EvidenceView.bySkill(profile, 'which.use.determiner'), []);
assert.deepStrictEqual(EvidenceView.bySkill(profile, ''), []);
assert.deepStrictEqual(EvidenceView.bySkill(null, 'which.use.determiner'), []);

Profile.record(profile, {
  source: 'first-session',
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

Profile.record(profile, {
  source: 'second-session',
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

Profile.record(profile, {
  source: 'other-skill',
  status: 'pattern-observed',
  requiresReview: true
}, {
  language: 'en',
  chapter: 'verbs',
  skill: 'verb-function',
  confirmed: false
});

const prior = EvidenceView.bySkill(profile, 'which.use.determiner');
assert.strictEqual(prior.length, 2);
assert.strictEqual(prior[0].source, 'first-session');
assert.strictEqual(prior[0].context.skill, 'which.use.determiner');
assert.strictEqual(prior[0].context.confirmed, false);
assert.strictEqual(prior[1].source, 'second-session');
assert.strictEqual(prior[1].context.confirmed, true);
assert.strictEqual(Object.isFrozen(prior), true);
assert.strictEqual(Object.isFrozen(prior[0]), true);
assert.strictEqual(Object.isFrozen(prior[0].context), true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(prior[0], 'action'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(prior[0], 'score'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(prior[0], 'experienceId'), false);

assert.strictEqual(EvidenceView.bySkill(profile, 'verb-function').length, 1);
assert.deepStrictEqual(EvidenceView.bySkill(profile, 'unknown.skill'), []);
assert.strictEqual(profile.observations.length, 3);

console.log('PASS adaptive evidence view reads prior evidence by explicit skill without inventing learner state, experience, score, or action.');
