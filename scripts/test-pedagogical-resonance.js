const assert = require('node:assert/strict');
const Resonance = require('../js/pedagogical-resonance.js');
const corpus = require('../data/learning/experience-seeds.json');

const experiences = corpus.items;

const modalRanking = Resonance.rank(experiences, 'modal-core');
assert.ok(modalRanking.length >= 4);
assert.ok(modalRanking[0].score > 0);
assert.ok(modalRanking[0].reasons.includes('language-pattern'));

const modal = Resonance.select(experiences, 'modal-core');
assert.ok(modal.experienceId);
assert.ok(['shopping-for-dinner', 'preparing-dinner', 'having-dinner', 'after-dinner-conversation'].includes(modal.experienceId));

const auxiliaryBe = Resonance.select(experiences, 'auxiliary-be');
assert.ok(auxiliaryBe.experienceId);
assert.ok(auxiliaryBe.score > 0);

const unknown = Resonance.select(experiences, 'unknown-skill');
assert.ok(unknown.experienceId);
assert.ok(unknown.reasons.includes('question-word'));
assert.ok(unknown.reasons.includes('perspective'));

const empty = Resonance.select([], 'modal-core');
assert.equal(empty, null);

console.log('Pedagogical resonance tests passed.');
