#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let minted = 0;
let controllerInput = null;

const observedEvent = Object.freeze({
  observed: true,
  actor: 'learner',
  relevantToWait: true,
  intent: 'continue',
  type: 'learner-response',
  source: 'choice-select',
  occurrenceId: 'choice-select:101',
  choice: 'fresh-mild-cheese',
  experienceId: 'shopping-for-dinner',
  question: 'Which cheese should we choose?'
});

const state = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 'Which cheese should we choose?',
  experienceChoiceCandidate: 'fresh-mild-cheese'
});

const attempt = Object.freeze({
  occurrenceId: observedEvent.occurrenceId,
  dimension: 'choice-function',
  result: 'pass',
  support: 'none',
  context: state
});

const profile = Object.freeze({ id: 'human-lab-learner-01' });
const session = {
  decision: {
    skill: 'which.use.determiner',
    experienceId: 'shopping-for-dinner'
  },
  trace: []
};
const context = Object.freeze({
  skill: 'which.use.determiner',
  currentExperience: 'shopping-for-dinner'
});

const sandbox = vm.createContext({
  Object,
  SIYAYOVerbExplorerLearnerEvent: Object.freeze({
    fromChoiceSelect() {
      minted += 1;
      return Object.freeze({
        ...observedEvent,
        occurrenceId: 'choice-select:legacy'
      });
    }
  }),
  SIYAYOVerbExplorerAdaptiveController: Object.freeze({
    submitChoice(input) {
      controllerInput = input;
      return Object.freeze({
        recommendation: Object.freeze({ action: 'continue-assessment' }),
        nextContext: context,
        greenProfile: profile
      });
    }
  })
});
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-adaptive-coordinator.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-adaptive-coordinator.js' }
);

const coordinator = sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
assert.equal(
  coordinator.configure({
    profile,
    session,
    context,
    getState() {
      return state;
    },
    getAttempt(choice, receivedState, target, learnerEvent) {
      assert.equal(choice, 'fresh-mild-cheese');
      assert.strictEqual(receivedState, state);
      assert.strictEqual(learnerEvent, observedEvent);
      return attempt;
    },
    getResumeState(receivedState) {
      return receivedState;
    }
  }),
  true
);

const output = coordinator.submitChoice(
  'fresh-mild-cheese',
  null,
  observedEvent
);

assert.ok(output);
assert.equal(minted, 0, 'Coordinator must not mint a second LearnerEvent when one observed event is supplied');
assert.ok(controllerInput);
assert.strictEqual(controllerInput.learnerEvent, observedEvent);
assert.strictEqual(controllerInput.attempt, attempt);
assert.equal(controllerInput.choice, 'fresh-mild-cheese');

controllerInput = null;
const fallbackOutput = coordinator.submitChoice('fresh-mild-cheese', null);
assert.ok(fallbackOutput);
assert.equal(minted, 1, 'legacy caller without an observed event must keep the existing minting behavior');
assert.ok(controllerInput);
assert.equal(controllerInput.learnerEvent.occurrenceId, 'choice-select:legacy');

console.log(
  'Verb Explorer Coordinator observed event: PASS — an already-observed learner Choice is reused exactly once; legacy callers still mint one event when none is supplied.'
);
