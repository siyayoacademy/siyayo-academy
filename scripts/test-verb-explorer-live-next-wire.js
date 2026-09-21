#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const coordinatorSource = fs.readFileSync('js/verb-explorer-adaptive-coordinator.js', 'utf8');
const learnerEventSource = fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8');
const bootstrapSource = fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js', 'utf8');

const session = {
  decision: {
    action: 'continue-assessment',
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  },
  trace: []
};

const passContract = Object.freeze({
  skill: 'which.use.determiner',
  requiredEvidence: Object.freeze(['determiner-use'])
});

const convergence = Object.freeze({
  status: 'CANDIDATE_SUPPORTED_FOR_CONSIDERATION',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner',
  candidate: Object.freeze({
    experienceId: 'preparing-dinner',
    fromExperience: 'shopping-for-dinner',
    entryVerb: 'cook',
    title: Object.freeze({
      en: 'Preparing a Nice Dinner',
      es: 'Preparando una linda cena',
      pt: 'Preparando um belo jantar'
    })
  }),
  openConditions: Object.freeze({
    contractEvidencePending: false,
    waitActive: false,
    resumeActive: false
  })
});

const cycleResult = Object.freeze({
  contractEvaluation: Object.freeze({ satisfied: true }),
  routeInspection: Object.freeze({ action: 'continue-assessment' }),
  waitClassification: Object.freeze({ active: false }),
  resumeEvaluation: Object.freeze({ active: false }),
  greenProfile: Object.freeze({ id: 'learner-live-next' }),
  nextContext: Object.freeze({
    skill: 'which.use.determiner',
    currentExperience: 'shopping-for-dinner',
    passContract
  })
});

const coordinatorSandbox = vm.createContext({
  Object,
  SIYAYOVerbExplorerLearnerEvent: Object.freeze({
    fromChoiceSelect(choice, state) {
      return Object.freeze({
        observed: true,
        actor: 'learner',
        source: 'choice-select',
        occurrenceId: 'choice-select:live-next-red',
        choice,
        experienceId: state.currentExperienceId
      });
    }
  }),
  SIYAYOVerbExplorerAdaptiveController: Object.freeze({
    submitChoice() { return cycleResult; }
  }),
  AdaptiveAdvanceSelector: Object.freeze({
    resolveCandidate() { return convergence.candidate; }
  }),
  AdaptiveProgressionEligibility: Object.freeze({
    evaluateCandidateGrounding() {
      return Object.freeze({
        status: 'CANDIDATE_GROUNDED',
        experienceId: convergence.experienceId,
        skill: convergence.skill,
        candidate: convergence.candidate
      });
    }
  }),
  AdaptivePedagogicalCompletion: Object.freeze({
    evaluatePedagogicalState() {
      return Object.freeze({
        status: 'PEDAGOGICAL_SUPPORT_OBSERVED',
        experienceId: convergence.experienceId,
        skill: convergence.skill,
        openConditions: convergence.openConditions
      });
    }
  }),
  AdaptiveConvergenceResolver: Object.freeze({
    resolve() { return convergence; }
  })
});
coordinatorSandbox.globalThis = coordinatorSandbox;
vm.runInContext(coordinatorSource, coordinatorSandbox, {
  filename: 'js/verb-explorer-adaptive-coordinator.js'
});

const coordinator = coordinatorSandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
assert.equal(coordinator.configure({
  profile: { id: 'learner-live-next' },
  session,
  context: {
    skill: 'which.use.determiner',
    currentExperience: 'shopping-for-dinner',
    passContract
  },
  getState() {
    return Object.freeze({ currentExperienceId: 'shopping-for-dinner' });
  },
  getAttempt() {
    return Object.freeze({ result: 'pass' });
  },
  getResumeState(state) { return state; }
}), true);

const choiceResult = coordinator.submitChoice('candidate-a');
assert.ok(choiceResult);
assert.strictEqual(choiceResult.convergenceResult, convergence);
assert.strictEqual(
  coordinator.snapshot().lastConvergenceResult,
  convergence,
  'Coordinator snapshot must retain the convergence already produced by the real Choice Cycle'
);

const eventSandbox = vm.createContext({ Object });
eventSandbox.globalThis = eventSandbox;
vm.runInContext(learnerEventSource, eventSandbox, {
  filename: 'js/verb-explorer-learner-event.js'
});

const events = eventSandbox.SIYAYOVerbExplorerLearnerEvent;
assert.equal(
  typeof events.fromToroidalNextSelect,
  'function',
  'LearnerEvent must expose the explicit Toroidal NEXT learner-intent boundary'
);

const nextLearnerEvent = events.fromToroidalNextSelect(
  'preparing-dinner',
  { currentExperienceId: 'shopping-for-dinner' }
);
assert.ok(nextLearnerEvent);
assert.equal(nextLearnerEvent.source, 'toroidal-next-select');
assert.equal(nextLearnerEvent.intent, 'advance');
assert.equal(nextLearnerEvent.relevantToProgression, true);
assert.equal(nextLearnerEvent.fromExperienceId, 'shopping-for-dinner');
assert.equal(nextLearnerEvent.toExperienceId, 'preparing-dinner');
assert.ok(nextLearnerEvent.occurrenceId);

