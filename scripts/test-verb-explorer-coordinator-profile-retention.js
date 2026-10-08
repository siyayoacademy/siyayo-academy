#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({ Object });
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/green-pass-profile.js', 'utf8'),
  sandbox,
  { filename: 'js/green-pass-profile.js' }
);
vm.runInContext(
  fs.readFileSync('js/verb-explorer-adaptive-profile-source.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-adaptive-profile-source.js' }
);

const source = sandbox.SIYAYOVerbExplorerAdaptiveProfileSource;
const initialProfile = source.begin('learner-profile-retention');
assert.ok(initialProfile);

const evolvedProfile = sandbox.GreenPassProfile.recordAttempt(initialProfile, {
  language: 'en',
  chapter: 'question-words',
  skill: 'which.use.determiner',
  correct: true,
  confidence: 0.95
});
assert.notStrictEqual(evolvedProfile, initialProfile);

const session = {
  decision: {
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  }
};
const state = Object.freeze({
  currentExperienceId: 'shopping-for-dinner'
});
const context = Object.freeze({
  currentExperience: 'shopping-for-dinner',
  skill: 'which.use.determiner'
});

sandbox.SIYAYOVerbExplorerLearnerEvent = Object.freeze({
  fromChoiceSelect(choice) {
    return Object.freeze({
      observed: true,
      actor: 'learner',
      source: 'choice-select',
      occurrenceId: 'choice-select:profile-retention',
      choice,
      experienceId: 'shopping-for-dinner'
    });
  }
});

sandbox.SIYAYOVerbExplorerAdaptiveController = Object.freeze({
  submitChoice() {
    return Object.freeze({
      greenProfile: evolvedProfile,
      nextContext: context
    });
  }
});

vm.runInContext(
  fs.readFileSync('js/verb-explorer-adaptive-coordinator.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-adaptive-coordinator.js' }
);

const coordinator = sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
assert.equal(coordinator.configure({
  profile: initialProfile,
  session,
  context,
  getState() { return state; },
  getAttempt() { return Object.freeze({ result: 'pass' }); },
  getResumeState(receivedState) { return receivedState; }
}), true);

const result = coordinator.submitChoice('candidate-a');
assert.ok(result);

assert.strictEqual(
  coordinator.snapshot().profile,
  evolvedProfile,
  'Coordinator must own the evolved Green Pass profile after the Cycle result'
);
assert.strictEqual(
  source.getProfile(),
  evolvedProfile,
  'canonical ProfileSource must retain the exact evolved P that Coordinator will carry into S2'
);

console.log(
  'Verb Explorer Coordinator profile retention: PASS — the evolved Green Pass P is retained by both Coordinator and canonical ProfileSource for the next Session.'
);
