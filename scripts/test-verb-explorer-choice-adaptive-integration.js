#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const listeners = { click: [] };
const calls = [];
const coordinatorCalls = [];
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

document.addEventListener('click', function(event) {
  const target = event.target && typeof event.target.closest === 'function'
    ? event.target.closest('[data-choice-select]')
    : null;
  if (target) state.experienceChoiceCandidate = target.dataset.choiceSelect;
});

assert.equal(sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.configure({
  profile, session, attempt, context,
  getState: () => state,
  getAttempt: () => attempt,
  getContext: () => context,
  getResumeState: currentState => currentState
}), true);

vm.runInContext(fs.readFileSync('js/verb-explorer-choice-adaptive-wire.js', 'utf8'), sandbox, { filename: 'js/verb-explorer-choice-adaptive-wire.js' });
assert.equal(sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install(), true);
assert.equal(sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install(), false, 'wire must install only once');
assert.equal(listeners.click.length, 2, 'existing UI handler and adaptive wire must both be present');

const choiceTarget = { dataset: { choiceSelect: 'choose' }, closest(selector) { return selector === '[data-choice-select]' ? this : null; } };
const nestedTarget = { closest(selector) { return selector === '[data-choice-select]' ? choiceTarget : null; } };

dispatchClick(nestedTarget);
assert.equal(state.experienceChoiceCandidate, 'choose');
assert.equal(calls.length, 0, 'adaptive submission must wait until the microtask');

Promise.resolve().then(function(){
  assert.equal(calls.length, 1, 'fallback path must preserve the already-homologated controller/provider submission');
  assert.equal(calls[0].context.learnerEvent.choice, 'choose');
  assert.strictEqual(calls[0].context.resumeState, state);

  sandbox.SIYAYOVerbExplorerAdaptiveCoordinator = Object.freeze({
    submitChoice(choice, target) {
      coordinatorCalls.push({ choice, target, stateChoice: state.experienceChoiceCandidate });
      return { coordinated: true };
    }
  });
  dispatchClick(nestedTarget);
  assert.equal(coordinatorCalls.length, 0, 'coordinator route must also wait until the microtask');
  return Promise.resolve();
}).then(function(){
  assert.equal(coordinatorCalls.length, 1, 'configured coordinator route must receive one choice exactly once');
  assert.equal(coordinatorCalls[0].choice, 'choose');
  assert.strictEqual(coordinatorCalls[0].target, choiceTarget);
  assert.equal(coordinatorCalls[0].stateChoice, 'choose', 'coordinator must observe state after existing UI handler');
  assert.equal(calls.length, 1, 'coordinator-first route must not also invoke fallback Cycle submission');

  const nonChoice = { closest() { return null; } };
  dispatchClick(nonChoice);
  return Promise.resolve();
}).then(function(){
  assert.equal(coordinatorCalls.length, 1, 'non-choice click must not reach coordinator');
  assert.equal(calls.length, 1, 'non-choice click must not reach fallback');

  sandbox.SIYAYOVerbExplorerAdaptiveCoordinator = null;
  const savedProvider = sandbox.SIYAYOVerbExplorerAdaptiveInputProvider;
  sandbox.SIYAYOVerbExplorerAdaptiveInputProvider = null;
  dispatchClick(choiceTarget);
  return Promise.resolve().then(function(){
    assert.equal(calls.length, 1, 'missing coordinator/provider must fail closed');
    sandbox.SIYAYOVerbExplorerAdaptiveInputProvider = savedProvider;
  });
}).then(function(){
  const savedController = sandbox.SIYAYOVerbExplorerAdaptiveController;
  sandbox.SIYAYOVerbExplorerAdaptiveController = null;
  dispatchClick(choiceTarget);
  return Promise.resolve().then(function(){
    assert.equal(calls.length, 1, 'missing coordinator/controller must fail closed');
    sandbox.SIYAYOVerbExplorerAdaptiveController = savedController;
  });
}).then(function(){
  console.log('Verb Explorer choice adaptive integration: PASS — wire prefers coordinator exactly once after existing state update, preserves fallback compatibility, nested targets/install-once guards, fail-closed behavior, and invents no NEXT.');
}).catch(function(error){
  console.error(error);
  process.exitCode = 1;
});
