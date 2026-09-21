#!/usr/bin/env node

const assert = require('node:assert/strict');
const LocalSource = require('../js/adaptive-determiner-use-probe-specification-source.js');
const TransferSource = require('../js/adaptive-determiner-use-transfer-probe-specification-source.js');
const Result = require('../js/adaptive-determiner-use-transfer-probe-result.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');
const nouns = require('../data/lexicon/nouns/nouns.json');

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const preparing = experiences.items.find(item => item.id === 'preparing-dinner');
const local = LocalSource.resolve(which, shopping, 'en');
const specification = TransferSource.resolve(which, local, preparing, nouns, 'en');
assert.ok(specification);

function event(choice, overrides = {}) {
  return {
    observed: true,
    actor: 'learner',
    relevantToWait: true,
    intent: 'continue',
    type: 'learner-response',
    source: 'determiner-use-transfer-probe-select',
    occurrenceId: 'determiner-use-transfer-probe-select:1',
    choice,
    fromExperienceId: 'shopping-for-dinner',
    experienceId: 'preparing-dinner',
    dimension: 'determiner-use',
    mode: 'transfer',
    targetForm: 'which',
    targetNoun: 'carrots',
    ...overrides
  };
}

const correct = Result.evaluate(specification, event('carrots'));
assert.deepEqual(correct, {
  occurrenceId: 'determiner-use-transfer-probe-select:1',
  fromExperienceId: 'shopping-for-dinner',
  experienceId: 'preparing-dinner',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  mode: 'transfer',
  targetForm: 'which',
  targetNoun: 'carrots',
  selectedAlternativeId: 'carrots',
  result: 'pass'
});
assert.ok(Object.isFrozen(correct));
assert.equal(
  Object.prototype.hasOwnProperty.call(correct, 'support'),
  false,
  'transfer Probe Result must not fabricate support authority'
);

const wrong = Result.evaluate(specification, event('should', {
  occurrenceId: 'determiner-use-transfer-probe-select:2'
}));
assert.ok(wrong);
assert.equal(wrong.selectedAlternativeId, 'should');
assert.equal(wrong.result, 'fail');
assert.equal(wrong.mode, 'transfer');

for (const alternative of ['we', 'cook']) {
  const evaluated = Result.evaluate(specification, event(alternative));
  assert.ok(evaluated);
  assert.equal(evaluated.result, 'fail');
}

assert.equal(Result.evaluate(null, event('carrots')), null);
assert.equal(Result.evaluate(specification, null), null);
assert.equal(Result.evaluate(specification, event('missing')), null);
assert.equal(Result.evaluate(specification, event('carrots', { observed: false })), null);
assert.equal(Result.evaluate(specification, event('carrots', { actor: 'system' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { source: 'determiner-use-probe-select' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { occurrenceId: '' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { mode: 'controlled-production' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { fromExperienceId: 'preparing-dinner' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { experienceId: 'shopping-for-dinner' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { dimension: 'choice-function' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { targetForm: 'what' })), null);
assert.equal(Result.evaluate(specification, event('carrots', { targetNoun: 'cheese' })), null);

console.log(
  'Adaptive determiner-use transfer probe result: PASS — grounded cross-Experience learner selection resolves pass/fail with explicit transfer authority and no fabricated support, Evidence, or progression.'
);
