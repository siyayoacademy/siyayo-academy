#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = { click: [] };
const calls = [];
const document = {
  addEventListener(type, handler) {
    (listeners[type] || (listeners[type] = [])).push(handler);
  }
};
function dispatchClick(target) {
  for (const handler of listeners.click) handler({ target });
}

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
  'js/verb-explorer-adaptive-input-provider.js'
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
  experienceChoiceCandidate: null,
  experienceWordType: 'verb',
  experienceNounId: 'cheese',
  experienceAdjectiveId: null,
  lineOffset: 6
};
const profile = { id: 'profile-1' };
const session = { id: 'session-1' };
const attempt = { skill: 'which.use.determiner', result: 'pass' };
const context = { passContract: { skill: 'which.use.determiner' }, evidencePackets: [] };

// Model the existing Verb Explorer handler registering before the adaptive wire.
document.addEventListener('click', function(event) {
  const target = event.target && typeof event.target.closest === 'function'
    ? event.target.closest('[data-choice-select]')
    : null;
  if (target) state.experienceChoiceCandidate = target.dataset.choiceSelect;
});

assert.equal(sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.configure({
  profile,
  session,
  attempt,
  context,
  getState: () => state,
  getAttempt: () => attempt,
  getContext: () => context,
  getResumeState: currentState => currentState
}), true);

vm.runInContext(
  fs.readFileSync('js/verb-explorer-choice-adaptive-wire.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-choice-adaptive-wire.js' }
);

assert.equal(sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install(), true);
assert.equal(sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install(), false, 'wire must install only once');
assert.equal(listeners.click.length, 2, 'existing UI handler and adaptive wire must both be present');

const choiceTarget = {
  dataset: { choiceSelect: 'choose' },
  closest(selector) { return selector === '[data-choice-select]' ? this : null; }
};
const nestedTarget = {
  closest(selector) { return selector === '[data-choice-select]' ? choiceTarget : null; }
};

dispatchClick(nestedTarget);
assert.equal(state.experienceChoiceCandidate, 'choose', 'existing synchronous handler must record the choice before the adaptive microtask');
assert.equal(calls.length, 0, 'adaptive Cycle submission must wait until the microtask');

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
  assert.equal(call.context.resumeState.experienceChoiceCandidate, 'choose', 'provider must observe the state updated by the existing handler');
  assert.equal(call.context.advanceSelection, undefined, 'integration boundary must not invent NEXT');

  const nonChoice = { closest() { return null; } };
  dispatchClick(nonChoice);
  return Promise.resolve();
}).then(function(){
  assert.equal(calls.length, 1, 'non-choice click must never reach AdaptiveLearningCycle.submit');

  const savedProvider = sandbox.SIYAYOVerbExplorerAdaptiveInputProvider;
  sandbox.SIYAYOVerbExplorerAdaptiveInputProvider = null;
  dispatchClick(choiceTarget);
  return Promise.resolve().then(function(){
    assert.equal(calls.length, 1, 'missing provider must fail closed without Cycle submission');
    sandbox.SIYAYOVerbExplorerAdaptiveInputProvider = savedProvider;
  });
}).then(function(){
  const savedController = sandbox.SIYAYOVerbExplorerAdaptiveController;
  sandbox.SIYAYOVerbExplorerAdaptiveController = null;
  dispatchClick(choiceTarget);
  return Promise.resolve().then(function(){
    assert.equal(calls.length, 1, 'missing controller must fail closed without Cycle submission');
    sandbox.SIYAYOVerbExplorerAdaptiveController = savedController;
  });
}).then(function(){
  console.log('Verb Explorer choice adaptive integration: PASS — existing synchronous choice handler updates state first; adaptive wire submits in the following microtask exactly once, supports nested targets, installs once, and fails closed without provider/controller; no NEXT invented.');
}).catch(function(error){
  console.error(error);
  process.exitCode = 1;
});
