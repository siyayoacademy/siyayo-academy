const assert = require('node:assert/strict');
const Interference = require('../js/multilingual-interference.js');
const Bridge = require('../js/xespirito-interference-bridge.js');

const hybrid = Bridge.toEvidence(Interference.inspect('esquesito', 'pt'));
assert.equal(hybrid.status, 'review-required');
assert.equal(hybrid.evidenceType, 'interference-hypothesis');
assert.equal(hybrid.conflict, false);
assert.equal(hybrid.requiresReinforcement, false);

const transfer = Bridge.toEvidence(Interference.inspect('exquisito', 'pt'));
assert.equal(transfer.status, 'observed-transfer');
assert.equal(transfer.evidenceType, 'cross-language-transfer');
assert.equal(transfer.conflict, false);
assert.equal(transfer.requiresReinforcement, false);
assert.equal(transfer.matchedLanguage, 'es');

const english = Bridge.toEvidence(Interference.inspect('weird', 'en'));
assert.equal(english.status, 'clear-evidence');
assert.equal(english.conflict, false);

const unknown = Bridge.toEvidence(Interference.inspect('banana', 'pt'));
assert.equal(unknown.status, 'no-diagnostic-evidence');
assert.equal(unknown.conflict, false);

const summary = Bridge.interpret([
  Interference.inspect('esquesito', 'pt'),
  Interference.inspect('exquisito', 'pt'),
  Interference.inspect('weird', 'en')
]);
assert.equal(summary.reviewRequired, true);
assert.equal(summary.observedTransfer, true);
assert.equal(summary.hasConflict, false);
assert.equal(summary.requiresReinforcement, false);
assert.equal(summary.evidence.length, 3);

console.log('Xespirito multilingual interference bridge tests passed.');