assert.equal(
  fs.existsSync('js/verb-explorer-live-next-wire.js'),
  true,
  'LiveNextWire must exist before NEXT can own the adaptive progression boundary'
);

const nextElement = {
  dataset: { nextExperience: 'preparing-dinner' },
  onclick: function legacyDirectNext() {
    throw new Error('legacy direct NEXT must not execute');
  }
};

let progressionCalls = 0;
let releaseCalls = 0;
let activationCalls = 0;
let learnerEventCalls = 0;
let directNavigationCalls = 0;

const liveSandbox = vm.createContext({
  Object,
  Promise,
  document: {
    getElementById(id) {
      return id === 'nextExperience' ? nextElement : null;
    }
  },
  goToExperience() {
    directNavigationCalls += 1;
    throw new Error('LiveNextWire must never call goToExperience directly');
  },
  SIYAYOVerbExplorerLearnerEvent: Object.freeze({
    fromToroidalNextSelect(toExperienceId, state) {
      learnerEventCalls += 1;
      assert.equal(toExperienceId, 'preparing-dinner');
      assert.equal(state.currentExperienceId, 'shopping-for-dinner');
      return nextLearnerEvent;
    }
  }),
  AdaptiveProgressionDecision: Object.freeze({
    resolve(input) {
      progressionCalls += 1;
      assert.strictEqual(input.convergence, convergence);
      assert.strictEqual(input.learnerEvent, nextLearnerEvent);
      return Object.freeze({
        status: 'PROGRESSION_DECISION_READY',
        advanceSelection: Object.freeze({
          action: 'advance',
          status: 'selected',
          fromExperience: 'shopping-for-dinner',
          experienceId: 'preparing-dinner'
        }),
        nextDecision: Object.freeze({
          action: 'advance',
          experienceId: 'preparing-dinner',
          skill: 'which.use.determiner'
        })
      });
    }
  }),
  SIYAYOVerbExplorerAdaptiveCoordinator: Object.freeze({
    snapshot() {
      return {
        session,
        context: {
          skill: 'which.use.determiner',
          currentExperience: 'shopping-for-dinner',
          passContract
        },
        lastConvergenceResult: convergence
      };
    },
    releaseProgression(progression) {
      releaseCalls += 1;
      assert.equal(progression.status, 'PROGRESSION_DECISION_READY');
      return Object.freeze({
        status: 'transition-authorized',
        fromExperience: 'shopping-for-dinner',
        toExperience: 'preparing-dinner',
        advanceSelection: progression.advanceSelection,
        nextDecision: progression.nextDecision
      });
    }
  }),
  SIYAYOVerbExplorerNextSessionActivation: Object.freeze({
    activate(input) {
      activationCalls += 1;
      assert.equal(input.transitionAuthorization.status, 'transition-authorized');
      assert.strictEqual(input.previousSession, session);
      assert.strictEqual(input.passContract, passContract);
      return Object.freeze({
        status: 'S2_ACTIVE',
        experienceId: 'preparing-dinner'
      });
    }
  })
});
liveSandbox.globalThis = liveSandbox;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-live-next-wire.js', 'utf8'),
  liveSandbox,
  { filename: 'js/verb-explorer-live-next-wire.js' }
);

const wire = liveSandbox.SIYAYOVerbExplorerLiveNextWire;
assert.ok(wire);
assert.equal(typeof wire.install, 'function');
assert.equal(wire.install({ document: liveSandbox.document }), true);
assert.equal(typeof nextElement.onclick, 'function');

nextElement.onclick({ currentTarget: nextElement });

assert.equal(learnerEventCalls, 1, 'one learner NEXT click must create exactly one LearnerEvent');
assert.equal(progressionCalls, 1, 'NEXT must resolve exactly one ProgressionDecision');
assert.equal(releaseCalls, 1, 'NEXT must release S1 exactly once through Coordinator');
assert.equal(activationCalls, 1, 'NEXT must activate S2 exactly once');
assert.equal(directNavigationCalls, 0, 'NEXT must not use the legacy direct navigation shortcut');

const requiredBootstrapAuthorities = [
  'AdaptiveProgressionDecision',
  'AdaptiveSessionTransitionBoundary',
  'SIYAYOVerbExplorerNextSessionSource',
  'SIYAYOVerbExplorerTransitionRuntime',
  'SIYAYOVerbExplorerNextSessionActivation',
  'SIYAYOVerbExplorerLiveNextWire'
];

for (const authority of requiredBootstrapAuthorities) {
  assert.ok(
    bootstrapSource.includes(authority),
    `browser bootstrap must load ${authority}`
  );
}

console.log(
  'Verb Explorer LIVE NEXT wire: PASS — NEXT consumes retained convergence, emits one learner advance event, releases S1, activates S2, and never uses the legacy direct navigation shortcut.'
);
