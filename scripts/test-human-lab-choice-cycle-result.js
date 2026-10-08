#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

function card(classes, scoreText) {
  return {
    classList: {
      contains(name) {
        return classes.includes(name);
      }
    },
    querySelector(selector) {
      return selector === 'p' && scoreText
        ? { textContent: scoreText }
        : null;
    }
  };
}

const canonicalCard = card(['is-valid']);
const contextualCard = card(['is-contextual'], '4 / 4');
const documentRef = {
  getElementById(id) {
    if (id !== 'choiceFeedback') return null;
    return {
      querySelector(selector) {
        if (selector.includes('is-valid')) return canonicalCard;
        if (selector.includes('is-contextual')) return contextualCard;
        return null;
      }
    };
  }
};

const evidenceProfile = AdaptiveEvidenceProfile.createProfile('human-lab-learner-01');
const session = AdaptiveAttemptLoop.begin(
  AdaptiveEvidenceProfile,
  evidenceProfile,
  {
    skill: 'which.use.determiner',
    currentExperience: 'shopping-for-dinner'
  }
);
session.decision.skill = 'which.use.determiner';
session.decision.experienceId = 'shopping-for-dinner';

const profile = GreenPassProfile.createProfile('human-lab-learner-01');
const context = Object.freeze({
  skill: 'which.use.determiner',
  currentExperience: 'shopping-for-dinner',
  passContract: which.passContract,
  evidencePackets: Object.freeze([])
});

const sandbox = vm.createContext({
  console,
  Object,
  Number,
  String,
  AdaptiveLearningCycle
});
sandbox.globalThis = sandbox;

function load(file) {
  vm.runInContext(
    fs.readFileSync(file, 'utf8'),
    sandbox,
    { filename: file }
  );
}

load('labs/human-semantic-surface/lab-experience-runtime.js');
load('js/verb-explorer-learner-event.js');

const firstEvent = sandbox.SIYAYOVerbExplorerLearnerEvent.fromChoiceSelect(
  'fresh-mild-cheese',
  {
    currentExperienceId: 'shopping-for-dinner',
    experienceQuestion: 'Which cheese should we choose?',
    experiencePerspective: null,
    experienceWordType: 'verb'
  }
);
assert.ok(firstEvent);
assert.equal(
  sandbox.SIYAYOVerbExplorerResumeRuntime.observeChoice(firstEvent),
  true
);

load('js/verb-explorer-adaptive-state-bridge.js');
load('js/choice-evidence-evaluator.js');
load('js/verb-explorer-choice-resolution-reader.js');
load('js/verb-explorer-choice-evidence-bridge.js');
load('js/choice-support-sensor.js');
load('labs/human-semantic-surface/lab-choice-support-runtime.js');
load('js/choice-attempt-ownership.js');
load('js/choice-attempt-boundary.js');
load('js/verb-explorer-choice-attempt-factory.js');
load('js/verb-explorer-choice-attempt-provider.js');
load('js/verb-explorer-adaptive-controller.js');
load('js/verb-explorer-adaptive-coordinator.js');

const stateBridge = sandbox.SIYAYOVerbExplorerAdaptiveStateBridge;
const attemptProvider = sandbox.SIYAYOVerbExplorerChoiceAttemptProvider;
const coordinator = sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;

assert.ok(stateBridge && typeof stateBridge.getState === 'function');
assert.ok(attemptProvider && typeof attemptProvider.getAttempt === 'function');
assert.ok(coordinator && typeof coordinator.configure === 'function');

assert.equal(
  coordinator.configure({
    profile,
    session,
    context,
    getState: stateBridge.getState,
    getResumeState: stateBridge.getResumeState,
    getAttempt(choice, state, target, learnerEvent) {
      return attemptProvider.getAttempt(
        choice,
        state,
        target,
        learnerEvent,
        documentRef
      );
    }
  }),
  true
);

const before = coordinator.snapshot();
assert.ok(before);
assert.equal(before.profile.attempts, 0);
assert.equal(before.session.trace.filter(entry => entry.event === 'learner-attempt').length, 0);

const output = coordinator.submitChoice('fresh-mild-cheese', null);
assert.ok(output, 'grounded Human Lab Choice must reach Coordinator/Controller/Cycle');
assert.ok(output.cycleResult);

const result = output.cycleResult;
assert.equal(result.attempt.skill, 'which.use.determiner');
assert.equal(result.evidencePacket.dimension, 'choice-function');
assert.equal(result.evidencePacket.result, 'pass');
assert.equal(result.evidencePacket.support, 'none');
assert.equal(result.operationalAuthority, 'contract');
assert.equal(result.contractEligible, false);
assert.equal(result.recommendation.action, 'continue-assessment');
assert.equal(result.advanceSelection, null);
assert.equal(result.nextContext.currentExperience, 'shopping-for-dinner');
assert.equal(
  session.trace.filter(entry => entry.event === 'adaptive-next-selected').length,
  0,
  'first Human Lab Choice must not authorize NEXT'
);
assert.equal(
  session.trace.filter(entry => entry.event === 'learner-attempt').length,
  1,
  'exactly one Attempt must reach the Cycle'
);
assert.equal(output.convergenceResult, null);
assert.equal(output.dispatchResult, null);

const after = coordinator.snapshot();
assert.ok(after);
assert.strictEqual(after.session, session, 'S must remain active after first incomplete contract result');
assert.equal(after.profile.attempts, 1);
assert.equal(after.context.currentExperience, 'shopping-for-dinner');
assert.equal(after.context.evidencePackets.length, 1);
assert.equal(
  coordinator.releaseTransition(null, null),
  false,
  'no transition may release S without separate grounded authorization'
);

console.log(
  'Human Lab Choice Cycle result: PASS — one grounded A reaches Coordinator/Controller/real Cycle, records one contract Evidence packet, preserves S/current Experience, and authorizes no NEXT.'
);
