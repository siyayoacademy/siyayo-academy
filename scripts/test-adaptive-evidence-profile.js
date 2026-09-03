const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile.js');

const profile = Profile.createProfile('patita-test');
assert.strictEqual(Profile.recommend(profile).action, 'observe');

Profile.record(profile, {
  source: 'multilingual-interference-evidence-gate',
  status: 'insufficient-evidence',
  repeated: [],
  requiresReview: false,
  conflict: false,
  requiresReinforcement: false
}, { language: 'pt', token: 'esquesito' });
assert.strictEqual(Profile.recommend(profile).action, 'observe');

Profile.record(profile, {
  source: 'multilingual-interference-evidence-gate',
  status: 'pattern-observed',
  repeated: [{ key: 'pt:esquesito:interference-hypothesis:', occurrences: 2 }],
  requiresReview: true,
  conflict: false,
  requiresReinforcement: false
}, { language: 'pt', token: 'esquesito' });
assert.strictEqual(Profile.recommend(profile).action, 'review-pattern');
assert.strictEqual(profile.confirmedReinforcements.length, 0);

// Even a reinforcement flag is not accepted without explicit confirmation.
Profile.record(profile, {
  status: 'pattern-observed',
  requiresReview: true,
  requiresReinforcement: true
}, { language: 'pt', token: 'esquesito', confirmed: false });
assert.strictEqual(profile.confirmedReinforcements.length, 0);

Profile.record(profile, {
  status: 'pattern-observed',
  requiresReview: true,
  requiresReinforcement: true
}, { language: 'pt', token: 'esquesito', confirmed: true });
assert.strictEqual(profile.confirmedReinforcements.length, 1);
assert.strictEqual(Profile.recommend(profile).action, 'reinforce');

console.log('Adaptive non-punitive evidence profile: PASS');
