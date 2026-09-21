#!/usr/bin/env node

const assert = require('node:assert/strict');
const Source = require('../js/adaptive-determiner-use-probe-specification-source.js');
const Result = require('../js/adaptive-determiner-use-probe-result.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const specification = Source.resolve(which, shopping, 'en');
assert.ok(specification);

function event(choice, overrides = {}) {
  return {
    observed: true,
    actor: 'learner',
    relevantToWait: true,
    intent: 'continue',
    type: 'learner-response',
    source: 'determiner-use-probe-select',
    occurrenceId: 'determiner-use-probe-select:1',
    choice,
    experienceId: 'shopping-for-dinner',
    dimension: 'determiner-use',
    targetForm: 'which',
    targetNoun: 'cheese',
    ...overrides
  };
}

const correct = Result.evaluate(specification, event('cheese'));
assert.deepEqual(correct, {
  occurrenceId: 'determiner-use-probe-select:1',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  targetForm: 'which',
  targetNoun: 'cheese',
  selectedAlternativeId: 'cheese',
  result: 'pass'
});
assert.ok(Object.isFrozen(correct));
assert.equal(
  Object.prototype.hasOwnProperty.call(correct, 'mode'),
  false,
  'local probe result must not fabricate transfer mode'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(correct, 'support'),
  false,
  'probe result must not fabricate support authority'
);

const wrong = Result.evaluate(specification, event('should', {
  occurrenceId: 'determiner-use-probe-select:2'
}));
assert.ok(wrong);
assert.equal(wrong.selectedAlternativeId, 'should');
assert.equal(wrong.result, 'fail');
assert.equal(wrong.occurrenceId, 'determiner-use-probe-select:2');

for (const alternative of ['we', 'choose']) {
  const evaluated = Result.evaluate(specification, event(alternative));
  assert.ok(evaluated);
  assert.equal(evaluated.result, 'fail');
}

assert.equal(Result.evaluate(null, event('cheese')), null);
assert.equal(Result.evaluate(specification, null), null);
assert.equal(Result.evaluate(specification, event('missing')), null);
assert.equal(Result.evaluate(specification, event('cheese', { observed: false })), null);
assert.equal(Result.evaluate(specification, event('cheese', { actor: 'system' })), null);
assert.equal(Result.evaluate(specification, event('cheese', { source: 'choice-select' })), null);
assert.equal(Result.evaluate(specification, event('cheese', { occurrenceId: '' })), null);
assert.equal(Result.evaluate(specification, event('cheese', { experienceId: 'preparing-dinner' })), null);
assert.equal(Result.evaluate(specification, event('cheese', { dimension: 'choice-function' })), null);
assert.equal(Result.evaluate(specification, event('cheese', { targetForm: 'what' })), null);
assert.equal(Result.evaluate(specification, event('cheese', { targetNoun: 'bread' })), null);

console.log(
  'Adaptive determiner-use probe result: PASS — grounded local learner selection resolves pass/fail against canonical authority without fabricating support, transfer, Evidence, or progression.'
);
