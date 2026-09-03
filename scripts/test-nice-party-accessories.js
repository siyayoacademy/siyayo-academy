const assert = require('node:assert/strict');
const accessories = require('../data/learning/nice-party-accessories.json');
const corpus = require('../data/learning/experience-seeds.json');

const nicePartyStages = new Set((corpus.items || []).filter(item => item.tags?.includes('nice-party')).map(item => item.id));
const ids = new Set();

assert.equal(accessories.experienceTag, 'nice-party');
assert.ok(accessories.categories.length >= 6);

for (const category of accessories.categories) {
  assert.ok(nicePartyStages.has(category.stage), `${category.id} must attach to a canonical Nice Party stage`);
  assert.ok(category.items.length > 0, `${category.id} must contain vocabulary`);
  for (const item of category.items) {
    assert.equal(ids.has(item.id), false, `duplicate accessory id: ${item.id}`);
    ids.add(item.id);
    for (const language of ['en', 'es', 'pt']) {
      assert.ok(String(item[language] || '').trim(), `${item.id} requires ${language}`);
    }
  }
}

for (const required of ['table-setting', 'decoration', 'music', 'clothing-accessories', 'invitation-and-gifts', 'drinks']) {
  assert.ok(accessories.categories.some(category => category.id === required), `missing Nice Party category: ${required}`);
}

console.log('Nice Party accessory vocabulary tests passed.');
