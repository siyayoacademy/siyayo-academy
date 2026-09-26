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

assert.strictEqual(evaluate({ waitState: { state: 'INSPECTION_UNAVAILABLE' } }).openConditions.waitActive, true);
assert.strictEqual(evaluate({ waitState: { state: 'OPPORTUNITY_FOUND_AWAITING_EVENT' } }).openConditions.waitActive, true);
assert.strictEqual(evaluate({ waitState: { state: 'UNKNOWN' } }).openConditions.waitActive, false);

const resumeNotEligible = evaluate({
  resumeState: { status: 'RESUME_NOT_ELIGIBLE', reason: 'wait-not-release-eligible' }
});
assert.strictEqual(resumeNotEligible.openConditions.resumeActive, false);

const resumeEligible = evaluate({
  resumeState: { status: 'RESUME_ELIGIBLE', experienceId: 'shopping-for-dinner' }
});
assert.strictEqual(resumeEligible.openConditions.resumeActive, true);

const agencyResumeNotEligible = evaluate({
  resumeState: {
    agencyEvaluation: { status: 'AGENCY_NOT_OBSERVED' },
    releaseEvaluation: { status: 'RELEASE_NOT_ELIGIBLE' },
    resumeEligibility: { status: 'RESUME_NOT_ELIGIBLE', experienceId: 'shopping-for-dinner' }
  }
});
assert.strictEqual(agencyResumeNotEligible.openConditions.resumeActive, false);

const agencyResumeEligible = evaluate({
  resumeState: {
    agencyEvaluation: { status: 'AGENCY_OBSERVED' },
    releaseEvaluation: { status: 'RELEASE_ELIGIBLE' },
    resumeEligibility: { status: 'RESUME_ELIGIBLE', experienceId: 'shopping-for-dinner', scope: 'current-experience' }
  }
});
assert.strictEqual(agencyResumeEligible.openConditions.resumeActive, true);

const green = evaluate();
assert.strictEqual(green.status, PedagogicalState.statuses.PEDAGOGICAL_STATE_OBSERVED);
assert.strictEqual(green.experienceId, 'shopping-for-dinner');
assert.strictEqual(green.skill, 'which.use.determiner');
assert.strictEqual(green.support.contractSatisfied, true);
assert.strictEqual(green.support.pedagogicalAction, 'continue-assessment');
assert.strictEqual(green.openConditions.contractEvidencePending, false);
assert.strictEqual(green.openConditions.waitActive, false);
assert.strictEqual(green.openConditions.resumeActive, false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(green, 'complete'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(green, 'action'), false);

assert.strictEqual(evaluate({
  pedagogicalDisposition: { action: 'continue-assessment', experienceId: 'preparing-dinner', skill: 'which.use.determiner' }
}).status, PedagogicalState.statuses.PEDAGOGICAL_STATE_UNGROUNDED);

assert.strictEqual(evaluate({
  pedagogicalDisposition: { action: 'continue-assessment', experienceId: 'shopping-for-dinner', skill: 'verb-function' }
}).status, PedagogicalState.statuses.PEDAGOGICAL_STATE_UNGROUNDED);

console.log('PASS adaptive pedagogical state interprets exact WAIT/Resume semantics without inventing completion or progression.');
