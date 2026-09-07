const assert = require('assert');
const AgencyResumeContext = require('../js/adaptive-agency-resume-context.js');

const wait = {
  state: 'OPPORTUNITY_FOUND_AWAITING_EVENT',
  cause: 'meaningful-opportunity-found-without-movement-authorization'
};

const currentExperience = 'shopping-for-dinner';
const state = {
  currentExperienceId: currentExperience,
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

const noAgency = AgencyResumeContext.evaluateAgencyResumeContext(
  wait,
  null,
  { currentExperience },
  state
);
assert.strictEqual(noAgency.agencyEvaluation.status, 'AGENCY_NOT_OBSERVED');
assert.strictEqual(noAgency.releaseEvaluation.status, 'WAIT_PRESERVED');
assert.strictEqual(noAgency.resumeEligibility.status, 'RESUME_NOT_ELIGIBLE');
assert.strictEqual(noAgency.resumeContext.status, 'RESUME_CONTEXT_PRESERVED');
assert.strictEqual(noAgency.resumeContext.snapshot.lineOffset, 6);

const grounded = AgencyResumeContext.evaluateAgencyResumeContext(
  wait,
  {
    observed: true,
    actor: 'learner',
    relevantToWait: true,
    intent: 'continue',
    type: 'learner-choice'
  },
  { currentExperience },
  state
);
assert.strictEqual(grounded.agencyEvaluation.status, 'RESUME_AUTHORIZATION_ELIGIBLE');
assert.strictEqual(grounded.releaseEvaluation.status, 'RELEASE_ELIGIBLE');
assert.strictEqual(grounded.resumeEligibility.status, 'RESUME_ELIGIBLE');
assert.strictEqual(grounded.resumeContext.status, 'RESUME_CONTEXT_ELIGIBLE');
assert.strictEqual(grounded.resumeContext.scope, 'preserved-experience-context');
assert.strictEqual(grounded.resumeContext.snapshot.currentExperienceId, currentExperience);
assert.strictEqual(grounded.resumeContext.snapshot.experienceQuestion, 3);
assert.strictEqual(grounded.resumeContext.snapshot.experiencePerspective, 'debating');
assert.strictEqual(grounded.resumeContext.snapshot.lineOffset, 6);

const mismatch = AgencyResumeContext.evaluateAgencyResumeContext(
  wait,
  {
    observed: true,
    actor: 'learner',
    relevantToWait: true,
    intent: 'continue',
    type: 'learner-choice'
  },
  { currentExperience: 'preparing-dinner' },
  state
);
assert.strictEqual(mismatch.resumeEligibility.status, 'RESUME_ELIGIBLE');
assert.strictEqual(mismatch.resumeContext.status, 'RESUME_CONTEXT_MISMATCH');

assert.strictEqual(Object.prototype.hasOwnProperty.call(grounded, 'resumeExecuted'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(grounded, 'nextExperience'), false);

console.log('Adaptive agency resume context: PASS — grounded agency can identify the preserved contextual DÓ without executing RESUME or selecting NEXT.');
