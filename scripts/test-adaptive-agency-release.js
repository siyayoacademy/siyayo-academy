const assert = require('assert');
const AgencyRelease = require('../js/adaptive-agency-release.js');

const wait = {
  state: 'OPPORTUNITY_FOUND_AWAITING_EVENT',
  cause: 'meaningful-opportunity-found-without-movement-authorization'
};

const ambiguous = AgencyRelease.evaluateAgencyRelease(wait, {
  observed: true,
  actor: 'learner',
  relevantToWait: true,
  intent: 'help',
  type: 'learner-request'
});
assert.strictEqual(ambiguous.agencyEvaluation.status, 'AGENCY_AMBIGUOUS');
assert.strictEqual(ambiguous.releaseEvaluation.status, 'WAIT_PRESERVED');

const externalClaimCannotAuthorize = AgencyRelease.evaluateAgencyRelease(wait, {
  observed: true,
  actor: 'system',
  relevantToWait: true,
  intent: 'continue',
  authorizesResume: true,
  type: 'system-event'
});
assert.strictEqual(externalClaimCannotAuthorize.agencyEvaluation.status, 'AGENCY_AMBIGUOUS');
assert.strictEqual(externalClaimCannotAuthorize.releaseEvaluation.status, 'WAIT_PRESERVED');

const grounded = AgencyRelease.evaluateAgencyRelease(wait, {
  observed: true,
  actor: 'learner',
  relevantToWait: true,
  intent: 'continue',
  type: 'learner-choice'
});
assert.strictEqual(grounded.agencyEvaluation.status, 'RESUME_AUTHORIZATION_ELIGIBLE');
assert.strictEqual(grounded.releaseEvaluation.status, 'RELEASE_ELIGIBLE');
assert.strictEqual(grounded.releaseEvaluation.eventType, 'learner-choice');

console.log('Adaptive agency release: PASS — WAIT release is grounded in evaluated learner agency; caller-provided authorization cannot bypass agency provenance.');
