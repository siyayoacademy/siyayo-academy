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

const sameState = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 'Which cheese should we choose?',
  experienceChoiceCandidate: 'fresh-mild-cheese',
  experiencePerspective: 'debating',
  experienceWordType: 'verb'
});

function requireOccurrenceIdentity(event) {
  return event && typeof event.occurrenceId === 'string' && event.occurrenceId.trim()
    ? event.occurrenceId.trim()
    : null;
}

// Exercise the real producer twice with the same learner action in the same
// contextual coordinates. The two records must still represent two distinct
// occurrences.
const firstChoice = boundary.fromChoiceSelect('fresh-mild-cheese', sameState);
const secondChoice = boundary.fromChoiceSelect('fresh-mild-cheese', sameState);

assert(firstChoice, 'first real learner event should be created');
assert(secondChoice, 'second real learner event should be created');
assert.equal(Object.isFrozen(firstChoice), true, 'first learner event should remain immutable');
assert.equal(Object.isFrozen(secondChoice), true, 'second learner event should remain immutable');

// Intentionally RED against current production: the real producer does not yet
// expose a grounded occurrence identity.
assert.ok(requireOccurrenceIdentity(firstChoice),
  'first repeated real choice must carry a grounded occurrence identity');
assert.ok(requireOccurrenceIdentity(secondChoice),
  'second repeated real choice must carry a grounded occurrence identity');
assert.notEqual(firstChoice.occurrenceId, secondChoice.occurrenceId,
  'two identical real actions in the same context must remain distinguishable');

// The identity must be reusable by evidence from that exact occurrence rather
// than inferred later from timestamps or mutable current state.
const firstOccurrenceEvidence = Object.freeze({
  occurrenceId: firstChoice.occurrenceId,
  dimension: 'choice-function',
  result: 'pass'
});
assert.equal(firstOccurrenceEvidence.occurrenceId, firstChoice.occurrenceId,
  'evidence from one learner occurrence must be correlatable to that event');

console.log('Choice occurrence identity contract: GREEN');
