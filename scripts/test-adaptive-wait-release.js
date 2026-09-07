#!/usr/bin/env node

const assert = require('node:assert/strict');
const Release = require('../js/adaptive-wait-release.js');

const wait = {
  state: 'OPPORTUNITY_FOUND_AWAITING_EVENT',
  cause: 'meaningful-opportunity-found-without-movement-authorization'
};

assert.equal(Release.evaluateRelease(null, null), null);

assert.deepEqual(Release.evaluateRelease(wait, null), {
  status: 'WAIT_PRESERVED',
  reason: 'grounded-resume-authorization-not-eligible'
});

// A caller-provided boolean is no longer release authority.
assert.deepEqual(Release.evaluateRelease(wait, {
  observed: true,
  type: 'learner-response',
  authorizesResume: true
}), {
  status: 'WAIT_PRESERVED',
  reason: 'grounded-resume-authorization-not-eligible'
});

assert.deepEqual(Release.evaluateRelease(wait, {
  status: 'AGENCY_AMBIGUOUS',
  eventType: 'learner-response'
}), {
  status: 'WAIT_PRESERVED',
  reason: 'grounded-resume-authorization-not-eligible'
});

assert.deepEqual(Release.evaluateRelease(wait, {
  status: 'RESUME_AUTHORIZATION_ELIGIBLE',
  eventType: 'learner-response'
}), {
  status: 'RELEASE_ELIGIBLE',
  reason: 'grounded-resume-authorization-eligible',
  eventType: 'learner-response'
});

assert.deepEqual(Release.evaluateRelease({ state: 'INSPECTION_UNAVAILABLE' }, {
  status: 'RESUME_AUTHORIZATION_ELIGIBLE',
  eventType: 'learner-response'
}), {
  status: 'WAIT_PRESERVED',
  reason: 'release-rule-not-defined-for-wait-state'
});

console.log('Adaptive WAIT release tests passed.');
console.log('Release authority: PASS — naked authorizesResume booleans cannot release WAIT; grounded resume authorization eligibility is required.');
