#!/usr/bin/env node

const assert = require('node:assert/strict');
const Resolver = require('../js/contextual-choice-resolver.js');
const Presenter = require('../js/adaptive-choice-resolution-presenter.js');

const choiceContext = Object.freeze({
  preferredTraits: Object.freeze([
    'fresh',
    'mild',
    'pairs-with-salmon',
    'suitable-for-special-dinner'
  ]),
  canonicalCandidates: Object.freeze([
    Object.freeze({
      id: 'fresh-mild-cheese',
      response: Object.freeze({
        en: 'We should choose the fresh, mild cheese.',
        es: 'Deberíamos elegir el queso fresco y suave.',
        pt: 'Devemos escolher o queijo fresco e suave.'
      }),
      contextTraits: Object.freeze([
        'fresh',
        'mild',
        'pairs-with-salmon',
        'suitable-for-special-dinner'
      ])
    }),
    Object.freeze({
      id: 'aged-strong-cheese',
      response: Object.freeze({
        en: 'We should choose the aged, strong cheese.',
        es: 'Deberíamos elegir el queso curado y fuerte.',
        pt: 'Devemos escolher o queijo maturado e forte.'
      }),
      contextTraits: Object.freeze([
        'aged',
        'strong',
        'overpowers-salmon',
        'suitable-for-cheese-board'
      ])
    })
  ])
});

const pass = Presenter.present(choiceContext, 'fresh-mild-cheese', 'en', Resolver);
assert.ok(pass);
assert.equal(pass.candidateId, 'fresh-mild-cheese');
assert.equal(pass.language, 'en');
assert.equal(pass.canonicalForm.valid, true);
assert.equal(pass.contextualResponse.score, 4);
assert.equal(pass.contextualResponse.possibleScore, 4);
assert.equal(pass.contextualResponse.status, 'Best contextual fit');
assert.ok(Object.isFrozen(pass));
assert.ok(Object.isFrozen(pass.canonicalForm));
assert.ok(Object.isFrozen(pass.contextualResponse));

const partial = Presenter.present(choiceContext, 'aged-strong-cheese', 'en', Resolver);
assert.ok(partial);
assert.equal(partial.canonicalForm.valid, true);
assert.equal(partial.contextualResponse.score, 0);
assert.equal(partial.contextualResponse.possibleScore, 4);
assert.equal(partial.contextualResponse.status, 'Contextually possible');

assert.equal(
  Object.prototype.hasOwnProperty.call(pass, 'ranking'),
  false,
  'presentation must not expose the full ranking'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(pass, 'preferredTraits'),
  false,
  'presentation must not expose scoring inputs'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(pass, 'correctAlternativeId'),
  false,
  'presentation must not invent correctness authority'
);

assert.equal(Presenter.present(choiceContext, 'missing', 'en', Resolver), null);
assert.equal(Presenter.present(null, 'fresh-mild-cheese', 'en', Resolver), null);
assert.equal(Presenter.present(choiceContext, '', 'en', Resolver), null);
assert.equal(Presenter.present(choiceContext, 'fresh-mild-cheese', 'en', null), null);

console.log(
  'Adaptive Choice Resolution Presenter: PASS — canonical resolver result projects immutable rendered semantics without exposing ranking, scoring inputs, Evidence, Attempt, or progression authority.'
);
