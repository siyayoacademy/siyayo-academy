#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({});
sandbox.globalThis = sandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-learner-event.js' }
);

const boundary = sandbox.SIYAYOVerbExplorerLearnerEvent;
assert(boundary, 'learner-event boundary should be exposed');
assert.equal(typeof boundary.fromChoiceSelect, 'function');

const state = {
  currentExperienceId: 'shopping-for-dinner',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceWordType: 'verb'
};
const event = boundary.fromChoiceSelect('choose', state);

assert.equal(event.observed, true);
assert.equal(event.actor, 'learner');
assert.equal(event.relevantToWait, true);
assert.equal(event.intent, 'continue');
assert.equal(event.type, 'learner-response');
assert.equal(event.source, 'choice-select');
assert.equal(event.choice, 'choose');
assert.equal(event.experienceId, 'shopping-for-dinner');
assert.equal(event.question, 3);
assert.equal(event.perspective, 'debating');
assert.equal(event.wordType, 'verb');
assert.equal(Object.isFrozen(event), true, 'event history record should be immutable');

assert.equal(boundary.fromChoiceSelect('', state), null, 'empty choice must not create a learner event');
assert.equal(boundary.fromChoiceSelect(null, state), null, 'missing choice must not create a learner event');

const minimal = boundary.fromChoiceSelect('buy');
assert.equal(minimal.choice, 'buy');
assert.equal(minimal.experienceId, null);
assert.equal(minimal.question, null);
assert.equal(minimal.perspective, null);
assert.equal(minimal.wordType, null);

console.log('Verb Explorer learner event: PASS — choice-select creates one immutable grounded learner event; empty choices create none.');
