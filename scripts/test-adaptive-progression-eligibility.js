const assert = require('assert');
const Progression = require('../js/adaptive-progression-eligibility.js');

const session = {
  decision: {
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  }
};

function evaluate(pedagogicalResult) {
  return Progression.evaluateProgressionEligibility({ session, pedagogicalResult });
}

assert.strictEqual(Progression.evaluateProgressionEligibility({}).status, 'PROGRESSION_NOT_ELIGIBLE');
assert.strictEqual(evaluate(null).status, 'PROGRESSION_NOT_ELIGIBLE');
assert.strictEqual(evaluate({
  status: 'GREEN_PASS',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner'
}).status, 'PROGRESSION_NOT_ELIGIBLE', 'Green Pass alone must not offer progression');
assert.strictEqual(evaluate({
  status: 'RESUME_EXECUTED',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner'
}).status, 'PROGRESSION_NOT_ELIGIBLE', 'Resume must preserve S1 rather than imply progression');
assert.strictEqual(evaluate({
  status: 'PEDAGOGICAL_WORK_COMPLETE',
  experienceId: 'preparing-dinner',
  skill: 'which.use.determiner'
}).status, 'PROGRESSION_NOT_ELIGIBLE', 'completion from another Experience cannot release active S');
assert.strictEqual(evaluate({
  status: 'PEDAGOGICAL_WORK_COMPLETE',
  experienceId: 'shopping-for-dinner',
  skill: 'another.skill'
}).status, 'PROGRESSION_NOT_ELIGIBLE', 'completion from another skill cannot release active S');

const eligible = evaluate({
  status: 'PEDAGOGICAL_WORK_COMPLETE',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner'
});
assert.strictEqual(eligible.status, 'PROGRESSION_ELIGIBLE');
assert.strictEqual(eligible.experienceId, 'shopping-for-dinner');
assert.strictEqual(eligible.skill, 'which.use.determiner');

console.log('PASS adaptive progression eligibility is fail-closed: Green Pass/Resume do not imply progression; only grounded pedagogical completion can make progression eligible.');
