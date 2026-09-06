const assert = require('node:assert/strict');
const GreenPass = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

const contract = which.passContract;

const assistedReference = [
  {
    skill: 'which.use.determiner',
    dimension: 'choice-function',
    result: 'pass',
    mode: 'controlled-production',
    support: 'audio',
    context: 'shopping-for-dinner'
  },
  {
    skill: 'which.use.determiner',
    dimension: 'determiner-use',
    result: 'pass',
    mode: 'controlled-production',
    support: 'audio',
    context: 'shopping-for-dinner'
  }
];

let evaluation = GreenPass.evaluateContract(contract, assistedReference);
assert.equal(evaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(evaluation.satisfied, false);
assert.equal(evaluation.missing.length, 2);

const independentDinner = assistedReference.concat({
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'free-production',
  support: 'none',
  context: 'preparing-dinner'
});

evaluation = GreenPass.evaluateContract(contract, independentDinner);
assert.equal(evaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(evaluation.satisfied, false);
assert.equal(evaluation.missing.length, 1);
assert.equal(evaluation.missing[0].mode, 'transfer');

const withTransfer = independentDinner.concat({
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'transfer',
  support: 'none',
  context: 'shopping-clothes'
});

evaluation = GreenPass.evaluateContract(contract, withTransfer);
assert.equal(evaluation.status, 'GREEN_PASS');
assert.equal(evaluation.satisfied, true);
assert.equal(evaluation.missing.length, 0);

const partialClassic = GreenPass.evaluateContract(contract, [{
  skill: 'which.use.determiner',
  dimension: 'choice-function',
  result: 'pass',
  mode: 'free-production',
  support: 'none',
  context: 'books'
}, {
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'partial',
  mode: 'free-production',
  support: 'none',
  context: 'books'
}]);
assert.equal(partialClassic.status, 'WAITING_FOR_EVIDENCE');

assert.throws(
  () => GreenPass.evaluateContract({ requires: [] }, []),
  /at least one requirement/
);

console.log('Green Pass contract evaluator tests passed.');
