const assert = require('node:assert/strict');
const Router = require('../js/adaptive-learning-router.js');
const corpus = require('../data/learning/experience-seeds.json');

const modal = Router.route({ action: 'reinforce', skill: 'en:verbs:modal-core' });
assert.equal(modal.action, 'reinforce');
assert.equal(modal.skill, 'modal-core');
assert.equal(modal.language, 'en');
assert.equal(modal.experienceId, 'shopping-for-dinner');
assert.equal(modal.focus, 'debating');
assert.equal(modal.questionWord, 'which');
assert.equal(modal.contractEligible, false);

const auxiliaryBe = Router.route({ action: 'reinforce', skill: 'pt:verbs:auxiliary-be' });
assert.equal(auxiliaryBe.language, 'pt');
assert.equal(auxiliaryBe.experienceId, 'preparing-dinner');
assert.equal(auxiliaryBe.focus, 'describing');

const unknown = Router.route({ action: 'reinforce', skill: 'es:verbs:unknown-skill' });
assert.equal(unknown.skill, 'unknown-skill');
assert.equal(unknown.experienceId, 'having-dinner');

const nicePartyModal = Router.route(
  { action: 'reinforce', skill: 'en:verbs:modal-core' },
  { experiences: corpus.items }
);
assert.equal(nicePartyModal.resonance.status, 'matched');
assert.ok(nicePartyModal.resonance.score > 0);
assert.ok(['weak', 'moderate', 'strong'].includes(nicePartyModal.resonance.evidenceStrength));
assert.ok(nicePartyModal.resonance.matched);
assert.ok(nicePartyModal.resonance.contributions);
assert.ok(corpus.items.some(item => item.id === nicePartyModal.experienceId));

const guardedModal = Router.route(
  { action: 'reinforce', skill: 'en:verbs:modal-core' },
  { experiences: corpus.items, minimumResonanceScore: 99 }
);
assert.equal(guardedModal.resonance.status, 'no-resonance');
assert.equal(guardedModal.experienceId, 'shopping-for-dinner', 'insufficient resonance must preserve the canonical fallback');
assert.equal(guardedModal.resonance.minimumScore, 99);

const observing = Router.route({ action: 'continue-assessment' }, { currentExperience: 'preparing-dinner' });
assert.deepEqual(observing, {
  action: 'continue-assessment',
  experienceId: 'preparing-dinner',
  focus: 'assessment',
  contractEligible: false,
  reason: undefined
});

const eligibleWaiting = Router.route(
  { action: 'continue-assessment', reason: 'green-pass-eligible-awaiting-route' },
  { currentExperience: 'shopping-for-dinner', contractEligible: true }
);
assert.deepEqual(eligibleWaiting, {
  action: 'continue-assessment',
  experienceId: 'shopping-for-dinner',
  focus: 'eligible-opportunity',
  contractEligible: true,
  reason: 'green-pass-eligible-awaiting-opportunity'
});
assert.notEqual(eligibleWaiting.action, 'advance', 'eligibility alone must never manufacture an advance');

const advance = Router.route({ action: 'advance' }, { nextExperience: 'having-dinner', contractEligible: true });
assert.deepEqual(advance, { action: 'advance', experienceId: 'having-dinner', focus: null, contractEligible: true });

console.log('Adaptive learning router tests passed.');
console.log('Jaguar eligibility context: PASS — eligible changes decision context without forcing advance.');
