const assert = require('node:assert/strict');
const accessories = require('../data/learning/nice-party-accessories.json');
const corpus = require('../data/learning/experience-seeds.json');

const nicePartyStages = new Set((corpus.items || []).filter(item => item.tags?.includes('nice-party')).map(item => item.id));
const ids = new Set();

assert.equal(accessories.experienceTag, 'nice-party');
assert.ok(accessories.categories.length >= 7);

for (const category of accessories.categories) {
  assert.ok(nicePartyStages.has(category.stage), `${category.id} must attach to a canonical Nice Party stage`);

  if (Array.isArray(category.items)) {
    assert.ok(category.items.length > 0, `${category.id} must contain vocabulary`);
    for (const item of category.items) {
      assert.equal(ids.has(item.id), false, `duplicate accessory id: ${item.id}`);
      ids.add(item.id);
      for (const language of ['en', 'es', 'pt']) {
        assert.ok(String(item[language] || '').trim(), `${item.id} requires ${language}`);
      }
    }
  }

  if (Array.isArray(category.prompts)) {
    assert.ok(category.prompts.length > 0, `${category.id} must contain conversation prompts`);
    for (const prompt of category.prompts) {
      assert.equal(ids.has(prompt.id), false, `duplicate Nice Party id: ${prompt.id}`);
      ids.add(prompt.id);
      assert.ok(prompt.questionWord, `${prompt.id} requires a Question Word`);
      for (const language of ['en', 'es', 'pt']) {
        assert.ok(String(prompt[language] || '').trim(), `${prompt.id} requires ${language} question`);
        assert.ok(String(prompt.answerPattern?.[language] || '').trim(), `${prompt.id} requires ${language} answer pattern`);
      }
    }
  }
}

for (const required of ['table-setting', 'decoration', 'music', 'clothing-accessories', 'invitation-and-gifts', 'drinks', 'social-identity']) {
  assert.ok(accessories.categories.some(category => category.id === required), `missing Nice Party category: ${required}`);
}

const socialIdentity = accessories.categories.find(category => category.id === 'social-identity');
assert.equal(socialIdentity.stage, 'after-dinner-conversation');
assert.equal(socialIdentity.source, 'master-vip-class');
assert.deepEqual(socialIdentity.prompts.map(prompt => prompt.id), ['country', 'nationality', 'profession', 'workplace']);
assert.deepEqual(socialIdentity.prompts.map(prompt => prompt.questionWord), ['where', 'what', 'what', 'where']);

console.log('Nice Party accessory and social identity tests passed.');
