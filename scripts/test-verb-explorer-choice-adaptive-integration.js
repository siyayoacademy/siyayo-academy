#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = {};
const calls = [];
const document = {
  addEventListener(type, handler) { listeners[type] = handler; }
};
const sandbox = vm.createContext({ document, Promise, Object });
sandbox.globalThis = sandbox;
sandbox.AdaptiveLearningCycle = {
  submit(profile, session, attempt, context) {
    calls.push({ profile, session, attempt, context });
    return { accepted: true, resumeEvaluation: null, advanceSelection: null };
  }
};

for (const file of [
  'js/verb-explorer-learner-event.js',
  'js/verb-explorer-adaptive-controller.js',
  'js/verb-explorer-adaptive-input-provider.js',
  'js/verb-explorer-choice-adaptive-wire.js'
]) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const state = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceTense: 'present',
  experienceForm: 'interrogative',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceChoiceCandidate: 'choose',
  experienceWordType: 'verb',
  experienceNounId: 'cheese',
  experienceAdjectiveId: null,
  lineOffset: 6
};
const profile = { id: 'profile-1' };
const session = { id: 'session-1' };
const attempt = { skill: 'which.use.determiner', result: 'pass' };
const context = { passContract: { skill: 'which.use.determiner' }, evidencePackets: [] };

assert.equal(sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.configure({
  profile, session, attempt, context, state
}), true);
assert.equal(sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install(), true);
assert.equal(typeof listeners.click, 'function');

const target = {
  dataset: { choiceSelect: 'choose' },
  closest(selector) { return selector === '[data-choice-select]' ? this : null; }
};
listeners.click({ target });

Promise.resolve().then(function(){
  assert.equal(calls.length, 1, 'one real choice-select click must reach AdaptiveLearningCycle.submit exactly once');
  const call = calls[0];
  assert.strictEqual(call.profile, profile);
  assert.strictEqual(call.session, session);
  assert.strictEqual(call.attempt, attempt);
  assert.equal(call.context.learnerEvent.observed, true);
  assert.equal(call.context.learnerEvent.actor, 'learner');
  assert.equal(call.context.learnerEvent.source, 'choice-select');
  assert.equal(call.context.learnerEvent.choice, 'choose');
  assert.equal(call.context.learnerEvent.experienceId, 'shopping-for-dinner');
  assert.equal(call.context.learnerEvent.question, 3);
  assert.equal(call.context.learnerEvent.perspective, 'debating');
  assert.strictEqual(call.context.resumeState, state);
  assert.equal(call.context.advanceSelection, undefined, 'integration boundary must not invent NEXT');

  const nonChoice = { closest() { return null; } };
  listeners.click({ target: nonChoice });
  return Promise.resolve();
}).then(function(){
  assert.equal(calls.length, 1, 'non-choice click must never reach AdaptiveLearningCycle.submit');
  console.log('Verb Explorer choice adaptive integration: PASS — real choice-select boundary reaches AdaptiveLearningCycle.submit exactly once with grounded state; non-choice reaches it zero times; no NEXT invented.');
}).catch(function(error){
  console.error(error);
  process.exitCode = 1;
});
