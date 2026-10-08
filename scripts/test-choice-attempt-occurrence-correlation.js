#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sourcePath = 'js/choice-attempt-source.js';
assert.equal(fs.existsSync(sourcePath), true, 'Choice Attempt Source must exist before correlation can be claimed.');

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

// occurrenceId belongs to the observed learner footprint. Sensors are correlated
// by the same grounded E/L/Q/C context and must not invent occurrence identity.
const learnerEvent = Object.freeze({
  observed: true,
  actor: 'learner',
  type: 'learner-response',
  source: 'choice-select',
  occurrenceId: 'choice-select:21',
  choice: 'fresh-mild-cheese'
});
const evidence = Object.freeze({ dimension: 'choice-function', result: 'pass', context });
const support = Object.freeze({ value: 'none', context });
const mode = Object.freeze({ value: 'controlled-production', context });

const attempt = source.assemble({ learnerEvent, evidence, support, mode, context });
assert(attempt, 'matching grounded signals should assemble one Attempt');
assert.equal(attempt.occurrenceId, learnerEvent.occurrenceId, 'Attempt identity must come from LearnerEvent');
assert.equal(attempt.dimension, 'choice-function');
assert.equal(attempt.result, 'pass');
assert.equal(attempt.support, 'none');
assert.equal(attempt.mode, 'controlled-production', 'observed mode must be preserved; transfer must not be invented');
assert.notEqual(attempt.context, context, 'Attempt context must be detached from live state');
assert.equal(Object.isFrozen(attempt.context), true, 'Attempt context should be immutable');
assert.equal(Object.isFrozen(attempt), true, 'assembled Attempt should be immutable');

const changedLanguage = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'es',
  experienceQuestion: 'Which cheese should we choose?',
  experienceChoiceCandidate: 'fresh-mild-cheese'
});
assert.equal(
  source.assemble({ learnerEvent, evidence, support: Object.freeze({ value: 'none', context: changedLanguage }), mode, context }),
  null,
  'signals from a different grounded context must fail closed rather than being combined'
);

assert.equal(source.assemble({ learnerEvent, evidence, support, mode: null, context }), null, 'incomplete Attempt evidence must fail closed');

const conflictingTaggedSupport = Object.freeze({ occurrenceId: 'choice-select:22', value: 'audio', context });
assert.equal(
  source.assemble({ learnerEvent, evidence, support: conflictingTaggedSupport, mode, context }),
  null,
  'if a signal explicitly carries occurrence identity, a conflict must fail closed'
);

console.log('Choice Attempt correlation: PASS — occurrence identity comes from the learner footprint; sensor signals correlate by grounded E/L/Q/C and fail closed on conflict.');
