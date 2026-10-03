#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

let attemptCalls = 0;
let controllerCalls = 0;

const state = Object.freeze({
  currentExperienceId: 'preparing-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 0,
  experienceChoiceCandidate: 's2-choice'
});

const profile = Object.freeze({ id: 'learner-s2' });
const session = {
  decision: {
    skill: 'which.use.determiner',
    experienceId: 'preparing-dinner'
  },
  trace: []
};
const context = Object.freeze({
  skill: 'which.use.determiner',
  currentExperience: 'preparing-dinner',
  evidencePackets: Object.freeze([])
});

const sandbox = vm.createContext({
  Object,
  SIYAYOVerbExplorerLearnerEvent: Object.freeze({
    fromChoiceSelect(choice, currentState) {
      return Object.freeze({
        observed: true,
        actor: 'learner',
        source: 'choice-select',
        occurrenceId: 'choice-select:fresh',
        choice,
        experienceId: currentState.currentExperienceId
      });
    }
  }),
  SIYAYOVerbExplorerAdaptiveController: Object.freeze({
    submitChoice(input) {
      controllerCalls += 1;
      assert.equal(input.session, session);
      assert.equal(input.state.currentExperienceId, 'preparing-dinner');
      assert.equal(input.learnerEvent.experienceId, 'preparing-dinner');
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
    getState() { return state; },
    getAttempt(choice, receivedState, target, learnerEvent) {
      attemptCalls += 1;
      assert.equal(choice, 's2-choice');
      assert.strictEqual(receivedState, state);
      assert.equal(learnerEvent.experienceId, 'preparing-dinner');
      return Object.freeze({
        occurrenceId: learnerEvent.occurrenceId,
        dimension: 'choice-function',
        result: 'pass',
        support: 'none',
        context: receivedState
      });
    },
    getResumeState(receivedState) { return receivedState; }
  }),
  true
);

const staleS1Event = Object.freeze({
  observed: true,
  actor: 'learner',
  source: 'choice-select',
  occurrenceId: 'choice-select:stale-s1',
  choice: 's2-choice',
  experienceId: 'shopping-for-dinner'
});

assert.equal(
  coordinator.submitChoice('s2-choice', null, staleS1Event),
  null,
  'an observed event from released S1 must not enter the S2 Attempt pipeline'
);
assert.equal(
  attemptCalls,
  0,
  'stale S1 event must be rejected before getAttempt'
);
assert.equal(controllerCalls, 0);

const freshS2Event = Object.freeze({
  observed: true,
  actor: 'learner',
  source: 'choice-select',
  occurrenceId: 'choice-select:fresh-s2',
  choice: 's2-choice',
  experienceId: 'preparing-dinner'
});

const accepted = coordinator.submitChoice('s2-choice', null, freshS2Event);
assert.ok(accepted);
assert.equal(attemptCalls, 1);
assert.equal(controllerCalls, 1);

const snapshot = coordinator.snapshot();
assert.ok(snapshot);
assert.strictEqual(snapshot.session, session);
assert.equal(snapshot.session.decision.experienceId, 'preparing-dinner');
assert.equal(snapshot.context.currentExperience, 'preparing-dinner');

const mismatchedLiveState = Object.freeze({
  ...state,
  currentExperienceId: 'shopping-for-dinner'
});

assert.equal(
  coordinator.configure({
    profile,
    session,
    context,
    getState() { return mismatchedLiveState; },
    getAttempt() {
      throw new Error('mismatched live state must not reach Attempt creation');
    },
    getResumeState() { return mismatchedLiveState; }
  }),
  true,
  'Coordinator configure remains a simple ownership setter; per-event session ownership guards live submission'
);

assert.equal(
  coordinator.submitChoice('s2-choice', null, freshS2Event),
  null,
  'S2 learner event must fail if live state has fallen back to S1'
);

console.log(
  'Verb Explorer post-transition Session ownership: PASS — released S1 events are rejected before Attempt creation, fresh S2 events are accepted, and live state must remain aligned with S2.'
);
