#!/usr/bin/env node

const assert = require('node:assert/strict');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');
const experienceCorpus = require('../data/learning/experience-seeds.json');

function createSession(id) {
  const evidenceProfile = AdaptiveEvidenceProfile.createProfile(id);
  AdaptiveEvidenceProfile.record(evidenceProfile, {
    source: 'cycle-resume-elo-seed', status: 'transfer-confirmed', requiresReview: false, conflict: false, requiresReinforcement: true
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

const resumeState = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceTense: 'present',
  experienceForm: 'interrogative',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceChoiceCandidate: 'choose',
  experienceWordType: 'verb',
  experienceNounId: 'cheese',
  experienceAdjectiveId: null,
  lineOffset: 6
};

function runFinal(learnerEvent) {
  const session = createSession('cycle-resume-elo');
  let profile = GreenPassProfile.createProfile('cycle-resume-elo');
  let context = { passContract: which.passContract, evidencePackets: [], experiences: experienceCorpus.items };
  let result;
  attempts.forEach((attempt, index) => {
    const final = index === attempts.length - 1;
    const callContext = final ? { ...context, learnerEvent, resumeState } : context;
    result = AdaptiveLearningCycle.submit(profile, session, attempt, callContext);
    profile = result.greenProfile;
    context = result.nextContext;
  });
  return { result, session };
}

{
  const { result, session } = runFinal({ observed: true, actor: 'learner', relevantToWait: true, intent: 'continue', type: 'learner-response' });
  assert.equal(result.waitClassification.state, 'OPPORTUNITY_FOUND_AWAITING_EVENT');
  assert.equal(result.resumeEvaluation.agencyEvaluation.status, 'RESUME_AUTHORIZATION_ELIGIBLE');
  assert.equal(result.resumeEvaluation.releaseEvaluation.status, 'RELEASE_ELIGIBLE');
  assert.equal(result.resumeEvaluation.resumeEligibility.status, 'RESUME_ELIGIBLE');
  assert.equal(result.resumeEvaluation.resumeEligibility.experienceId, 'shopping-for-dinner');
  assert.equal(result.resumeEvaluation.resumeContext.status, 'RESUME_CONTEXT_ELIGIBLE');
  assert.equal(result.resumeEvaluation.resumeContext.snapshot.experienceChoiceCandidate, 'choose');
  assert.equal(result.resumeEvaluation.resumeContext.snapshot.experiencePerspective, 'debating');
  assert.equal(result.resumeEvaluation.resumeContext.snapshot.lineOffset, 6);
  assert.equal(result.advanceSelection, null);
  assert.equal(result.nextContext.currentExperience, 'shopping-for-dinner');
  assert.equal(Object.prototype.hasOwnProperty.call(result, 'resumeExecuted'), false);
  assert.equal(session.trace.filter(entry => entry.event === 'adaptive-next-selected').length, 0);
  const traces = session.trace.filter(entry => entry.event === 'adaptive-resume-evaluated');
  assert.equal(traces.length, 1);
  assert.equal(traces[0].agencyStatus, 'RESUME_AUTHORIZATION_ELIGIBLE');
  assert.equal(traces[0].releaseStatus, 'RELEASE_ELIGIBLE');
  assert.equal(traces[0].resumeStatus, 'RESUME_ELIGIBLE');
  assert.equal(traces[0].resumeContextStatus, 'RESUME_CONTEXT_ELIGIBLE');
}

{
  const { result, session } = runFinal({ observed: true, actor: 'system', relevantToWait: true, intent: 'continue', type: 'system-event' });
  assert.equal(result.resumeEvaluation.agencyEvaluation.status, 'AGENCY_AMBIGUOUS');
  assert.equal(result.resumeEvaluation.releaseEvaluation.status, 'WAIT_PRESERVED');
  assert.notEqual(result.resumeEvaluation.resumeEligibility.status, 'RESUME_ELIGIBLE');
  assert.equal(result.resumeEvaluation.resumeContext.status, 'RESUME_CONTEXT_PRESERVED');
  assert.equal(result.advanceSelection, null);
  assert.equal(session.trace.filter(entry => entry.event === 'adaptive-next-selected').length, 0);
}

{
  const session = createSession('cycle-resume-no-event');
  let profile = GreenPassProfile.createProfile('cycle-resume-no-event');
  let context = { passContract: which.passContract, evidencePackets: [], experiences: experienceCorpus.items };
  let result;
  attempts.forEach(attempt => {
    result = AdaptiveLearningCycle.submit(profile, session, attempt, context);
    profile = result.greenProfile;
    context = result.nextContext;
  });
  assert.equal(result.waitClassification.state, 'OPPORTUNITY_FOUND_AWAITING_EVENT');
  assert.equal(result.resumeEvaluation, null);
  assert.equal(session.trace.filter(entry => entry.event === 'adaptive-resume-evaluated').length, 0);
  assert.equal(session.trace.filter(entry => entry.event === 'adaptive-next-selected').length, 0);
}

console.log('Adaptive Cycle resume elo: PASS — grounded learner agency reaches resume-context eligibility without executing resume, restart, or NEXT.');
