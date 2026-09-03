const assert = require('node:assert/strict');
const GreenPass = require('../js/green-pass-profile.js');

let profile = GreenPass.createProfile('candidate-01');
assert.equal(profile.greenPass, false);
assert.deepEqual(GreenPass.recommendNext(profile), { action: 'continue-assessment' });

profile = GreenPass.recordAttempt(profile, {
  language: 'en', chapter: 'verbs', skill: 'modal-core', correct: false, confidence: 0.4
});
profile = GreenPass.recordAttempt(profile, {
  language: 'en', chapter: 'verbs', skill: 'modal-core', correct: false, confidence: 0.5
});
assert.equal(profile.bySkill['en:verbs:modal-core'].status, 'reinforce');
assert.deepEqual(GreenPass.recommendNext(profile), { action: 'reinforce', skill: 'en:verbs:modal-core' });

profile = GreenPass.createProfile('candidate-02');
profile = GreenPass.recordAttempt(profile, {
  language: 'en', chapter: 'verbs', skill: 'modal-core', correct: true, confidence: 0.9
});
profile = GreenPass.recordAttempt(profile, {
  language: 'en', chapter: 'verbs', skill: 'modal-core', correct: true, confidence: 0.8
});
assert.equal(profile.bySkill['en:verbs:modal-core'].status, 'ready');
assert.equal(profile.greenPass, true);
assert.deepEqual(GreenPass.recommendNext(profile), { action: 'advance' });

console.log('Green Pass learner profile tests passed.');
