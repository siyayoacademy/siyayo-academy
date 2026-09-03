const assert = require('node:assert/strict');
const Bridge = require('../js/social-identity-bridge.js');
const accessories = require('../data/learning/nice-party-accessories.json');

const category = accessories.categories.find(item => item.id === 'social-identity');
assert.ok(category, 'social-identity category is required');

const result = Bridge.resolveCategory(category);
assert.equal(result.status, 'mapped');
assert.equal(result.stage, 'after-dinner-conversation');
assert.equal(result.source, 'master-vip-class');
assert.equal(result.mappings.length, 4);
assert.ok(result.mappings.every(mapping => mapping.status === 'mapped'));
assert.ok(result.mappings.every(mapping => mapping.questionWordAligned));

const byId = new Map(result.mappings.map(mapping => [mapping.id, mapping]));
assert.deepEqual(byId.get('country').kindsOfWords, ['noun']);
assert.equal(byId.get('country').distinction, 'origin');
assert.deepEqual(byId.get('nationality').kindsOfWords, ['adjective', 'noun']);
assert.equal(byId.get('nationality').distinction, 'nationality');
assert.ok(byId.get('profession').verbs.includes('work'));
assert.ok(byId.get('workplace').kindsOfWords.includes('preposition'));

const misaligned = Bridge.resolve({ id: 'country', questionWord: 'what' });
assert.equal(misaligned.status, 'mapped');
assert.equal(misaligned.questionWordAligned, false);
assert.equal(misaligned.expectedQuestionWord, 'where');

const unknown = Bridge.resolve({ id: 'favorite-color', questionWord: 'what' });
assert.equal(unknown.status, 'unmapped-social-identity');

console.log('Social identity grammar bridge tests passed.');
