const assert = require('assert');
const Verifier = require('../js/interference-contrast-verifier');

const repeated = { occurrences: 2 };

let result = Verifier.verify({ occurrences: 1 }, {
  expectedLanguage: 'pt', selectedLanguage: 'es', meaningCorrect: true, formCorrect: true
});
assert.strictEqual(result.status, 'insufficient-pattern-evidence');
assert.strictEqual(result.requiresReinforcement, false);

result = Verifier.verify(repeated, {
  expectedLanguage: 'pt', selectedLanguage: 'pt', meaningCorrect: true, formCorrect: true
});
assert.strictEqual(result.status, 'contrast-cleared');
assert.strictEqual(result.reinforcementConfirmed, false);

result = Verifier.verify(repeated, {
  expectedLanguage: 'pt', selectedLanguage: 'es', meaningCorrect: true, formCorrect: true
});
assert.strictEqual(result.status, 'transfer-confirmed');
assert.strictEqual(result.probeCompleted, true);
assert.strictEqual(result.requiresReinforcement, true);
assert.strictEqual(result.conflict, false);

result = Verifier.verify(repeated, {
  expectedLanguage: 'pt', selectedLanguage: 'pt', meaningCorrect: false, formCorrect: false
});
assert.strictEqual(result.status, 'contrast-unresolved');
assert.strictEqual(result.requiresReinforcement, false);

result = Verifier.verify(repeated, {});
assert.strictEqual(result.status, 'probe-incomplete');
assert.strictEqual(result.requiresReinforcement, false);

console.log('Multilingual contrast verification probe: PASS');
