#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');
const experienceCorpus = require('../data/learning/experience-seeds.json');

function createSession(id) {
  const evidenceProfile = AdaptiveEvidenceProfile.createProfile(id);
  AdaptiveEvidenceProfile.record(evidenceProfile, {
    source: 'verb-explorer-choice-real-cycle', status: 'transfer-confirmed', requiresReview: false, conflict: false, requiresReinforcement: true
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
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceTense: 'present',
  experienceForm: 'interrogative',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceChoiceCandidate: null,
  experienceWordType: 'verb',
  experienceNounId: 'cheese',
  experienceAdjectiveId: null,
  lineOffset: 6
};

const session = createSession('verb-explorer-choice-real-cycle');
let profile = GreenPassProfile.createProfile('verb-explorer-choice-real-cycle');
let context = { passContract: which.passContract, evidencePackets: [], experiences: experienceCorpus.items };
for (const attempt of attempts.slice(0, -1)) {
  const result = AdaptiveLearningCycle.submit(profile, session, attempt, context);
  profile = result.greenProfile;
  context = result.nextContext;
}

const listeners = { click: [] };
const document = {
  addEventListener(type, handler) { (listeners[type] || (listeners[type] = [])).push(handler); }
};
function dispatchClick(target) { for (const handler of listeners.click) handler({ target }); }

let cycleResult = null;
const realCycleFacade = Object.freeze({
  submit(profileArg, sessionArg, attemptArg, contextArg) {
    cycleResult = AdaptiveLearningCycle.submit(profileArg, sessionArg, attemptArg, contextArg);
    return cycleResult;
  }
});

const sandbox = vm.createContext({ document, Promise, Object, AdaptiveLearningCycle: realCycleFacade });
sandbox.globalThis = sandbox;
for (const file of [
  'js/verb-explorer-learner-event.js',
  'js/verb-explorer-adaptive-controller.js',
  'js/verb-explorer-adaptive-input-provider.js'
]) vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });

// Existing Verb Explorer handler records the learner choice synchronously.
document.addEventListener('click', function(event) {
  const target = event.target && typeof event.target.closest === 'function'
    ? event.target.closest('[data-choice-select]') : null;
  if (target) state.experienceChoiceCandidate = target.dataset.choiceSelect;
});

sandbox.SIYAYOVerbExplorerAdaptiveInputProvider.configure({
  profile,
  session,
  attempt: attempts[attempts.length - 1],
  context,
  getState: () => state,
  getAttempt: () => attempts[attempts.length - 1],
  getContext: () => context,
  getResumeState: currentState => currentState
});

vm.runInContext(fs.readFileSync('js/verb-explorer-choice-adaptive-wire.js', 'utf8'), sandbox, { filename: 'js/verb-explorer-choice-adaptive-wire.js' });

assert.equal(sandbox.SIYAYOVerbExplorerChoiceAdaptiveWire.install(), true);
const choiceTarget = {
  dataset: { choiceSelect: 'choose' },
  closest(selector) { return selector === '[data-choice-select]' ? this : null; }
};
dispatchClick(choiceTarget);
assert.equal(state.experienceChoiceCandidate, 'choose');
assert.equal(cycleResult, null, 'real Cycle must wait until the adaptive microtask');

Promise.resolve().then(function() {
  assert.ok(cycleResult, 'choice-select must reach the real AdaptiveLearningCycle.submit');
  assert.equal(cycleResult.waitClassification.state, 'OPPORTUNITY_FOUND_AWAITING_EVENT');
  assert.equal(cycleResult.resumeEvaluation.agencyEvaluation.status, 'RESUME_AUTHORIZATION_ELIGIBLE');
  assert.equal(cycleResult.resumeEvaluation.releaseEvaluation.status, 'RELEASE_ELIGIBLE');
  assert.equal(cycleResult.resumeEvaluation.resumeEligibility.status, 'RESUME_ELIGIBLE');
  assert.equal(cycleResult.resumeEvaluation.resumeContext.status, 'RESUME_CONTEXT_ELIGIBLE');
  assert.equal(cycleResult.resumeEvaluation.resumeContext.snapshot.experienceChoiceCandidate, 'choose');
  assert.equal(cycleResult.resumeEvaluation.resumeContext.snapshot.experiencePerspective, 'debating');
  assert.equal(cycleResult.resumeEvaluation.resumeContext.snapshot.lineOffset, 6);
  assert.equal(cycleResult.advanceSelection, null);
  assert.equal(cycleResult.nextContext.currentExperience, 'shopping-for-dinner');
  assert.equal(Object.prototype.hasOwnProperty.call(cycleResult, 'resumeExecuted'), false);
  assert.equal(session.trace.filter(entry => entry.event === 'adaptive-next-selected').length, 0);
  assert.equal(session.trace.filter(entry => entry.event === 'adaptive-resume-evaluated').length, 1);
  console.log('Verb Explorer choice real Cycle: PASS — real choice-select boundary reaches real AdaptiveLearningCycle.submit and produces eligible resume context without executing resume, restart, or NEXT.');
}).catch(function(error) {
  console.error(error);
  process.exitCode = 1;
});
