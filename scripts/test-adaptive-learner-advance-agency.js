const assert = require('assert');
const AdvanceAgency = require('../js/adaptive-learner-advance-agency.js');

const offered = { status: 'ADVANCE_OFFERED', experienceId: 'shopping-for-dinner' };

assert.equal(
  AdvanceAgency.evaluateAdvanceAgency(null, null).status,
  AdvanceAgency.statuses.ADVANCE_NOT_OFFERED
);
assert.equal(
  AdvanceAgency.evaluateAdvanceAgency(offered, null).status,
  AdvanceAgency.statuses.ADVANCE_AGENCY_NOT_OBSERVED
);
assert.equal(
  AdvanceAgency.evaluateAdvanceAgency(offered, {
    observed: true, actor: 'system', relevantToAdvance: true, intent: 'next'
  }).status,
  AdvanceAgency.statuses.ADVANCE_AGENCY_AMBIGUOUS
);
assert.equal(
  AdvanceAgency.evaluateAdvanceAgency(offered, {
    observed: true, actor: 'learner', relevantToAdvance: false, intent: 'next'
  }).status,
  AdvanceAgency.statuses.ADVANCE_AGENCY_AMBIGUOUS
);
for (const intent of ['continue', 'resume', 'retry', 'answer']) {
  assert.equal(
    AdvanceAgency.evaluateAdvanceAgency(offered, {
      observed: true, actor: 'learner', relevantToAdvance: true, intent
    }).status,
    AdvanceAgency.statuses.ADVANCE_AGENCY_AMBIGUOUS,
    `${intent} must not become NEXT`
  );
}

const result = AdvanceAgency.evaluateAdvanceAgency(offered, {
  observed: true,
  actor: 'learner',
  relevantToAdvance: true,
  intent: 'next',
  type: 'next-select'
});
assert.equal(result.status, AdvanceAgency.statuses.ADVANCE_AUTHORIZATION_ELIGIBLE);
assert.equal(result.intent, 'next');
assert.equal(result.eventType, 'next-select');

console.log('PASS learner advance agency requires an offered opportunity plus explicit observed learner NEXT; resume/continue/retry/answer cannot authorize advance.');
