#!/usr/bin/env node

const assert = require('node:assert/strict');
const LocalSource = require('../js/adaptive-determiner-use-probe-specification-source.js');
const TransferSource = require('../js/adaptive-determiner-use-transfer-probe-specification-source.js');
const Presenter = require('../js/adaptive-determiner-use-transfer-probe-presenter.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');
const nouns = require('../data/lexicon/nouns/nouns.json');

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const preparing = experiences.items.find(item => item.id === 'preparing-dinner');
const local = LocalSource.resolve(which, shopping, 'en');
const specification = TransferSource.resolve(which, local, preparing, nouns, 'en');
assert.ok(specification);

const view = Presenter.present(specification);
assert.ok(view, 'authorized transfer specification must project one learner-facing view');
assert.equal(view.skill, 'which.use.determiner');
assert.equal(view.fromExperienceId, 'shopping-for-dinner');
assert.equal(view.experienceId, 'preparing-dinner');
assert.equal(view.dimension, 'determiner-use');
assert.equal(view.mode, 'transfer');
assert.equal(view.targetForm, 'which');
assert.equal(view.targetNoun, 'carrots');
assert.equal(view.prompt, 'Which ___ should we cook first?');
assert.deepEqual(
  view.alternatives.map(item => item.id),
  ['carrots', 'should', 'we', 'cook']
);
assert.deepEqual(
  view.alternatives.map(item => item.label),
  ['carrots', 'should', 'we', 'cook']
);

assert.ok(Object.isFrozen(view));
assert.ok(Object.isFrozen(view.alternatives));
assert.ok(view.alternatives.every(Object.isFrozen));
assert.notStrictEqual(view.alternatives, specification.alternatives);

assert.equal(
  Object.prototype.hasOwnProperty.call(view, 'expectedAlternativeId'),
  false,
  'learner-facing transfer presenter must not expose correctness authority'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(view, 'question'),
  false,
  'presenter exposes the probe prompt, not duplicated canonical source metadata'
);

assert.equal(Presenter.present(null), null);
assert.equal(Presenter.present({}), null);
assert.equal(
  Presenter.present({ ...specification, mode: 'controlled-production' }),
  null,
  'only explicit transfer authority may enter transfer presenter'
);
assert.equal(
  Presenter.present({ ...specification, fromExperienceId: specification.experienceId }),
  null,
  'source and target Experiences must remain distinct'
);
assert.equal(
  Presenter.present({ ...specification, alternatives: [specification.alternatives[0]] }),
  null
);
assert.equal(
  Presenter.present({ ...specification, expectedAlternativeId: 'missing' }),
  null,
  'correctness authority must validate internally before being hidden'
);

console.log(
  'Adaptive determiner-use transfer probe presenter: PASS — explicit cross-Experience transfer projects immutable learner alternatives while hiding correctness authority.'
);
