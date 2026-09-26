const assert = require('assert');
const Gate = require('../js/xespirito-interference-evidence-gate');
const Verifier = require('../js/interference-contrast-verifier');
const Bridge = require('../js/interference-adaptive-bridge');
const Profile = require('../js/adaptive-evidence-profile');

const profile = Profile.createProfile('longitudinal-cycle');
const evidence = [
  {
    language: 'pt',
    token: 'esquesito',
    evidenceType: 'interference-hypothesis',
    matchedLanguage: '',
    status: 'review-required'
  },
  {
    language: 'pt',
    token: 'esquesito',
    evidenceType: 'interference-hypothesis',
    matchedLanguage: '',
    status: 'review-required'
  }
];

// A: the gate observes a repeated linguistic pattern and creates K.
const gateResult = Gate.evaluate(evidence);
assert.strictEqual(gateResult.status, 'pattern-observed');
assert.strictEqual(gateResult.repeated.length, 1);
const pattern = gateResult.repeated[0];
const key = pattern.key;
assert.ok(key);

Profile.record(profile, gateResult, { language: 'pt', token: 'esquesito' });
assert.strictEqual(Profile.recommend(profile).action, 'review-pattern');
assert.strictEqual(profile.reinforcementCandidates.length, 1);

// B: a probe over the concrete A(K) is cleared. The verifier must preserve K.
const verification = Verifier.verify(pattern, {
  expectedLanguage: 'pt',
  selectedLanguage: 'pt',
  meaningCorrect: true,
  formCorrect: true
});
assert.strictEqual(verification.status, 'contrast-cleared');
assert.deepStrictEqual(verification.repeated, [{ key, occurrences: 2 }]);

// The bridge records B(K) without deleting A(K).
Bridge.apply(Profile, profile, verification, {
  language: 'pt',
  token: 'esquesito'
});
assert.strictEqual(profile.observations.length, 2);
assert.strictEqual(profile.observations[0].status, 'pattern-observed');
assert.strictEqual(profile.observations[0].repeated[0].key, key);
assert.strictEqual(profile.observations[1].status, 'contrast-cleared');
assert.strictEqual(profile.observations[1].repeated[0].key, key);
assert.strictEqual(profile.reinforcementCandidates.length, 1);

// Historical A remains, but B is the later evidence for the same K.
assert.strictEqual(Profile.recommend(profile).action, 'observe');

console.log('Longitudinal interference evidence cycle: PASS');
