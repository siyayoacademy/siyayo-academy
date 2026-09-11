#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const calls = [];
const sandbox = vm.createContext({});
sandbox.globalThis = sandbox;
sandbox.AdaptiveLearningCycle = {
  submit(profile, session, attempt, context) {
    calls.push({ profile, session, attempt, context });
    return { accepted: true, learnerEvent: context.learnerEvent };
  }
};

for (const file of [
  'js/verb-explorer-learner-event.js',
  'js/verb-explorer-adaptive-controller.js'
]) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const controller = sandbox.SIYAYOVerbExplorerAdaptiveController;
assert(controller, 'adaptive controller should be exposed');
assert.equal(typeof controller.submitChoice, 'function');

const profile = { id: 'profile-1' };
const session = { id: 'session-1' };
const attempt = { skill: 'which.use.determiner', result: 'pass' };
const context = { passContract: { requires: [] }, evidencePackets: [] };
const state = {
  currentExperienceId: 'shopping-for-dinner',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceWordType: 'verb',
  experienceChoiceCandidate: 'choose'
};

const result = controller.submitChoice({
  choice: 'choose', profile, session, attempt, context, state
});

assert.equal(calls.length, 1, 'valid choice should reach AdaptiveLearningCycle.submit exactly once');
assert.strictEqual(calls[0].profile, profile);
assert.strictEqual(calls[0].session, session);
assert.strictEqual(calls[0].attempt, attempt);
assert.equal(calls[0].context.passContract.requires.length, 0);
assert.equal(calls[0].context.learnerEvent.actor, 'learner');
assert.equal(calls[0].context.learnerEvent.source, 'choice-select');
assert.equal(calls[0].context.learnerEvent.choice, 'choose');
assert.equal(calls[0].context.learnerEvent.experienceId, 'shopping-for-dinner');
assert.strictEqual(calls[0].context.resumeState, state);
assert.equal(result.accepted, true);

const before = calls.length;
assert.equal(controller.submitChoice({ choice: '', profile, session, attempt, context, state }), null);
assert.equal(controller.submitChoice({ choice: null, profile, session, attempt, context, state }), null);
assert.equal(calls.length, before, 'empty or missing choices must never reach the adaptive Cycle');

console.log('Verb Explorer adaptive controller: PASS — one grounded choice reaches AdaptiveLearningCycle.submit exactly once; empty choices reach it zero times.');
