const assert = require('assert/strict');
const { interpret } = require('../js/xespirito-evidence-interpreter.js');

const isolated = interpret([
  { status: 'conflict', responsiblePiece: 'auxiliary-have', ruleId: 'future-carrier-requires-base-next' },
  { status: 'clear', responsiblePiece: null }
]);
assert.equal(isolated.evidenceCount, 2);
assert.equal(isolated.conflictEvidenceCount, 1);
assert.equal(isolated.clearEvidenceCount, 1);
assert.equal(isolated.hasReinforcementSignal, false);
assert.deepEqual(isolated.signals, [{ piece: 'auxiliary-have', occurrences: 1, status: 'observed-conflict' }]);

const recurrent = interpret([
  { status: 'conflict', responsiblePiece: 'auxiliary-have', ruleId: 'future-carrier-requires-base-next' },
  { status: 'clear', responsiblePiece: null },
  { status: 'conflict', responsiblePiece: 'auxiliary-have', ruleId: 'perfect-requires-past-participle' }
]);
assert.equal(recurrent.hasReinforcementSignal, true);
assert.deepEqual(recurrent.signals, [{ piece: 'auxiliary-have', occurrences: 2, status: 'requires-reinforcement' }]);

const mixed = interpret([
  { status: 'conflict', responsiblePiece: 'modal-core' },
  { status: 'conflict', responsiblePiece: 'auxiliary-be' },
  { status: 'conflict', responsiblePiece: 'modal-core' }
]);
assert.deepEqual(mixed.signals, [
  { piece: 'modal-core', occurrences: 2, status: 'requires-reinforcement' },
  { piece: 'auxiliary-be', occurrences: 1, status: 'observed-conflict' }
]);

const empty = interpret([]);
assert.equal(empty.evidenceCount, 0);
assert.equal(empty.hasReinforcementSignal, false);
assert.deepEqual(empty.signals, []);

console.log('Xespirito evidence interpreter passed: observation stays separate from reinforcement signals.');
