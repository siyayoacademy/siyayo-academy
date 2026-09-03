const assert = require('node:assert/strict');
const Interference = require('../js/multilingual-interference.js');

const portuguese = Interference.inspect('esquisito', 'pt');
assert.equal(portuguese.status, 'canonical');
assert.equal(portuguese.relation, 'false-friend');

const spanish = Interference.inspect('exquisito', 'es');
assert.equal(spanish.status, 'canonical');
assert.equal(spanish.meanings.es, 'excellent, refined or delicious');

const english = Interference.inspect('weird', 'en');
assert.equal(english.status, 'canonical');
assert.equal(english.matchedLanguage, 'en');
assert.equal(english.meanings.en, 'strange or odd');

const transfer = Interference.inspect('exquisito', 'pt');
assert.equal(transfer.status, 'cross-language-transfer');
assert.equal(transfer.matchedLanguage, 'es');

const englishTransfer = Interference.inspect('weird', 'pt');
assert.equal(englishTransfer.status, 'cross-language-transfer');
assert.equal(englishTransfer.matchedLanguage, 'en');

const hybrid = Interference.inspect('esquesito', 'pt');
assert.equal(hybrid.status, 'possible-hybrid-interference');
assert.equal(hybrid.confidence, 'review-required');
assert.ok(hybrid.distances.pt <= 2);
assert.ok(hybrid.distances.es <= 2);

const unrelated = Interference.inspect('banana', 'pt');
assert.equal(unrelated.status, 'no-known-interference');

assert.equal(Interference.levenshtein('esquisito', 'exquisito'), 1);

console.log('Multilingual interference trilingual tests passed.');
