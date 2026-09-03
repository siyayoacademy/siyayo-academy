const assert = require('node:assert/strict');
const GreenPass = require('../js/green-pass-profile.js');
const Bridge = require('../js/xespirito-green-pass-bridge.js');

const profile = GreenPass.createProfile('candidate-01');
const interpretation = {
  evidenceCount: 3,
  conflictEvidenceCount: 3,
  clearEvidenceCount: 0,
  signals: [
    { piece: 'modal-core', occurrences: 2, status: 'requires-reinforcement' },
    { piece: 'auxiliary-have', occurrences: 1, status: 'observed-conflict' }
  ],
  hasReinforcementSignal: true
};

const result = Bridge.applyEvidence(profile, interpretation, {
  language: 'en',
  chapter: 'verbs'
});

assert.equal(result.appliedSignals, 2);
assert.equal(result.sourceEvidenceCount, 3);
assert.equal(result.profile.attempts, 3);
assert.equal(result.profile.bySkill['en:verbs:modal-core'].attempts, 2);
assert.equal(result.profile.bySkill['en:verbs:modal-core'].status, 'reinforce');
assert.equal(result.profile.bySkill['en:verbs:auxiliary-have'].attempts, 1);
assert.equal(result.profile.bySkill['en:verbs:auxiliary-have'].status, 'observing');
assert.deepEqual(result.profile.reinforcement, ['en:verbs:modal-core']);
assert.deepEqual(result.recommendation, { action: 'reinforce', skill: 'en:verbs:modal-core' });

const empty = Bridge.applyEvidence(GreenPass.createProfile(), { evidenceCount: 2, signals: [] });
assert.equal(empty.profile.attempts, 0);
assert.deepEqual(empty.recommendation, { action: 'continue-assessment' });

console.log('Xespirito -> Green Pass bridge: PASS');
