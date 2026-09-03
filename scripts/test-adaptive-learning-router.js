const assert = require('node:assert/strict');
const Router = require('../js/adaptive-learning-router.js');

const modal = Router.route({ action: 'reinforce', skill: 'en:verbs:modal-core' });
assert.equal(modal.action, 'reinforce');
assert.equal(modal.skill, 'modal-core');
assert.equal(modal.language, 'en');
assert.equal(modal.experienceId, 'shopping-for-dinner');
assert.equal(modal.focus, 'debating');
assert.equal(modal.questionWord, 'which');

const auxiliaryBe = Router.route({ action: 'reinforce', skill: 'pt:verbs:auxiliary-be' });
assert.equal(auxiliaryBe.language, 'pt');
assert.equal(auxiliaryBe.experienceId, 'preparing-dinner');
assert.equal(auxiliaryBe.focus, 'describing');

const unknown = Router.route({ action: 'reinforce', skill: 'es:verbs:unknown-skill' });
assert.equal(unknown.skill, 'unknown-skill');
assert.equal(unknown.experienceId, 'having-dinner');

const observing = Router.route({ action: 'continue-assessment' }, { currentExperience: 'preparing-dinner' });
assert.deepEqual(observing, { action: 'continue-assessment', experienceId: 'preparing-dinner', focus: 'assessment' });

const advance = Router.route({ action: 'advance' }, { nextExperience: 'having-dinner' });
assert.deepEqual(advance, { action: 'advance', experienceId: 'having-dinner', focus: null });

console.log('Adaptive learning router tests passed.');
