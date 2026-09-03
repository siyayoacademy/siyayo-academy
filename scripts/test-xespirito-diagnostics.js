const fs = require('fs');
const path = require('path');
const { diagnose } = require('../js/xespirito-diagnostics.js');

const grid = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'data', 'grammar', 'verb-grid.json'), 'utf8')
);

const cases = [
  ['Where do you can go?', 'modal-blocks-do-support', 'modal-core', 'Where can you go?'],
  ['Do you are ready?', 'be-blocks-do-support', 'auxiliary-be', 'Are you ready?'],
  ['She can goes.', 'modal-requires-base-form', 'modal-core', 'She can go.'],
  ['She has study.', 'perfect-requires-past-participle', 'auxiliary-have', 'She has studied.'],
  ['She is study.', 'progressive-requires-ing', 'auxiliary-be', 'She is studying.'],
  ['She has be studying.', 'perfect-progressive-requires-been', 'auxiliary-have', 'She has been studying.'],
  ['She has might been studying.', 'auxiliary-chain-order', 'auxiliary-chain', 'She might have been studying.'],
  ['Yesterday she is studying.', 'finite-carrier-controls-time', 'finite-carrier', 'Yesterday she was studying.'],
  ['She will has studied.', 'future-carrier-requires-base-next', 'auxiliary-have', 'She will have studied.']
];

for (const [input, ruleId, responsiblePiece, correction] of cases) {
  const result = diagnose(input, grid);
  if (!result.matched) throw new Error(`Expected diagnostic match for: ${input}`);
  if (result.ruleId !== ruleId) throw new Error(`${input}: expected rule ${ruleId}, got ${result.ruleId}`);
  if (result.responsiblePiece !== responsiblePiece) {
    throw new Error(`${input}: expected responsible piece ${responsiblePiece}, got ${result.responsiblePiece}`);
  }
  if (result.correction !== correction) {
    throw new Error(`${input}: expected correction ${correction}, got ${result.correction}`);
  }
  if (!result.reason) throw new Error(`${input}: diagnostic reason must not be empty.`);
}

const unknown = diagnose('She studies every day.', grid);
if (unknown.matched || unknown.status !== 'no-canonical-diagnostic') {
  throw new Error('Unknown/correct sentence must not invent a diagnostic.');
}

const empty = diagnose('   ', grid);
if (empty.matched || empty.status !== 'empty-input') {
  throw new Error('Empty input must be handled safely.');
}

console.log(`Xespirito diagnostics passed: ${cases.length} canonical conflicts + safe fallback behavior.`);
