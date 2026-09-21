#!/usr/bin/env node

const assert = require('node:assert/strict');
const Source = require('../js/adaptive-determiner-use-probe-specification-source.js');
const Presenter = require('../js/adaptive-determiner-use-probe-presenter.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const specification = Source.resolve(which, shopping, 'en');
assert.ok(specification);

const view = Presenter.present(specification);
assert.ok(view, 'authorized determiner-use specification must project one learner-facing view');
assert.equal(view.skill, 'which.use.determiner');
assert.equal(view.experienceId, 'shopping-for-dinner');
assert.equal(view.dimension, 'determiner-use');
assert.equal(view.targetForm, 'which');
assert.equal(view.targetNoun, 'cheese');
assert.equal(view.prompt, 'Which ___ should we choose?');
assert.deepEqual(
  view.alternatives.map(item => item.id),
  ['cheese', 'should', 'we', 'choose']
);
assert.deepEqual(
  view.alternatives.map(item => item.label),
  ['cheese', 'should', 'we', 'choose']
);

assert.ok(Object.isFrozen(view));
assert.ok(Object.isFrozen(view.alternatives));
assert.ok(view.alternatives.every(Object.isFrozen));
assert.notStrictEqual(
  view.alternatives,
  specification.alternatives,
  'presenter must expose its own immutable projection'
);

assert.equal(
  Object.prototype.hasOwnProperty.call(view, 'expectedAlternativeId'),
  false,
  'learner-facing presenter must not expose correctness authority'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(view, 'mode'),
  false,
  'local determiner-use presenter must not claim transfer'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(view, 'question'),
  false,
  'presenter should expose the probe prompt, not duplicate canonical source metadata'
);

assert.equal(Presenter.present(null), null);
assert.equal(Presenter.present({}), null);
assert.equal(
  Presenter.present({ ...specification, alternatives: [specification.alternatives[0]] }),
  null,
  'probe requires multiple learner alternatives'
);
assert.equal(
  Presenter.present({
    ...specification,
    alternatives: [
      specification.alternatives[0],
      { ...specification.alternatives[1], id: specification.alternatives[0].id },
      specification.alternatives[2],
      specification.alternatives[3]
    ]
  }),
  null,
  'duplicate alternative ids must fail closed'
);
assert.equal(
  Presenter.present({ ...specification, expectedAlternativeId: 'missing' }),
  null,
  'source correctness must still validate internally before it is hidden'
);

console.log(
  'Adaptive determiner-use probe presenter: PASS — canonical local probe projects immutable learner alternatives without exposing correctness, transfer, or Evidence authority.'
);
