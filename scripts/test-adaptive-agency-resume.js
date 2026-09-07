const assert = require('assert');
const AgencyResume = require('../js/adaptive-agency-resume.js');

const wait = {
  state: 'OPPORTUNITY_FOUND_AWAITING_EVENT',
  cause: 'meaningful-opportunity-found-without-movement-authorization'
};

const currentExperience = 'shopping-for-dinner';

const noAgency = AgencyResume.evaluateAgencyResume(wait, null, { currentExperience });
assert.strictEqual(noAgency.agencyEvaluation.status, 'AGENCY_NOT_OBSERVED');
assert.strictEqual(noAgency.releaseEvaluation.status, 'WAIT_PRESERVED');
assert.strictEqual(noAgency.resumeEligibility.status, 'RESUME_NOT_ELIGIBLE');
assert.strictEqual(noAgency.resumeEligibility.experienceId, currentExperience);

const groundedNoAnchor = AgencyResume.evaluateAgencyResume(wait, {
  observed: true,
  actor: 'learner',
  relevantToWait: true,
  intent: 'continue',
  type: 'learner-choice'
}, {});
assert.strictEqual(groundedNoAnchor.agencyEvaluation.status, 'RESUME_AUTHORIZATION_ELIGIBLE');
assert.strictEqual(groundedNoAnchor.releaseEvaluation.status, 'RELEASE_ELIGIBLE');
assert.strictEqual(groundedNoAnchor.resumeEligibility.status, 'RESUME_NOT_ELIGIBLE');
assert.strictEqual(groundedNoAnchor.resumeEligibility.reason, 'preserved-current-experience-unavailable');

const grounded = AgencyResume.evaluateAgencyResume(wait, {
  observed: true,
  actor: 'learner',
  relevantToWait: true,
  intent: 'continue',
  type: 'learner-choice'
}, { currentExperience });
assert.strictEqual(grounded.agencyEvaluation.status, 'RESUME_AUTHORIZATION_ELIGIBLE');
assert.strictEqual(grounded.releaseEvaluation.status, 'RELEASE_ELIGIBLE');
assert.strictEqual(grounded.resumeEligibility.status, 'RESUME_ELIGIBLE');
assert.strictEqual(grounded.resumeEligibility.experienceId, currentExperience);
assert.strictEqual(grounded.resumeEligibility.scope, 'current-experience');

assert.strictEqual(Object.prototype.hasOwnProperty.call(grounded, 'nextExperience'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(grounded, 'resumeExecuted'), false);

console.log('Adaptive agency resume: PASS — grounded learner agency may make the preserved current Experience resume-eligible without executing RESUME or selecting NEXT.');
