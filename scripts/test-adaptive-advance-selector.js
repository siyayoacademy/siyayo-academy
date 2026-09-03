const assert = require('assert');
const fs = require('fs');
const path = require('path');
const AdvanceSelector = require('../js/adaptive-advance-selector.js');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/learning/experience-seeds.json'), 'utf8'));
const experiences = corpus.items;

const preparing = AdvanceSelector.select({ action: 'advance' }, {
  currentExperience: 'shopping-for-dinner',
  experiences
});
assert.equal(preparing.status, 'selected');
assert.equal(preparing.experienceId, 'preparing-dinner');
assert.equal(preparing.entryVerb, 'cook');

const having = AdvanceSelector.select({ action: 'advance' }, {
  currentExperience: 'preparing-dinner',
  experiences
});
assert.equal(having.experienceId, 'having-dinner');
assert.equal(having.entryVerb, 'eat');

const conversation = AdvanceSelector.select({ action: 'advance' }, {
  currentExperience: 'having-dinner',
  experiences
});
assert.equal(conversation.experienceId, 'after-dinner-conversation');
assert.equal(conversation.entryVerb, 'talk');

const toroidalReturn = AdvanceSelector.select({ action: 'advance' }, {
  currentExperience: 'after-dinner-conversation',
  experiences
});
assert.equal(toroidalReturn.experienceId, 'shopping-for-dinner');
assert.equal(toroidalReturn.entryVerb, 'buy');

const missing = AdvanceSelector.select({ action: 'advance' }, {
  currentExperience: 'unknown-experience',
  experiences
});
assert.equal(missing.status, 'next-experience-required');
assert.equal(missing.experienceId, null);

const noAdvance = AdvanceSelector.select({ action: 'continue-assessment' }, {
  currentExperience: 'having-dinner',
  experiences
});
assert.equal(noAdvance.action, 'continue-assessment');
assert.equal(noAdvance.experienceId, 'having-dinner');

console.log('Adaptive advance selector tests passed.');
