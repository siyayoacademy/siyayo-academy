const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile');
const Loop = require('../js/adaptive-attempt-loop');

const profile = Profile.createProfile('evidence-bridge');
const session = Loop.begin(Profile, profile, {
  currentExperience: 'shopping-for-dinner',
  skill: 'which.use.determiner'
});

const evidence = Loop.toEvidencePacket(session, {
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'free-production',
  support: 'none',
  context: 'shopping-for-dinner'
});

assert.deepStrictEqual(evidence, {
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'free-production',
  support: 'none',
  context: 'shopping-for-dinner'
});

assert.throws(() => Loop.toEvidencePacket(session, {
  correct: true,
  confidence: 0.95
}), /Evidence packet requires explicit/);

const legacy = Loop.toGreenPassAttempt(session, {
  correct: true,
  confidence: 0.85
});
assert.strictEqual(legacy.correct, true);
assert.strictEqual(legacy.confidence, 0.85);
assert.strictEqual(Object.prototype.hasOwnProperty.call(legacy, 'dimension'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(legacy, 'result'), false);

console.log('Adaptive evidence bridge: PASS');
