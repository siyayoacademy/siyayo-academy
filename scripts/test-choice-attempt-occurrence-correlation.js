#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sourcePath = 'js/choice-attempt-source.js';
assert.equal(
  fs.existsSync(sourcePath),
  true,
  'Choice Attempt Source must exist before occurrence correlation can be claimed.'
);

const sandbox = vm.createContext({});
sandbox.globalThis = sandbox;
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), sandbox, { filename: sourcePath });

const source = sandbox.SIYAYOChoiceAttemptSource;
assert(source, 'Choice Attempt Source should be exposed');
assert.equal(typeof source.assemble, 'function');

const context = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 'Which cheese should we choose?',
  experienceChoiceCandidate: 'fresh-mild-cheese'
});

const learnerEvent = Object.freeze({
  observed: true,
  actor: 'learner',
  type: 'learner-response',
  source: 'choice-select',
  occurrenceId: 'choice-select:21',
  choice: 'fresh-mild-cheese'
});

const evidence = Object.freeze({
  occurrenceId: 'choice-select:21',
  dimension: 'choice-function',
  result: 'pass',
  context
});

const support = Object.freeze({
  occurrenceId: 'choice-select:21',
  value: 'none',
  context
});

const mode = Object.freeze({
  occurrenceId: 'choice-select:21',
  value: 'controlled-production',
  context
});

const attempt = source.assemble({ learnerEvent, evidence, support, mode, context });
assert(attempt, 'matching occurrence signals should assemble one Attempt');
assert.equal(attempt.occurrenceId, 'choice-select:21');
assert.equal(attempt.dimension, 'choice-function');
assert.equal(attempt.result, 'pass');
assert.equal(attempt.support, 'none');
assert.equal(attempt.mode, 'controlled-production');
assert.notEqual(attempt.context, context, 'Attempt context must be detached from live state');
assert.equal(Object.isFrozen(attempt.context), true, 'Attempt context should be immutable');
assert.equal(Object.isFrozen(attempt), true, 'assembled Attempt should be immutable');

const wrongOccurrence = Object.freeze({
  occurrenceId: 'choice-select:22',
  value: 'audio',
  context
});
assert.equal(
  source.assemble({ learnerEvent, evidence, support: wrongOccurrence, mode, context }),
  null,
  'signals from different occurrences must fail closed rather than being combined'
);

assert.equal(
  source.assemble({ learnerEvent, evidence, support, mode: null, context }),
  null,
  'incomplete Attempt evidence must fail closed'
);

console.log('Choice Attempt occurrence correlation: PASS — one Attempt contains only signals from one grounded occurrence.');
