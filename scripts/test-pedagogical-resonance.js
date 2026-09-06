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

const which = Resonance.select(experiences, 'which.use.determiner');
assert.equal(which.status, 'matched');
assert.equal(which.experienceId, 'shopping-for-dinner');
assert.equal(which.skill, 'which.use.determiner');
assert.deepEqual(which.matched.questionWords, ['which']);
assert.deepEqual(which.matched.languagePatterns, ['choose']);
assert.deepEqual(which.matched.perspectives, ['debating']);
assert.equal(which.matched.linkedVerbs.length, 0, 'choose may be present in the sentence bridge without being a linked verb');
assert.equal(which.score, 5);
assert.equal(which.evidenceStrength, 'moderate');

const noWhichOpportunity = Resonance.scoreExperience({
  id: 'no-which-opportunity',
  links: { verbs: ['buy'] },
  thinkingMind: [{ questionWord: 'what' }],
  perspectives: { describing: {} },
  note: 'We buy fresh cheese.'
}, 'which.use.determiner');
assert.equal(noWhichOpportunity.score, 0);
assert.deepEqual(noWhichOpportunity.matched.questionWords, []);
assert.deepEqual(noWhichOpportunity.matched.languagePatterns, []);
assert.deepEqual(noWhichOpportunity.matched.perspectives, []);

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
console.log('WHICH opportunity resonance: PASS — Shopping for a Nice Dinner exposes which + choose + debating without fabricating learner evidence.');
