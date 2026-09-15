const assert = require('assert');
const CandidateGrounding = require('../js/adaptive-progression-eligibility.js');

const session = {
  decision: {
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  }
};

function evaluate(candidate) {
  return CandidateGrounding.evaluateCandidateGrounding({ session, candidate });
}

assert.strictEqual(CandidateGrounding.evaluateCandidateGrounding({}).status, 'CANDIDATE_UNGROUNDED');
assert.strictEqual(evaluate(null).status, 'CANDIDATE_UNGROUNDED');
assert.strictEqual(evaluate({
  status: 'selected',
  experienceId: 'preparing-dinner',
  fromExperience: 'shopping-for-dinner'
}).status, 'CANDIDATE_UNGROUNDED', 'legacy advance selection must not masquerade as read-only candidate grounding');
assert.strictEqual(evaluate({
  status: 'candidate-resolved',
  experienceId: 'preparing-dinner',
  fromExperience: 'having-dinner'
}).status, 'CANDIDATE_UNGROUNDED', 'candidate from another Experience cannot be grounded in active S1');
assert.strictEqual(evaluate({
  status: 'candidate-resolved',
  experienceId: 'shopping-for-dinner',
  fromExperience: 'shopping-for-dinner'
}).status, 'CANDIDATE_UNGROUNDED', 'candidate destination must differ from active Experience');

const grounded = evaluate({
  status: 'candidate-resolved',
  experienceId: 'preparing-dinner',
  fromExperience: 'shopping-for-dinner',
  entryVerb: 'cook',
  title: { en: 'Preparing Dinner' }
});
assert.strictEqual(grounded.status, 'CANDIDATE_GROUNDED');
assert.strictEqual(grounded.experienceId, 'shopping-for-dinner');
assert.strictEqual(grounded.skill, 'which.use.determiner');
assert.strictEqual(grounded.candidate.experienceId, 'preparing-dinner');
assert.strictEqual(grounded.candidate.fromExperience, 'shopping-for-dinner');
assert.strictEqual(grounded.candidate.entryVerb, 'cook');
assert.strictEqual(Object.prototype.hasOwnProperty.call(grounded, 'action'), false, 'grounding must not authorize advance');
assert.strictEqual(Object.prototype.hasOwnProperty.call(grounded, 'nextDecision'), false, 'grounding must not fabricate Decision2');

console.log('PASS adaptive candidate grounding is fail-closed: a resolved toroidal candidate may be grounded in S1 without completion, NEXT, progression, Decision2, or Session release.');
