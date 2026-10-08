#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

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

const sandbox = vm.createContext({
  console,
  Object,
  Number,
  String,
  document: documentRef
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

const learnerEvent = sandbox.SIYAYOVerbExplorerLearnerEvent.fromChoiceSelect(
  'fresh-mild-cheese',
  {
    currentExperienceId: 'shopping-for-dinner',
    experienceQuestion: 'Which cheese should we choose?',
    experiencePerspective: null,
    experienceWordType: 'verb'
  }
);
assert.ok(learnerEvent);
assert.equal(
  sandbox.SIYAYOVerbExplorerResumeRuntime.observeChoice(learnerEvent),
  true
);

const state = Object.freeze(
  sandbox.SIYAYOVerbExplorerResumeRuntime.captureContext()
);

load('js/choice-evidence-evaluator.js');
load('js/verb-explorer-choice-resolution-reader.js');
load('js/verb-explorer-choice-evidence-bridge.js');

const evidence = sandbox.SIYAYOVerbExplorerChoiceEvidenceBridge.read(
  state,
  documentRef
);
assert.ok(evidence);
assert.equal(evidence.dimension, 'choice-function');
assert.equal(evidence.result, 'pass');

load('js/choice-support-sensor.js');
load('labs/human-semantic-surface/lab-choice-support-runtime.js');

assert.ok(sandbox.SIYAYOChoiceSupportSensor);
assert.equal(
  typeof sandbox.SIYAYOChoiceSupportSensor.support,
  'function',
  'Human Lab must hold a runtime SupportSensor instance, not the factory API'
);
assert.equal(
  sandbox.SIYAYOChoiceSupportSensor.support(state),
  'none',
  'no observed support must remain the explicit none support state'
);

load('js/choice-attempt-ownership.js');
load('js/choice-attempt-boundary.js');
load('js/verb-explorer-choice-attempt-factory.js');
load('js/verb-explorer-choice-attempt-provider.js');

const attempt = sandbox.SIYAYOVerbExplorerChoiceAttemptProvider.getAttempt(
  'fresh-mild-cheese',
  state,
  null,
  learnerEvent,
  documentRef
);

assert.ok(attempt, 'grounded Human Lab Choice must produce one Attempt A');
assert.equal(attempt.occurrenceId, learnerEvent.occurrenceId);
assert.equal(attempt.dimension, 'choice-function');
assert.equal(attempt.result, 'pass');
assert.equal(attempt.support, 'none');
assert.equal(attempt.context.currentExperienceId, 'shopping-for-dinner');
assert.equal(attempt.context.experienceLanguage, 'en');
assert.equal(attempt.context.experienceQuestion, 'Which cheese should we choose?');
assert.equal(attempt.context.experienceChoiceCandidate, 'fresh-mild-cheese');
assert.ok(Object.isFrozen(attempt));
assert.ok(Object.isFrozen(attempt.context));

assert.equal(
  sandbox.AdaptiveLearningCycle,
  undefined,
  'Attempt proof must not load or submit the adaptive Cycle'
);
assert.equal(
  sandbox.SIYAYOVerbExplorerAdaptiveController,
  undefined,
  'Attempt proof must stop before Controller submission'
);

console.log(
  'Human Lab Choice Attempt: PASS — LearnerEvent + E/L/Q/C + rendered Evidence + explicit support=none produce one immutable A, with Controller/Cycle still absent.'
);
