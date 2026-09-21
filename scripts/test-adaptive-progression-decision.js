#!/usr/bin/env node

const assert = require('node:assert/strict');
const Decision = require('../js/adaptive-progression-decision.js');

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

const result = Decision.resolve({ convergence, learnerEvent });

assert.deepEqual(result, {
  status: 'PROGRESSION_DECISION_READY',
  reason: 'grounded-convergence-and-learner-advance-intent',
  occurrenceId: 'toroidal-next-select:1',
  fromExperienceId: 'shopping-for-dinner',
  toExperienceId: 'preparing-dinner',
  advanceSelection: {
    action: 'advance',
    status: 'selected',
    experienceId: 'preparing-dinner',
    fromExperience: 'shopping-for-dinner',
    entryVerb: 'cook',
    title: {
      en: 'Preparing a Nice Dinner',
      es: 'Preparando una linda cena',
      pt: 'Preparando um belo jantar'
    }
  },
  nextDecision: {
    action: 'advance',
    experienceId: 'preparing-dinner',
    skill: 'which.use.determiner',
    focus: 'assessment'
  }
});

assert.ok(Object.isFrozen(result));
assert.ok(Object.isFrozen(result.advanceSelection));
assert.ok(Object.isFrozen(result.nextDecision));

assert.equal(
  Object.prototype.hasOwnProperty.call(result, 'transition'),
  false,
  'progression decision must not release Session by itself'
);
assert.equal(
  Object.prototype.hasOwnProperty.call(result, 'sessionReleased'),
  false
);

assert.equal(Decision.resolve({}), null);
assert.equal(Decision.resolve({ convergence }), null, 'learner advance intent is required');
assert.equal(
  Decision.resolve({
    convergence,
    learnerEvent: { ...learnerEvent, observed: false }
  }),
  null
);
assert.equal(
  Decision.resolve({
    convergence,
    learnerEvent: { ...learnerEvent, actor: 'system' }
  }),
  null,
  'system event must not impersonate learner progression agency'
);
assert.equal(
  Decision.resolve({
    convergence,
    learnerEvent: { ...learnerEvent, intent: 'continue' }
  }),
  null,
  'resume/continue intent is not NEXT intent'
);
assert.equal(
  Decision.resolve({
    convergence,
    learnerEvent: { ...learnerEvent, relevantToProgression: false }
  }),
  null
);
assert.equal(
  Decision.resolve({
    convergence,
    learnerEvent: { ...learnerEvent, source: 'choice-select' }
  }),
  null
);
assert.equal(
  Decision.resolve({
    convergence,
    learnerEvent: { ...learnerEvent, fromExperienceId: 'preparing-dinner' }
  }),
  null,
  'learner event must originate from convergence source Experience'
);
assert.equal(
  Decision.resolve({
    convergence,
    learnerEvent: { ...learnerEvent, toExperienceId: 'having-dinner' }
  }),
  null,
  'learner-selected target must equal grounded candidate'
);
assert.equal(
  Decision.resolve({
    convergence: { ...convergence, status: 'CONVERGENCE_UNRESOLVED' },
    learnerEvent
  }),
  null,
  'unresolved convergence must never manufacture progression'
);
assert.equal(
  Decision.resolve({
    convergence: {
      ...convergence,
      openConditions: {
        contractEvidencePending: false,
        waitActive: true,
        resumeActive: false
      }
    },
    learnerEvent
  }),
  null,
  'open pedagogical conditions must fail closed'
);

console.log(
  'Adaptive progression decision: PASS — only grounded convergence plus explicit learner NEXT intent produces a ready advance Decision; Session release remains separate.'
);
