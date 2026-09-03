const fs = require('fs');
const path = require('path');
const { diagnose } = require('../js/xespirito-diagnostics.js');

const grid = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'grammar', 'verb-grid.json'), 'utf8'));

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
  if (result.responsiblePiece !== responsiblePiece) throw new Error(`${input}: expected responsible piece ${responsiblePiece}, got ${result.responsiblePiece}`);
  if (result.correction !== correction) throw new Error(`${input}: expected correction ${correction}, got ${result.correction}`);
  if (!result.reason) throw new Error(`${input}: diagnostic reason must not be empty.`);
}

const compositionalCases = [
  ['She will had studied.', 'future-carrier-requires-base-next', 'auxiliary-have', 'She will have studied.'],
  ['She will is studying.', 'future-carrier-requires-base-next', 'auxiliary-be', 'She will be studying.'],
  ['She will did study.', 'future-carrier-requires-base-next', 'auxiliary-do', 'She will do study.'],
  ['She will can do go?', 'single-core-modal', 'modal-core', 'She will be able to go.'],
  ['She has go.', 'perfect-requires-past-participle', 'auxiliary-have', 'She has gone.'],
  ['She has choose.', 'perfect-requires-past-participle', 'auxiliary-have', 'She has chosen.'],
  ['She has work.', 'perfect-requires-past-participle', 'auxiliary-have', 'She has worked.'],
  ['She is go.', 'progressive-requires-ing', 'auxiliary-be', 'She is going.'],
  ['She is choose.', 'progressive-requires-ing', 'auxiliary-be', 'She is choosing.'],
  ['She had be working.', 'perfect-progressive-requires-been', 'auxiliary-have', 'She had been working.'],
  ['She is might studying.', 'auxiliary-chain-order', 'auxiliary-chain', 'She might be studying.']
];

for (const [input, ruleId, responsiblePiece, correction] of compositionalCases) {
  const result = diagnose(input, grid);
  if (!result.matched) throw new Error(`Expected compositional diagnostic match for: ${input}`);
  if (result.matchMode !== 'functional-pattern') throw new Error(`${input}: expected functional-pattern match.`);
  if (result.ruleId !== ruleId) throw new Error(`${input}: expected rule ${ruleId}, got ${result.ruleId}`);
  if (result.responsiblePiece !== responsiblePiece) throw new Error(`${input}: expected responsible piece ${responsiblePiece}, got ${result.responsiblePiece}`);
  if (result.correction !== correction) throw new Error(`${input}: expected correction ${correction}, got ${result.correction}`);
}

const multi = diagnose('She will can do go?', grid);
if (!multi.conflicts.includes('single-core-modal') || !multi.conflicts.includes('modal-blocks-do-support')) {
  throw new Error('Multi-conflict sentence must expose both modal stacking and DO-support conflict signals.');
}

for (const correct of ['She studies every day.', 'She has studied.', 'She is studying.', 'She might have been studying.']) {
  const result = diagnose(correct, grid);
  if (result.matched || result.status !== 'no-canonical-diagnostic') throw new Error(`Correct/unknown sentence must not invent a diagnostic: ${correct}`);
}

const empty = diagnose('   ', grid);
if (empty.matched || empty.status !== 'empty-input') throw new Error('Empty input must be handled safely.');

console.log(`Xespirito diagnostics passed: ${cases.length} canonical conflicts + ${compositionalCases.length} compositional conflicts + safe fallback behavior.`);
