#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sourcePath = 'js/verb-explorer-learner-event.js';
const sandbox = vm.createContext({});
sandbox.globalThis = sandbox;
vm.runInContext(fs.readFileSync(sourcePath, 'utf8'), sandbox, { filename: sourcePath });

const events = sandbox.SIYAYOVerbExplorerLearnerEvent;
assert(events, 'learner event boundary should exist');
assert.equal(typeof events.fromSentenceBuilt, 'function', 'BUILD SENTENCE needs an observational learner-event producer');

const state = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 2,
  experienceChoiceCandidate: 'fresh-mild-cheese'
});

const event = events.fromSentenceBuilt({
  canonicalCandidate: true,
  systemStructure: true
}, state);

assert(event, 'grounded canonical BUILD SENTENCE should produce an event');
assert.equal(event.observed, true);
assert.equal(event.actor, 'learner');
assert.equal(event.type, 'sentence-built');
assert.equal(event.source, 'build-sentence');
assert.equal(event.canonicalCandidate, true);
assert.equal(event.systemStructure, true);
assert.equal(event.currentExperienceId, 'shopping-for-dinner');
assert.equal(event.experienceLanguage, 'en');
assert.equal(event.experienceQuestion, 2);
assert.equal(event.experienceChoiceCandidate, 'fresh-mild-cheese');
assert.equal(Object.isFrozen(event), true);

assert.equal(events.fromSentenceBuilt({ canonicalCandidate: true, systemStructure: true }, {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: '',
  experienceQuestion: 2,
  experienceChoiceCandidate: 'fresh-mild-cheese'
}), null, 'missing language must fail closed');

assert.equal(events.fromSentenceBuilt({ canonicalCandidate: false, systemStructure: true }, state), null, 'noncanonical composition must fail closed');
assert.equal(events.fromSentenceBuilt({ canonicalCandidate: true, systemStructure: false }, state), null, 'non-system structure must fail closed');

console.log('Sentence-built learner event: PASS — BUILD SENTENCE observation is grounded by Experience + Language + Question + Choice.');
