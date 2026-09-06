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
  reason: undefined,
  resonance: null
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
  reason: 'green-pass-eligible-awaiting-opportunity',
  resonance: null
});
assert.notEqual(eligibleWaiting.action, 'advance', 'eligibility alone must never manufacture an advance');

const eligibleWhich = Router.route(
  { action: 'continue-assessment', skill: 'which.use.determiner', reason: 'green-pass-eligible-awaiting-route' },
  {
    currentExperience: 'shopping-for-dinner',
    contractEligible: true,
    experiences: corpus.items,
    minimumResonanceScore: 1
  }
);
assert.equal(eligibleWhich.action, 'continue-assessment');
assert.equal(eligibleWhich.experienceId, 'shopping-for-dinner', 'resonance must not manufacture an inter-Experience move');
assert.equal(eligibleWhich.focus, 'eligible-opportunity');
assert.equal(eligibleWhich.contractEligible, true);
assert.equal(eligibleWhich.reason, 'green-pass-eligible-opportunity-found');
assert.equal(eligibleWhich.resonance.status, 'matched');
assert.equal(eligibleWhich.resonance.score, 5);
assert.deepEqual(eligibleWhich.resonance.matched.questionWords, ['which']);
assert.deepEqual(eligibleWhich.resonance.matched.languagePatterns, ['choose']);
assert.deepEqual(eligibleWhich.resonance.matched.perspectives, ['debating']);
assert.notEqual(eligibleWhich.action, 'advance', 'a meaningful opportunity is not an advance order');

const eligibleWhichGuarded = Router.route(
  { action: 'continue-assessment', skill: 'which.use.determiner' },
  {
    currentExperience: 'shopping-for-dinner',
    contractEligible: true,
    experiences: corpus.items,
    minimumResonanceScore: 99
  }
);
assert.equal(eligibleWhichGuarded.action, 'continue-assessment');
assert.equal(eligibleWhichGuarded.reason, 'green-pass-eligible-awaiting-opportunity');
assert.equal(eligibleWhichGuarded.resonance.status, 'no-resonance');
assert.notEqual(eligibleWhichGuarded.action, 'advance');

const advance = Router.route({ action: 'advance' }, { nextExperience: 'having-dinner', contractEligible: true });
assert.deepEqual(advance, { action: 'advance', experienceId: 'having-dinner', focus: null, contractEligible: true });

console.log('Adaptive learning router tests passed.');
console.log('Jaguar eligibility context: PASS — eligible changes decision context without forcing advance.');
console.log('Jaguar WHICH opportunity inspection: PASS — resonance can expose an existing opportunity while preserving the current Experience.');
