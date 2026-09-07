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
  reason: 'release-event-not-observed'
});

assert.deepEqual(Release.evaluateRelease(wait, {
  observed: true,
  type: 'learner-response',
  authorizesResume: false
}), {
  status: 'WAIT_PRESERVED',
  reason: 'release-event-does-not-authorize-resume'
});

assert.deepEqual(Release.evaluateRelease(wait, {
  observed: true,
  type: 'learner-response',
  authorizesResume: true
}), {
  status: 'RELEASE_ELIGIBLE',
  reason: 'observed-event-authorizes-resume',
  eventType: 'learner-response'
});

assert.deepEqual(Release.evaluateRelease({ state: 'INSPECTION_UNAVAILABLE' }, {
  observed: true,
  type: 'learner-response',
  authorizesResume: true
}), {
  status: 'WAIT_PRESERVED',
  reason: 'release-rule-not-defined-for-wait-state'
});

console.log('Adaptive WAIT release tests passed.');
console.log('Release contract: PASS — observed authorization can make resume eligible without selecting NEXT.');
