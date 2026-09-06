const assert = require('node:assert/strict');
const GreenPass = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

const contract = which.passContract;

const assistedReference = [
  { skill: 'which.use.determiner', dimension: 'choice-function', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' },
  { skill: 'which.use.determiner', dimension: 'determiner-use', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'shopping-for-dinner' }
];

let evaluation = GreenPass.evaluateContract(contract, assistedReference);
assert.equal(evaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(evaluation.satisfied, false);
assert.equal(evaluation.missing.length, 2);

const independentDinner = assistedReference.concat({ skill: 'which.use.determiner', dimension: 'determiner-use', result: 'pass', mode: 'free-production', support: 'none', context: 'preparing-dinner' });
evaluation = GreenPass.evaluateContract(contract, independentDinner);
assert.equal(evaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(evaluation.satisfied, false);
assert.equal(evaluation.missing.length, 1);
assert.equal(evaluation.missing[0].mode, 'transfer');

const withTransfer = independentDinner.concat({ skill: 'which.use.determiner', dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none', context: 'shopping-clothes' });
evaluation = GreenPass.evaluateContract(contract, withTransfer);
assert.equal(evaluation.status, 'GREEN_PASS');
assert.equal(evaluation.satisfied, true);
assert.equal(evaluation.missing.length, 0);

const partialClassic = GreenPass.evaluateContract(contract, [
  { skill: 'which.use.determiner', dimension: 'choice-function', result: 'pass', mode: 'free-production', support: 'none', context: 'books' },
  { skill: 'which.use.determiner', dimension: 'determiner-use', result: 'partial', mode: 'free-production', support: 'none', context: 'books' }
]);
assert.equal(partialClassic.status, 'WAITING_FOR_EVIDENCE');

// Genericity probe: same evaluator, different skill and dimensions; no HOW MUCH-specific engine code.
const howMuchContract = {
  requires: [
    { dimension: 'quantity-function', result: 'pass' },
    { dimension: 'uncountable-use', result: 'pass', support: 'none' },
    { dimension: 'uncountable-use', result: 'pass', mode: 'transfer', support: 'none' }
  ]
};
const howMuchEvidence = [
  { skill: 'how-much.use.uncountable', dimension: 'quantity-function', result: 'pass', mode: 'controlled-production', support: 'audio', context: 'preparing-dinner' },
  { skill: 'how-much.use.uncountable', dimension: 'uncountable-use', result: 'pass', mode: 'free-production', support: 'none', context: 'preparing-dinner' }
];
evaluation = GreenPass.evaluateContract(howMuchContract, howMuchEvidence);
assert.equal(evaluation.status, 'WAITING_FOR_EVIDENCE');
assert.equal(evaluation.missing.length, 1);
assert.equal(evaluation.missing[0].mode, 'transfer');

howMuchEvidence.push({ skill: 'how-much.use.uncountable', dimension: 'uncountable-use', result: 'pass', mode: 'transfer', support: 'none', context: 'shopping-drinks' });
evaluation = GreenPass.evaluateContract(howMuchContract, howMuchEvidence);
assert.equal(evaluation.status, 'GREEN_PASS');
assert.equal(evaluation.satisfied, true);

assert.throws(() => GreenPass.evaluateContract({ requires: [] }, []), /at least one requirement/);

console.log('Green Pass contract evaluator tests passed.');
console.log('Genericity probe passed: WHICH and synthetic HOW MUCH use the same evaluator.');
