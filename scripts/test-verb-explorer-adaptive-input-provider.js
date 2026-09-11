#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({});
sandbox.globalThis = sandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-adaptive-input-provider.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-adaptive-input-provider.js' }
);

const provider = sandbox.SIYAYOVerbExplorerAdaptiveInputProvider;
assert.equal(typeof provider, 'function');
assert.equal(typeof provider.configure, 'function');
assert.equal(typeof provider.clear, 'function');
assert.equal(provider('choose'), null, 'unconfigured provider must produce no adaptive input');

const profile = { id: 'profile-1' };
const session = { id: 'session-1' };
const baseAttempt = { skill: 'which.use.determiner' };
const baseContext = { passContract: { skill: 'which.use.determiner' } };
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

assert.equal(provider.configure({}), false, 'incomplete configuration must be rejected');
assert.equal(provider.configure({
  profile,
  session,
  attempt: baseAttempt,
  context: baseContext,
  getState: () => state,
  getAttempt: (choice, currentState) => Object.assign({}, baseAttempt, {
    choice,
    context: currentState.currentExperienceId
  }),
  getContext: (choice, currentState) => Object.assign({}, baseContext, {
    choice,
    currentExperience: currentState.currentExperienceId
  })
}), true);

const input = provider('choose', { dataset: { choiceSelect: 'choose' } });
assert.strictEqual(input.profile, profile);
assert.strictEqual(input.session, session);
assert.equal(input.attempt.skill, 'which.use.determiner');
assert.equal(input.attempt.choice, 'choose');
assert.equal(input.context.currentExperience, 'shopping-for-dinner');
assert.strictEqual(input.state, state, 'provider must preserve the exact grounded state snapshot');
assert.strictEqual(input.resumeState, state, 'default resumeState must preserve the same grounded state');
assert.equal(input.state.experienceQuestion, 3);
assert.equal(input.state.experiencePerspective, 'debating');
assert.equal(input.state.experienceChoiceCandidate, 'choose');
assert.equal(input.state.lineOffset, 6);

provider.clear();
assert.equal(provider('choose'), null, 'cleared provider must produce no adaptive input');

console.log('Verb Explorer adaptive input provider: PASS — unconfigured/cleared states produce no input; configured state preserves grounded Cycle inputs and resume snapshot.');
