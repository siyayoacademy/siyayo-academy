#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const AdaptiveSessionTransitionBoundary = require('../js/adaptive-session-transition-boundary.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const AdaptiveResumeExecutor = require('../js/adaptive-resume-executor.js');
const AdaptiveResumeRuntimeDispatch = require('../js/adaptive-resume-runtime-dispatch.js');
const which = require('../data/learning/skills/which.json');
const experienceCorpus = require('../data/learning/experience-seeds.json');

function createSession(id) {
  const evidenceProfile = AdaptiveEvidenceProfile.createProfile(id);
  AdaptiveEvidenceProfile.record(evidenceProfile, {
    source: 'verb-explorer-adaptive-coordinator', status: 'transfer-confirmed', requiresReview: false, conflict: false, requiresReinforcement: true
  }, { confirmed: true, language: 'en', chapter: 'question-words', skill: 'which.use.determiner' });
  const session = AdaptiveAttemptLoop.begin(AdaptiveEvidenceProfile, evidenceProfile, {});
  session.decision.skill = 'which.use.determiner';
  session.decision.experienceId = 'shopping-for-dinner';
  return session;
}

const common = { language: 'en', chapter: 'question-words', skill: 'which.use.determiner', correct: true, confidence: 0.95 };
const attempts = [
  { ...common, dimension: 'choice-function', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' },
  { ...common, dimension: 'determiner-use', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' },
  { ...common, dimension: 'determiner-use', result: 'pass', mode: 'free-production', support: 'none', context: 'preparing-dinner' },
  { ...common, dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none', context: 'shopping-clothes' }
];

const state = {
  currentExperienceId: 'shopping-for-dinner', experienceLanguage: 'en', experienceTense: 'present',
  experienceForm: 'interrogative', experienceQuestion: 3, experiencePerspective: 'debating',
  experienceChoiceCandidate: 'choose', experienceWordType: 'verb', experienceNounId: 'cheese',
  experienceAdjectiveId: null, lineOffset: 6
};

const session = createSession('verb-explorer-adaptive-coordinator');
let profile = GreenPassProfile.createProfile('verb-explorer-adaptive-coordinator');
let context = { passContract: which.passContract, evidencePackets: [], experiences: experienceCorpus.items };
for (const attempt of attempts.slice(0, -1)) {
  const result = AdaptiveLearningCycle.submit(profile, session, attempt, context);
  profile = result.greenProfile;
  context = result.nextContext;
}

let restored = null;
let restoreCalls = 0;
let dispatchCalls = 0;
const runtime = Object.freeze({
  execute(resumeContext) {
    return AdaptiveResumeExecutor.executeResume(resumeContext, {
      restoreContext(snapshot) {
        restoreCalls += 1;
        restored = { ...snapshot };
        return true;
      }
    });
  }
});
const dispatch = Object.freeze({
  run(result) {
    dispatchCalls += 1;
    return AdaptiveResumeRuntimeDispatch.dispatch(result, runtime);
  }
});

const sandbox = vm.createContext({
  Object,
  AdaptiveLearningCycle,
  AdaptiveSessionTransitionBoundary,
  SIYAYOVerbExplorerCycleResumeDispatch: dispatch
});
sandbox.globalThis = sandbox;
for (const file of [
  'js/verb-explorer-learner-event.js',
  'js/verb-explorer-adaptive-controller.js',
  'js/verb-explorer-adaptive-coordinator.js'
]) vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });

const coordinator = sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
assert.equal(coordinator.configure({
  profile, session, context,
  getState: () => state,
  getAttempt: () => attempts[attempts.length - 1],
  getResumeState: currentState => currentState
}), true);

const before = coordinator.snapshot();
const output = coordinator.submitChoice('choose', null);
assert.ok(output);
assert.equal(output.cycleResult.waitClassification.state, 'OPPORTUNITY_FOUND_AWAITING_EVENT');
assert.equal(output.cycleResult.resumeEvaluation.resumeContext.status, 'RESUME_CONTEXT_ELIGIBLE');
assert.equal(output.cycleResult.advanceSelection, null);
assert.equal(output.cycleResult.nextContext.currentExperience, 'shopping-for-dinner');
assert.equal(Object.prototype.hasOwnProperty.call(output.cycleResult, 'resumeExecuted'), false);
assert.equal(session.trace.filter(entry => entry.event === 'adaptive-next-selected').length, 0);
assert.equal(dispatchCalls, 1);
assert.equal(output.dispatchResult.status, 'RESUME_DISPATCHED');
assert.equal(output.dispatchResult.execution.status, 'RESUME_EXECUTED');
assert.equal(restoreCalls, 1);
assert.equal(restored.currentExperienceId, 'shopping-for-dinner');
assert.equal(restored.experienceChoiceCandidate, 'choose');
assert.equal(restored.experiencePerspective, 'debating');
assert.equal(restored.lineOffset, 6);

const after = coordinator.snapshot();
assert.equal(after.session, session);
assert.notEqual(after.profile, before.profile);
assert.equal(after.profile, output.cycleResult.greenProfile);
assert.equal(after.context, output.cycleResult.nextContext);

assert.equal(coordinator.releaseTransition(null), false);
assert.equal(coordinator.snapshot().session, session, 'missing next Decision must preserve S1');
assert.equal(coordinator.releaseTransition({ experienceId: 'shopping-for-dinner', skill: 'which.use.determiner' }), false);
assert.equal(coordinator.snapshot().session, session, 'same Experience must preserve S1');

const nextDecision = {
  action: 'continue-assessment',
  experienceId: 'preparing-dinner',
  skill: 'which.use.determiner',
  focus: 'assessment'
};
const authorization = coordinator.releaseTransition(nextDecision);
assert.ok(authorization);
assert.equal(authorization.status, 'transition-authorized');
assert.equal(authorization.fromExperience, 'shopping-for-dinner');
assert.equal(authorization.toExperience, 'preparing-dinner');
assert.equal(authorization.nextDecision, nextDecision);
assert.equal(coordinator.snapshot(), null, 'authorized explicit transition releases S1');
assert.equal(session.decision.experienceId, 'shopping-for-dinner', 'release must not mutate S1 Decision');
assert.equal(coordinator.submitChoice('choose', null), null);
assert.equal(dispatchCalls, 1, 'released coordinator must not dispatch');

console.log('Verb Explorer adaptive coordinator: PASS — submitChoice preserves S1 through Green/Resume; only explicit grounded transition authority releases S1; no NEXT/S2 is invented.');
