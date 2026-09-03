const assert = require('node:assert/strict');
const Resonance = require('../js/pedagogical-resonance.js');
const corpus = require('../data/learning/experience-seeds.json');

const experiences = corpus.items;
const modalRanking = Resonance.rank(experiences, 'modal-core');
assert.ok(modalRanking.length >= 4);
assert.ok(modalRanking[0].score > 0);
assert.equal(modalRanking[0].skill, 'modal-core');
assert.ok(Object.hasOwn(modalRanking[0], 'contributions'));
assert.ok(Object.hasOwn(modalRanking[0], 'matched'));
assert.ok(['weak', 'moderate', 'strong'].includes(modalRanking[0].evidenceStrength));

const modal = Resonance.select(experiences, 'modal-core');
assert.equal(modal.status, 'matched');
assert.ok(modal.experienceId);
assert.ok(modal.score >= 1);

const auxiliaryBe = Resonance.select(experiences, 'auxiliary-be');
assert.equal(auxiliaryBe.status, 'matched');
assert.ok(auxiliaryBe.score > 0);

const unknown = Resonance.select(experiences, 'unknown-skill');
assert.equal(unknown.status, 'matched');
assert.equal(unknown.skill, 'unknown-skill');
assert.ok(unknown.matched.questionWords.length || unknown.matched.perspectives.length);

const impossible = Resonance.select(experiences, 'modal-core', { minimumScore: 99 });
assert.equal(impossible.status, 'no-resonance');
assert.equal(impossible.minimumScore, 99);
assert.ok(impossible.bestCandidate);

const empty = Resonance.select([], 'modal-core');
assert.equal(empty.status, 'no-resonance');
assert.equal(empty.bestCandidate, null);

const exactToken = Resonance.scoreExperience({ id: 'token-test', links: { verbs: [] }, thinkingMind: [], perspectives: {}, note: 'shoulder' }, 'modal-core');
assert.equal(exactToken.contributions.languagePattern, 0, 'should must not match shoulder');

console.log('Pedagogical resonance explainability tests passed.');
