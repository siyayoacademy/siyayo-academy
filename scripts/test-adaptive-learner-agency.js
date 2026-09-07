const assert = require('assert');
const Agency = require('../js/adaptive-learner-agency.js');

const wait = {
  state: 'OPPORTUNITY_FOUND_AWAITING_EVENT',
  cause: 'meaningful-opportunity-found-without-movement-authorization'
};

assert.strictEqual(Agency.evaluateAgency(null, null), null);

assert.deepStrictEqual(
  Agency.evaluateAgency(wait, null),
  {
    status: 'AGENCY_NOT_OBSERVED',
    reason: 'learner-event-not-observed'
  }
);

assert.deepStrictEqual(
  Agency.evaluateAgency(wait, {
    observed: true,
    actor: 'system',
    relevantToWait: true,
    intent: 'continue',
    type: 'button-click'
  }),
  {
    status: 'AGENCY_AMBIGUOUS',
    reason: 'event-provenance-is-not-learner'
  }
);

assert.deepStrictEqual(
  Agency.evaluateAgency(wait, {
    observed: true,
    actor: 'learner',
    relevantToWait: false,
    intent: 'continue',
    type: 'learner-response'
  }),
  {
    status: 'AGENCY_AMBIGUOUS',
    reason: 'learner-event-not-grounded-in-current-wait'
  }
);

assert.deepStrictEqual(
  Agency.evaluateAgency(wait, {
    observed: true,
    actor: 'learner',
    relevantToWait: true,
    intent: 'help',
    type: 'learner-request'
  }),
  {
    status: 'AGENCY_AMBIGUOUS',
    reason: 'resume-intention-not-supported'
  }
);

assert.deepStrictEqual(
  Agency.evaluateAgency(wait, {
    observed: true,
    actor: 'learner',
    relevantToWait: true,
    intent: 'continue',
    type: 'learner-response'
  }),
  {
    status: 'RESUME_AUTHORIZATION_ELIGIBLE',
    reason: 'learner-agency-supports-resume-authorization',
    intent: 'continue',
    eventType: 'learner-response'
  }
);

assert.deepStrictEqual(
  Agency.evaluateAgency({ state: 'INSPECTION_UNAVAILABLE' }, {
    observed: true,
    actor: 'learner',
    relevantToWait: true,
    intent: 'continue',
    type: 'learner-response'
  }),
  {
    status: 'AGENCY_AMBIGUOUS',
    reason: 'agency-rule-not-defined-for-wait-state'
  }
);

console.log('Adaptive learner agency: PASS — learner provenance, WAIT relevance, and supported intention are required before resume authorization becomes eligible.');
console.log('Agency eligibility does not execute RESUME and does not select NEXT.');
