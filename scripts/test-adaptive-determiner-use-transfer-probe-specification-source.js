#!/usr/bin/env node

const assert = require('node:assert/strict');
const LocalSource = require('../js/adaptive-determiner-use-probe-specification-source.js');
const TransferSource = require('../js/adaptive-determiner-use-transfer-probe-specification-source.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');
const nouns = require('../data/lexicon/nouns/nouns.json');

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const preparing = experiences.items.find(item => item.id === 'preparing-dinner');
assert.ok(shopping);
assert.ok(preparing);

const local = LocalSource.resolve(which, shopping, 'en');
assert.ok(local);

const transfer = TransferSource.resolve(which, local, preparing, nouns, 'en');
assert.ok(transfer, 'preparing-dinner must expose one grounded WHICH determiner transfer probe');

assert.deepEqual(transfer, {
  skill: 'which.use.determiner',
  fromExperienceId: 'shopping-for-dinner',
  experienceId: 'preparing-dinner',
  dimension: 'determiner-use',
  mode: 'transfer',
  targetForm: 'which',
  targetNoun: 'carrots',
  question: 'Which carrots should we cook first?',
  prompt: 'Which ___ should we cook first?',
  expectedAlternativeId: 'carrots',
  alternatives: [
    { id: 'carrots', label: 'carrots' },
    { id: 'should', label: 'should' },
    { id: 'we', label: 'we' },
    { id: 'cook', label: 'cook' }
  ]
});
assert.ok(Object.isFrozen(transfer));
assert.ok(Object.isFrozen(transfer.alternatives));
assert.ok(transfer.alternatives.every(Object.isFrozen));

assert.notEqual(
  transfer.experienceId,
  local.experienceId,
  'transfer must move to a distinct Experience'
);
assert.notEqual(
  transfer.targetNoun,
  local.targetNoun,
  'transfer must require a new noun rather than repeat the local cheese item'
);

assert.equal(
  TransferSource.resolve(which, local, shopping, nouns, 'en'),
  null,
  'same-Experience repetition must not be labeled transfer'
);

const withoutWhich = {
  ...preparing,
  thinkingMind: preparing.thinkingMind.filter(item => item.questionWord !== 'which')
};
assert.equal(TransferSource.resolve(which, local, withoutWhich, nouns, 'en'), null);

const ungroundedVocabulary = {
  ...preparing,
  links: {
    ...preparing.links,
    vocabulary: preparing.links.vocabulary.filter(id => id !== 'carrots')
  }
};
assert.equal(
  TransferSource.resolve(which, local, ungroundedVocabulary, nouns, 'en'),
  null,
  'transfer noun must belong to target Experience vocabulary'
);

const missingNounAuthority = {
  ...nouns,
  items: nouns.items.filter(item => item.id !== 'carrots')
};
assert.equal(
  TransferSource.resolve(which, local, preparing, missingNounAuthority, 'en'),
  null,
  'transfer noun must exist in canonical noun lexicon'
);

assert.equal(TransferSource.resolve(which, local, preparing, nouns, 'es'), null);
assert.equal(TransferSource.resolve(which, null, preparing, nouns, 'en'), null);

console.log(
  'Adaptive determiner-use transfer probe specification source: PASS — a distinct Experience plus a new canonical noun authorizes explicit transfer mode without runtime invention.'
);
