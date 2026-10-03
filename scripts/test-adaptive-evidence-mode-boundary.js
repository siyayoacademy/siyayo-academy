#!/usr/bin/env node
const assert = require('node:assert/strict');
const Loop = require('../js/adaptive-attempt-loop');
const GreenPass = require('../js/green-pass-profile');

const session = { decision: { skill: 'which.use.determiner', experienceId: 'shopping-for-dinner', language: 'en' } };
const context = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 'Which cheese should we choose?',
  experienceChoiceCandidate: 'fresh-mild-cheese'
});

const choice = Loop.toEvidencePacket(session, {
  dimension: 'choice-function', result: 'pass', support: 'none', context
});
assert.equal(Object.prototype.hasOwnProperty.call(choice, 'mode'), false);

const contract = { requires: [
  { dimension: 'choice-function', result: 'pass' },
  { dimension: 'determiner-use', result: 'pass', support: 'none' },
  { dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none' }
] };

let evaluation = GreenPass.evaluateContract(contract, [choice]);
assert.equal(evaluation.satisfied, false);
assert.equal(evaluation.requirements[0].satisfied, true);
assert.equal(evaluation.requirements[2].satisfied, false);

const determiner = Loop.toEvidencePacket(session, {
  dimension: 'determiner-use', result: 'pass', support: 'none', context
});
evaluation = GreenPass.evaluateContract(contract, [choice, determiner]);
assert.equal(evaluation.satisfied, false);
assert.equal(evaluation.requirements[1].satisfied, true);
assert.equal(evaluation.requirements[2].satisfied, false);

const transfer = Loop.toEvidencePacket(session, {
  dimension: 'determiner-use', result: 'pass', mode: 'transfer', support: 'none', context
});
evaluation = GreenPass.evaluateContract(contract, [choice, determiner, transfer]);
assert.equal(evaluation.satisfied, true);
assert.equal(evaluation.status, 'GREEN_PASS');

assert.throws(() => Loop.toEvidencePacket(session, {
  dimension: 'choice-function', result: 'pass', support: 'none', mode: ' ', context
}), /mode must be a non-empty string/);

console.log('Evidence mode boundary: PASS — absent mode stays unobserved; transfer requires explicit evidence.');
