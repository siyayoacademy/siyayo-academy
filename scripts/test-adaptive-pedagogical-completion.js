const assert = require('assert');
const PedagogicalState = require('../js/adaptive-pedagogical-completion.js');

const session = { decision: { experienceId: 'shopping-for-dinner', skill: 'which.use.determiner' } };

function evaluate(overrides = {}) {
  return PedagogicalState.evaluatePedagogicalState({
    session,
    contractResult: { status: 'GREEN_PASS', satisfied: true },
    pedagogicalDisposition: { action: 'continue-assessment', experienceId: 'shopping-for-dinner', skill: 'which.use.determiner' },
    waitState: null,
    resumeState: null,
    ...overrides
  });
}

assert.strictEqual(PedagogicalState.evaluatePedagogicalState({}).status, PedagogicalState.statuses.PEDAGOGICAL_STATE_UNGROUNDED);

const waiting = evaluate({
  contractResult: { status: 'WAITING_FOR_EVIDENCE', satisfied: false },
  waitState: { state: 'INSPECTED_AWAITING_OPPORTUNITY' }
});
assert.strictEqual(waiting.status, PedagogicalState.statuses.PEDAGOGICAL_STATE_OBSERVED);
assert.strictEqual(waiting.support.contractSatisfied, false);
assert.strictEqual(waiting.openConditions.contractEvidencePending, true);
assert.strictEqual(waiting.openConditions.waitActive, true);

const green = evaluate();
assert.strictEqual(green.status, PedagogicalState.statuses.PEDAGOGICAL_STATE_OBSERVED);
assert.strictEqual(green.experienceId, 'shopping-for-dinner');
assert.strictEqual(green.skill, 'which.use.determiner');
assert.strictEqual(green.support.contractSatisfied, true);
assert.strictEqual(green.support.pedagogicalAction, 'continue-assessment');
assert.strictEqual(green.openConditions.contractEvidencePending, false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(green, 'complete'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(green, 'action'), false);

assert.strictEqual(evaluate({
  pedagogicalDisposition: { action: 'continue-assessment', experienceId: 'preparing-dinner', skill: 'which.use.determiner' }
}).status, PedagogicalState.statuses.PEDAGOGICAL_STATE_UNGROUNDED);

assert.strictEqual(evaluate({
  pedagogicalDisposition: { action: 'continue-assessment', experienceId: 'shopping-for-dinner', skill: 'verb-function' }
}).status, PedagogicalState.statuses.PEDAGOGICAL_STATE_UNGROUNDED);

console.log('PASS adaptive pedagogical state preserves observed contract/wait/resume signals without inventing completion or progression.');
