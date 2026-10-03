#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const bootstrapSource = fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js', 'utf8');

const sandbox = vm.createContext({ Object, Array });
sandbox.globalThis = sandbox;

for (const file of [
  'js/adaptive-evidence-profile.js',
  'js/adaptive-evidence-view.js',
  'js/adaptive-learning-router.js',
  'js/adaptive-pedagogical-orchestrator.js',
  'js/adaptive-attempt-loop.js',
  'js/verb-explorer-adaptive-evidence-profile-source.js',
  'js/verb-explorer-adaptive-session-source.js',
  'js/adaptive-contract-closure-evidence-source.js',
  'js/verb-explorer-next-session-source.js'
]) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const evidenceProfileSource = sandbox.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
const evidenceProfile = evidenceProfileSource.begin('learner-live-evidence-continuity');
assert.ok(evidenceProfile);
assert.equal(evidenceProfile.observations.length, 0);

const s1 = sandbox.SIYAYOVerbExplorerAdaptiveSessionSource.begin(
  evidenceProfile,
  {
    currentExperience: 'shopping-for-dinner',
    skill: 'which.use.determiner',
    language: 'en',
    chapter: 'question-words'
  }
);
assert.ok(s1);
assert.equal(s1.decision.experienceId, 'shopping-for-dinner');
assert.equal(s1.decision.skill, 'which.use.determiner');

const passContract = Object.freeze({
  requires: Object.freeze([
    Object.freeze({ dimension: 'choice-function', result: 'pass' }),
    Object.freeze({ dimension: 'determiner-use', result: 'pass', support: 'none' }),
    Object.freeze({ dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none' })
  ])
});

const sourceContext = Object.freeze({
  skill: 'which.use.determiner',
  currentExperience: 'shopping-for-dinner',
  language: 'en',
  chapter: 'question-words',
  passContract,
  evidencePackets: Object.freeze([])
});

const cycleResult = Object.freeze({
  contractEligible: true,
  contractEvaluation: Object.freeze({
    status: 'GREEN_PASS',
    satisfied: true,
    requirements: Object.freeze([]),
    missing: Object.freeze([])
  }),
  recommendation: Object.freeze({
    action: 'continue-assessment',
    reason: 'green-pass-eligible-awaiting-route'
  }),
  routeInspection: Object.freeze({
    action: 'continue-assessment',
    focus: 'eligible-opportunity',
    reason: 'green-pass-eligible-opportunity-found'
  }),
  greenProfile: Object.freeze({ id: 'learner-live-evidence-continuity' }),
  nextContext: sourceContext
});

const state = Object.freeze({
  currentExperienceId: 'shopping-for-dinner'
});

sandbox.SIYAYOVerbExplorerLearnerEvent = Object.freeze({
  fromChoiceSelect(choice) {
    return Object.freeze({
      observed: true,
      actor: 'learner',
      source: 'choice-select',
      occurrenceId: 'choice-select:live-evidence-continuity',
      choice,
      experienceId: 'shopping-for-dinner'
    });
  }
});

sandbox.SIYAYOVerbExplorerAdaptiveController = Object.freeze({
  submitChoice() { return cycleResult; }
});

sandbox.AdaptiveAdvanceSelector = Object.freeze({
  resolveCandidate() {
    return Object.freeze({
      experienceId: 'preparing-dinner',
      fromExperience: 'shopping-for-dinner',
      entryVerb: 'cook'
    });
  }
});

sandbox.AdaptiveProgressionEligibility = Object.freeze({
  evaluateCandidateGrounding(input) {
    return Object.freeze({
      status: 'CANDIDATE_GROUNDED',
      experienceId: input.session.decision.experienceId,
      skill: input.session.decision.skill,
      candidate: input.candidate
    });
  }
});

sandbox.AdaptivePedagogicalCompletion = Object.freeze({
  evaluatePedagogicalState() {
    return Object.freeze({
      status: 'PEDAGOGICAL_SUPPORT_OBSERVED',
      openConditions: Object.freeze({
        contractEvidencePending: false,
        waitActive: false,
        resumeActive: false
      })
    });
  }
});

sandbox.AdaptiveConvergenceResolver = Object.freeze({
  resolve(input) {
    return Object.freeze({
      status: 'CANDIDATE_SUPPORTED_FOR_CONSIDERATION',
      experienceId: 'shopping-for-dinner',
      skill: 'which.use.determiner',
      candidate: input.candidateGrounding.candidate,
      openConditions: input.pedagogicalState.openConditions
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
  profile: { id: 'learner-live-evidence-continuity' },
  session: s1,
  context: sourceContext,
  getState() { return state; },
  getAttempt() {
    return Object.freeze({
      skill: 'which.use.determiner',
      dimension: 'determiner-use',
      result: 'pass',
      mode: 'transfer',
      support: 'none'
    });
  },
  getResumeState(receivedState) { return receivedState; }
}), true);

const choiceResult = coordinator.submitChoice('carrots');
assert.ok(choiceResult, 'GREEN_PASS Choice result must remain accepted');
assert.equal(
  evidenceProfile.observations.length,
  1,
  'live GREEN_PASS closure must be retained in the canonical longitudinal Evidence Profile before NEXT'
);

const closure = evidenceProfile.observations[0];
assert.equal(closure.source, 'green-pass-contract');
assert.equal(closure.status, 'transfer-confirmed');
assert.equal(closure.context.skill, 'which.use.determiner');
assert.equal(closure.context.experienceId, 'shopping-for-dinner');
assert.equal(closure.context.contractStatus, 'GREEN_PASS');
assert.equal(closure.context.confirmed, true);
assert.strictEqual(
  evidenceProfileSource.getProfile(),
  evidenceProfile,
  'canonical Evidence Profile source must retain the exact longitudinal profile object'
);

const authorization = Object.freeze({
  status: 'transition-authorized',
  fromExperience: 'shopping-for-dinner',
  toExperience: 'preparing-dinner',
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

const s2 = sandbox.SIYAYOVerbExplorerNextSessionSource.begin({
  transitionAuthorization: authorization,
  previousSession: s1,
  language: 'en',
  chapter: 'question-words'
});

assert.ok(s2, 'S2 must be born from the same retained longitudinal Evidence Profile');
assert.equal(s2.decision.experienceId, 'preparing-dinner');
assert.equal(s2.decision.skill, 'which.use.determiner');
assert.equal(s2.decision.priorEvidence.length, 1);
assert.equal(s2.decision.priorEvidence[0].source, 'green-pass-contract');
assert.equal(s2.decision.priorEvidence[0].status, 'transfer-confirmed');
assert.equal(s2.decision.priorEvidence[0].context.skill, 'which.use.determiner');
assert.equal(s2.decision.priorEvidence[0].context.confirmed, true);

assert.ok(
  bootstrapSource.includes('AdaptiveContractClosureEvidenceSource'),
  'browser bootstrap must load the longitudinal contract-closure authority before live progression'
);

console.log(
  'Verb Explorer live Evidence Profile continuity: PASS — GREEN_PASS closure is recorded once in the canonical longitudinal Evidence Profile before NEXT, and S2 snapshots that exact grounded history as priorEvidence.'
);
