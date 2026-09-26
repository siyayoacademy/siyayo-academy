#!/usr/bin/env node

const assert = require('node:assert/strict');
const Source = require('../js/adaptive-choice-context-source.js');
const Presenter = require('../js/adaptive-choice-presenter.js');
const experiences = require('../data/learning/experience-seeds.json').items;
const whichSkill = require('../data/learning/skills/which.json');

const session = Object.freeze({
  decision: Object.freeze({
    skill: 'which.use.determiner',
    experienceId: 'shopping-for-dinner'
  })
});

const resolved = Source.resolve(session, whichSkill, experiences);
const view = Presenter.present(resolved);

assert.ok(view);
assert.equal(view.skill, 'which.use.determiner');
assert.equal(view.experienceId, 'shopping-for-dinner');
assert.equal(view.questionWord, 'which');
assert.equal(view.intention, 'choice');
assert.equal(view.question.en, 'Which cheese should we choose?');

assert.deepStrictEqual(
  view.alternatives.map(item => item.id),
  ['fresh-mild-cheese', 'aged-strong-cheese']
);
assert.equal(
  view.alternatives[0].response.en,
  'We should choose the fresh, mild cheese.'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(view, 'preferredTraits'),
  false,
  'presentation must not expose ranking inputs'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(view.alternatives[0], 'contextTraits'),
  false,
  'presentation must not expose contextual scoring traits'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(view, 'correctAlternativeId'),
  false,
  'presentation must not invent correctness authority'
);

assert.ok(Object.isFrozen(view));
assert.ok(Object.isFrozen(view.question));
assert.ok(Object.isFrozen(view.alternatives));
assert.ok(view.alternatives.every(Object.isFrozen));
assert.ok(view.alternatives.every(item => Object.isFrozen(item.response)));

assert.equal(Presenter.present(null), null);
assert.equal(Presenter.present({}), null);
assert.equal(
  Presenter.present({
    skill:'which.use.determiner',
    experienceId:'shopping-for-dinner',
    questionWord:'which',
    intention:'choice',
    question:{en:'Which?'},
    choiceContext:{canonicalCandidates:[]}
  }),
  null
);

console.log(
  'Adaptive Choice Presenter: PASS — exact Choice context projects immutable candidate responses without ranking, correctness, Attempt, or progression authority.'
);
