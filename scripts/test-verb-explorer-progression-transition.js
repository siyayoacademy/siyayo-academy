#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ProgressionDecision = require('../js/adaptive-progression-decision.js');
const SessionTransitionBoundary = require('../js/adaptive-session-transition-boundary.js');

const session = {
  decision: {
    action: 'continue-assessment',
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  },
  trace: [{ event: 'experience-selected' }]
};

const convergence = Object.freeze({
  status: 'CANDIDATE_SUPPORTED_FOR_CONSIDERATION',
  reason: 'grounded-candidate-and-observed-pedagogical-support-converge',
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
  support: Object.freeze({
    contractSatisfied: true,
    pedagogicalAction: 'continue-assessment'
  }),
  openConditions: Object.freeze({
    contractEvidencePending: false,
    waitActive: false,
    resumeActive: false
  })
});

const learnerEvent = Object.freeze({
  observed: true,
  actor: 'learner',
  relevantToProgression: true,
  intent: 'advance',
  type: 'learner-progression',
  source: 'toroidal-next-select',
  occurrenceId: 'toroidal-next-select:1',
  fromExperienceId: 'shopping-for-dinner',
  toExperienceId: 'preparing-dinner'
});

const progression = ProgressionDecision.resolve({ convergence, learnerEvent });
assert.ok(progression);
assert.equal(progression.status, 'PROGRESSION_DECISION_READY');

const sandbox = vm.createContext({
  Object,
  AdaptiveSessionTransitionBoundary: SessionTransitionBoundary
});
sandbox.globalThis = sandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-adaptive-coordinator.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-adaptive-coordinator.js' }
);

const coordinator = sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
assert.equal(
  typeof coordinator.releaseProgression,
  'function',
  'Coordinator must expose a progression-decision release bridge'
);

assert.equal(coordinator.configure({
  profile: { id: 'learner-transition' },
  session,
  context: { currentExperience: 'shopping-for-dinner' }
}), true);

assert.equal(
  coordinator.releaseProgression(null),
  false,
  'missing progression decision must preserve S1'
);
assert.equal(coordinator.snapshot().session, session);

assert.equal(
  coordinator.releaseProgression({
    ...progression,
    status: 'CONVERGENCE_UNRESOLVED'
  }),
  false,
  'only PROGRESSION_DECISION_READY may reach SessionTransitionBoundary'
);
assert.equal(coordinator.snapshot().session, session);

const authorization = coordinator.releaseProgression(progression);
assert.ok(authorization);
assert.equal(authorization.status, 'transition-authorized');
assert.equal(authorization.fromExperience, 'shopping-for-dinner');
assert.equal(authorization.toExperience, 'preparing-dinner');
assert.strictEqual(authorization.advanceSelection, progression.advanceSelection);
assert.strictEqual(authorization.nextDecision, progression.nextDecision);

assert.equal(
  coordinator.snapshot(),
  null,
  'successful transition authorization must release Coordinator ownership of S1'
);
assert.equal(
  session.decision.experienceId,
  'shopping-for-dinner',
  'releasing S1 must not rewrite the immutable S1 Decision'
);

assert.equal(
  coordinator.releaseProgression(progression),
  false,
  'released Coordinator must not authorize the same progression twice'
);

console.log(
  'Verb Explorer progression transition: PASS — a ready learner-grounded Progression Decision is delegated to the existing SessionTransitionBoundary exactly once; S1 is released without being rewritten.'
);
