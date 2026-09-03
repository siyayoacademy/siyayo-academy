const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile');
const Bridge = require('../js/interference-adaptive-bridge');

const cleared = Profile.createProfile('cleared');
Bridge.apply(Profile, cleared, {
  source: 'multilingual-contrast-verifier',
  status: 'contrast-cleared',
  reinforcementConfirmed: false,
  requiresReinforcement: false
});
assert.strictEqual(Profile.recommend(cleared).action, 'observe');
assert.strictEqual(cleared.confirmedReinforcements.length, 0);

const unresolved = Profile.createProfile('unresolved');
Bridge.apply(Profile, unresolved, {
  source: 'multilingual-contrast-verifier',
  status: 'contrast-unresolved',
  reinforcementConfirmed: false,
  requiresReinforcement: false
});
assert.strictEqual(Profile.recommend(unresolved).action, 'review-pattern');
assert.strictEqual(unresolved.confirmedReinforcements.length, 0);

const confirmed = Profile.createProfile('confirmed');
Bridge.apply(Profile, confirmed, {
  source: 'multilingual-contrast-verifier',
  status: 'transfer-confirmed',
  reinforcementConfirmed: true,
  requiresReinforcement: true
}, { language: 'pt', token: 'exquisito' });
assert.strictEqual(Profile.recommend(confirmed).action, 'reinforce');
assert.strictEqual(confirmed.confirmedReinforcements.length, 1);
assert.strictEqual(confirmed.confirmedReinforcements[0].context.confirmed, true);

const spoofed = Profile.createProfile('spoofed');
Bridge.apply(Profile, spoofed, {
  source: 'multilingual-contrast-verifier',
  status: 'transfer-confirmed',
  reinforcementConfirmed: true,
  requiresReinforcement: false
});
assert.strictEqual(Profile.recommend(spoofed).action, 'observe');
assert.strictEqual(spoofed.confirmedReinforcements.length, 0);

console.log('Verified interference adaptive bridge: PASS');
