const assert = require('node:assert/strict');
const Interference = require('../js/multilingual-interference.js');
const XespiritoBridge = require('../js/xespirito-interference-bridge.js');

function inspectThroughXespirito(token, language) {
  return XespiritoBridge.toEvidence(Interference.inspect(token, language));
}

const ptCanonical = inspectThroughXespirito('esquisito', 'pt');
assert.equal(ptCanonical.status, 'clear-evidence');
assert.equal(ptCanonical.evidenceType, 'canonical-language-use');
assert.equal(ptCanonical.conflict, false);
assert.equal(ptCanonical.requiresReinforcement, false);

const esCanonical = inspectThroughXespirito('exquisito', 'es');
assert.equal(esCanonical.status, 'clear-evidence');
assert.equal(esCanonical.matchedLanguage, 'es');

const enCanonical = inspectThroughXespirito('weird', 'en');
assert.equal(enCanonical.status, 'clear-evidence');
assert.equal(enCanonical.matchedLanguage, 'en');

const spanishIntoPortuguese = inspectThroughXespirito('exquisito', 'pt');
assert.equal(spanishIntoPortuguese.status, 'observed-transfer');
assert.equal(spanishIntoPortuguese.evidenceType, 'cross-language-transfer');
assert.equal(spanishIntoPortuguese.matchedLanguage, 'es');
assert.equal(spanishIntoPortuguese.conflict, false);
assert.equal(spanishIntoPortuguese.requiresReinforcement, false);

const englishIntoPortuguese = inspectThroughXespirito('weird', 'pt');
assert.equal(englishIntoPortuguese.status, 'observed-transfer');
assert.equal(englishIntoPortuguese.matchedLanguage, 'en');
assert.equal(englishIntoPortuguese.conflict, false);

const hybrid = inspectThroughXespirito('esquesito', 'pt');
assert.equal(hybrid.status, 'review-required');
assert.equal(hybrid.evidenceType, 'interference-hypothesis');
assert.equal(hybrid.conflict, false);
assert.equal(hybrid.requiresReinforcement, false);
assert.ok(hybrid.distances.pt <= 2);
assert.ok(hybrid.distances.es <= 2);

const unknown = inspectThroughXespirito('sistomas', 'pt');
assert.equal(unknown.status, 'no-diagnostic-evidence');
assert.equal(unknown.conflict, false);
assert.equal(unknown.requiresReinforcement, false);

const batch = XespiritoBridge.interpret([
  Interference.inspect('esquisito', 'pt'),
  Interference.inspect('exquisito', 'pt'),
  Interference.inspect('esquesito', 'pt'),
  Interference.inspect('weird', 'en')
]);
assert.equal(batch.reviewRequired, true);
assert.equal(batch.observedTransfer, true);
assert.equal(batch.hasConflict, false);
assert.equal(batch.requiresReinforcement, false);
assert.equal(batch.evidence.length, 4);

console.log('Xespirito PortuSpanGlish evidence flow: PASS');
