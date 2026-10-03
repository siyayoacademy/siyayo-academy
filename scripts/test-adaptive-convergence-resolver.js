const assert = require('assert');
const Convergence = require('../js/adaptive-convergence-resolver.js');

const candidateGrounding = Object.freeze({
  status: 'CANDIDATE_GROUNDED',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner',
  candidate: Object.freeze({
    status: 'candidate-resolved',
    experienceId: 'preparing-dinner',
    fromExperience: 'shopping-for-dinner',
    entryVerb: 'cook'
  })
});

function pedagogicalState(overrides = {}) {
  return {
    status: 'PEDAGOGICAL_STATE_OBSERVED',
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner',
    support: { contractSatisfied: true, pedagogicalAction: 'continue-assessment' },
    openConditions: { contractEvidencePending: false, waitActive: false, resumeActive: false },
    ...overrides
  };
}

assert.strictEqual(Convergence.resolve({}).status, Convergence.statuses.CONVERGENCE_UNRESOLVED);
assert.strictEqual(Convergence.resolve({ candidateGrounding }).status, Convergence.statuses.CONVERGENCE_UNRESOLVED);
assert.strictEqual(Convergence.resolve({
  candidateGrounding,
  pedagogicalState: pedagogicalState({ experienceId: 'having-dinner' })
}).status, Convergence.statuses.CONVERGENCE_UNRESOLVED);
assert.strictEqual(Convergence.resolve({
  candidateGrounding,
  pedagogicalState: pedagogicalState({ support: { contractSatisfied: false }, openConditions: { contractEvidencePending: true } })
}).status, Convergence.statuses.CONVERGENCE_UNRESOLVED);
assert.strictEqual(Convergence.resolve({
  candidateGrounding,
  pedagogicalState: pedagogicalState({ openConditions: { contractEvidencePending: false, waitActive: true, resumeActive: false } })
}).status, Convergence.statuses.CONVERGENCE_UNRESOLVED);

const result = Convergence.resolve({ candidateGrounding, pedagogicalState: pedagogicalState() });
assert.strictEqual(result.status, Convergence.statuses.CANDIDATE_SUPPORTED_FOR_CONSIDERATION);
assert.strictEqual(result.experienceId, 'shopping-for-dinner');
assert.strictEqual(result.skill, 'which.use.determiner');
assert.strictEqual(result.candidate.experienceId, 'preparing-dinner');
assert.strictEqual(result.support.contractSatisfied, true);
assert.strictEqual(Object.prototype.hasOwnProperty.call(result, 'action'), false, 'convergence must not authorize advance');
assert.strictEqual(Object.prototype.hasOwnProperty.call(result, 'nextDecision'), false, 'convergence must not fabricate Decision2');
assert.strictEqual(Object.prototype.hasOwnProperty.call(result, 'transition'), false, 'convergence must not authorize Session transition');

console.log('PASS adaptive convergence resolves support for considering a grounded candidate without NEXT, advance, Decision2, or Session transition.');
