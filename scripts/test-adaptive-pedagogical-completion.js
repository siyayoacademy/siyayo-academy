const assert = require('assert');
const Completion = require('../js/adaptive-pedagogical-completion.js');

const session = {
  decision: {
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  }
};

const green = { status: 'GREEN_PASS', satisfied: true };
const complete = {
  action: 'complete',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner'
};

function evaluate(overrides = {}) {
  return Completion.evaluatePedagogicalCompletion({
    session,
    contractResult: green,
    pedagogicalDisposition: complete,
    waitState: null,
    resumeState: null,
    ...overrides
  });
}

assert.strictEqual(
  evaluate({ contractResult: { status: 'WAITING_FOR_EVIDENCE', satisfied: false } }).status,
  Completion.statuses.PEDAGOGICAL_WORK_PENDING,
  'contract evidence must be satisfied before completion'
);

assert.strictEqual(
  evaluate({ waitState: { state: 'OPPORTUNITY_FOUND_AWAITING_EVENT' } }).status,
  Completion.statuses.PEDAGOGICAL_WORK_PENDING,
  'active WAIT must preserve pedagogical work'
);

assert.strictEqual(
  evaluate({ resumeState: { status: 'RESUME_ELIGIBLE' } }).status,
  Completion.statuses.PEDAGOGICAL_WORK_PENDING,
  'pending Resume must preserve pedagogical work'
);

for (const action of ['reinforce', 'review-pattern', 'continue-assessment', 'observe', 'advance']) {
  assert.strictEqual(
    evaluate({ pedagogicalDisposition: { ...complete, action } }).status,
    Completion.statuses.PEDAGOGICAL_WORK_PENDING,
    `${action} must not be promoted to pedagogical completion`
  );
}

assert.strictEqual(
  evaluate({ pedagogicalDisposition: { ...complete, experienceId: 'preparing-dinner' } }).status,
  Completion.statuses.PEDAGOGICAL_WORK_PENDING,
  'completion from another Experience must fail closed'
);

assert.strictEqual(
  evaluate({ pedagogicalDisposition: { ...complete, skill: 'verb-function' } }).status,
  Completion.statuses.PEDAGOGICAL_WORK_PENDING,
  'completion from another skill must fail closed'
);

const result = evaluate();
assert.strictEqual(result.status, Completion.statuses.PEDAGOGICAL_WORK_COMPLETE);
assert.strictEqual(result.experienceId, 'shopping-for-dinner');
assert.strictEqual(result.skill, 'which.use.determiner');

console.log('adaptive-pedagogical-completion: PASS');
