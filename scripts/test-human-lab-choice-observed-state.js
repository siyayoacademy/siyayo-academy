#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({ Object, String });
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('labs/human-semantic-surface/lab-experience-runtime.js', 'utf8'),
  sandbox,
  { filename: 'labs/human-semantic-surface/lab-experience-runtime.js' }
);

const runtime = sandbox.SIYAYOVerbExplorerResumeRuntime;
assert.ok(runtime);
assert.equal(typeof runtime.captureContext, 'function');
assert.equal(typeof runtime.observeChoice, 'function');

const initial = runtime.captureContext();
assert.equal(initial.currentExperienceId, 'shopping-for-dinner');
assert.equal(initial.experienceLanguage, 'en', 'Human Lab must explicitly own its controlled interaction language');
assert.equal(initial.experienceQuestion, null);
assert.equal(initial.experienceChoiceCandidate, null);

const learnerEvent = Object.freeze({
  observed: true,
  actor: 'learner',
  relevantToWait: true,
  intent: 'continue',
  type: 'learner-response',
  source: 'choice-select',
  occurrenceId: 'choice-select:1',
  choice: 'fresh-mild-cheese',
  experienceId: 'shopping-for-dinner',
  question: 'Which cheese should we choose?',
  perspective: null,
  wordType: 'verb'
});

assert.equal(runtime.observeChoice(learnerEvent), true);

const grounded = runtime.captureContext();
assert.equal(grounded.currentExperienceId, 'shopping-for-dinner');
assert.equal(grounded.experienceLanguage, 'en');
assert.equal(grounded.experienceQuestion, 'Which cheese should we choose?');
assert.equal(grounded.experienceChoiceCandidate, 'fresh-mild-cheese');
assert.equal(grounded.experiencePerspective, null);
assert.equal(grounded.experienceWordType, 'verb');

for (const forbidden of ['profile', 'session', 'attempt', 'evidence', 'nextExperience']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(grounded, forbidden),
    false,
    'observed state must not invent ' + forbidden
  );
}

const preserved = runtime.captureContext();

assert.equal(
  runtime.observeChoice(Object.freeze({
    ...learnerEvent,
    occurrenceId: 'choice-select:2',
    experienceId: 'preparing-dinner'
  })),
  false,
  'mismatched Experience must preserve WAIT'
);
assert.deepStrictEqual(runtime.captureContext(), preserved);

assert.equal(
  runtime.observeChoice(Object.freeze({
    ...learnerEvent,
    occurrenceId: 'choice-select:3',
    actor: 'system'
  })),
  false,
  'non-learner event must preserve WAIT'
);
assert.deepStrictEqual(runtime.captureContext(), preserved);

assert.equal(
  runtime.observeChoice(Object.freeze({
    ...learnerEvent,
    occurrenceId: 'choice-select:4',
    choice: ''
  })),
  false,
  'missing Choice must preserve WAIT'
);
assert.deepStrictEqual(runtime.captureContext(), preserved);

console.log(
  'Human Lab observed Choice state: PASS — real learner Choice grounds E/L/Q/C only; mismatched or non-human events preserve WAIT; no Attempt/Evidence/NEXT is invented.'
);
