#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({ Object, Array });
sandbox.globalThis = sandbox;

for (const file of [
  'js/adaptive-evidence-profile.js',
  'js/adaptive-evidence-view.js',
  'js/adaptive-learning-router.js',
  'js/adaptive-pedagogical-orchestrator.js',
  'js/adaptive-attempt-loop.js',
  'js/verb-explorer-adaptive-evidence-profile-source.js',
  'js/verb-explorer-adaptive-session-source.js'
]) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const Profile = sandbox.AdaptiveEvidenceProfile;
const profileSource = sandbox.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
const sessionSource = sandbox.SIYAYOVerbExplorerAdaptiveSessionSource;

const profile = profileSource.begin('learner-s2');
assert.ok(profile);

Profile.record(profile, {
  source: 'green-pass-contract',
  status: 'transfer-confirmed',
  repeated: [],
  requiresReview: false,
  conflict: false,
  requiresReinforcement: false
}, {
  skill: 'which.use.determiner',
  language: 'en',
  chapter: 'question-words',
  confirmed: true,
  experienceId: 'shopping-for-dinner',
  contractStatus: 'GREEN_PASS'
});

const s1 = Object.freeze({
  decision: Object.freeze({
    action: 'continue-assessment',
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  }),
  trace: Object.freeze([
    Object.freeze({
      archetype: 'patita',
      event: 'experience-selected',
      experienceId: 'shopping-for-dinner',
      skill: 'which.use.determiner'
    })
  ])
});

const authorization = Object.freeze({
  status: 'transition-authorized',
  fromExperience: 'shopping-for-dinner',
  toExperience: 'preparing-dinner',
  advanceSelection: Object.freeze({
    action: 'advance',
    status: 'selected',
    fromExperience: 'shopping-for-dinner',
    experienceId: 'preparing-dinner',
    entryVerb: 'cook'
  }),
  nextDecision: Object.freeze({
    action: 'advance',
    experienceId: 'preparing-dinner',
    skill: 'which.use.determiner',
    focus: 'assessment'
  })
});

sandbox.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource = profileSource;
sandbox.SIYAYOVerbExplorerAdaptiveSessionSource = sessionSource;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-next-session-source.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-next-session-source.js' }
);

const Next = sandbox.SIYAYOVerbExplorerNextSessionSource;
assert.ok(Next);
assert.equal(typeof Next.begin, 'function');

const s2 = Next.begin({
  transitionAuthorization: authorization,
  previousSession: s1,
  language: 'en',
  chapter: 'question-words'
});

assert.ok(s2);
assert.notStrictEqual(s2, s1, 'S2 must be a new Session object');
assert.equal(s2.decision.action, 'continue-assessment');
assert.equal(s2.decision.experienceId, 'preparing-dinner');
assert.equal(s2.decision.skill, 'which.use.determiner');
assert.equal(s2.decision.focus, 'assessment');

assert.ok(Array.isArray(s2.decision.priorEvidence));
assert.equal(s2.decision.priorEvidence.length, 1);
assert.equal(s2.decision.priorEvidence[0].source, 'green-pass-contract');
assert.equal(s2.decision.priorEvidence[0].status, 'transfer-confirmed');
assert.equal(s2.decision.priorEvidence[0].context.skill, 'which.use.determiner');
assert.equal(s2.decision.priorEvidence[0].context.confirmed, true);
assert.ok(Object.isFrozen(s2.decision.priorEvidence));

assert.equal(s2.trace.length, 1);
assert.equal(s2.trace[0].event, 'experience-selected');
assert.equal(s2.trace[0].experienceId, 'preparing-dinner');
assert.equal(s2.trace[0].skill, 'which.use.determiner');

assert.equal(s1.decision.experienceId, 'shopping-for-dinner');
assert.equal(s1.trace.length, 1, 'S1 must remain unchanged after S2 birth');

assert.equal(
  Next.begin({
    transitionAuthorization: { ...authorization, status: 'candidate-supported' },
    previousSession: s1
  }),
  null,
  'only transition-authorized may birth S2'
);

assert.equal(
  Next.begin({
    transitionAuthorization: {
      ...authorization,
      fromExperience: 'having-dinner'
    },
    previousSession: s1
  }),
  null,
  'authorization source must match S1'
);

assert.equal(
  Next.begin({
    transitionAuthorization: {
      ...authorization,
      nextDecision: {
        ...authorization.nextDecision,
        experienceId: 'having-dinner'
      }
    },
    previousSession: s1
  }),
  null,
  'authorized destination and nextDecision must agree'
);

profileSource.clear();
assert.equal(
  Next.begin({
    transitionAuthorization: authorization,
    previousSession: s1
  }),
  null,
  'missing longitudinal Evidence Profile must preserve WAIT'
);

console.log(
  'Verb Explorer next Session source: PASS — transition-authorized births a new S2 through the canonical Session source, preserves S1, and snapshots longitudinal Green Pass closure into Decision2 priorEvidence.'
);
