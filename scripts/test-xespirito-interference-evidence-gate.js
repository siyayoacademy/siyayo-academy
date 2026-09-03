const assert = require('node:assert/strict');
const Interference = require('../js/multilingual-interference.js');
const Bridge = require('../js/xespirito-interference-bridge.js');
const Gate = require('../js/xespirito-interference-evidence-gate.js');

const oneHybrid = [Bridge.toEvidence(Interference.inspect('esquesito', 'pt'))];
const first = Gate.evaluate(oneHybrid);
assert.equal(first.status, 'insufficient-evidence');
assert.equal(first.requiresReview, false);
assert.equal(first.conflict, false);
assert.equal(first.requiresReinforcement, false);

const repeatedHybrid = [
  Bridge.toEvidence(Interference.inspect('esquesito', 'pt')),
  Bridge.toEvidence(Interference.inspect('esquesito', 'pt'))
];
const second = Gate.evaluate(repeatedHybrid);
assert.equal(second.status, 'pattern-observed');
assert.equal(second.requiresReview, true);
assert.equal(second.repeated[0].occurrences, 2);
assert.equal(second.conflict, false);
assert.equal(second.requiresReinforcement, false);

const repeatedTransfer = [
  Bridge.toEvidence(Interference.inspect('exquisito', 'pt')),
  Bridge.toEvidence(Interference.inspect('exquisito', 'pt'))
];
const transfer = Gate.evaluate(repeatedTransfer);
assert.equal(transfer.status, 'pattern-observed');
assert.equal(transfer.requiresReview, true);
assert.equal(transfer.conflict, false);
assert.equal(transfer.requiresReinforcement, false);

const mixed = Gate.evaluate([
  Bridge.toEvidence(Interference.inspect('esquesito', 'pt')),
  Bridge.toEvidence(Interference.inspect('exquisito', 'pt')),
  Bridge.toEvidence(Interference.inspect('weird', 'en'))
]);
assert.equal(mixed.status, 'insufficient-evidence');
assert.equal(mixed.requiresReview, false);
assert.equal(mixed.conflict, false);
assert.equal(mixed.requiresReinforcement, false);

console.log('Xespirito conservative interference evidence gate: PASS');
