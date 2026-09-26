#!/usr/bin/env node

const assert = require('node:assert/strict');
const Source = require('../js/adaptive-determiner-use-probe-specification-source.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
assert.ok(shopping);

const specification = Source.resolve(which, shopping, 'en');
assert.ok(specification, 'grounded WHICH determiner-use probe specification is required');
assert.equal(specification.skill, 'which.use.determiner');
assert.equal(specification.experienceId, 'shopping-for-dinner');
assert.equal(specification.dimension, 'determiner-use');
assert.equal(
  Object.prototype.hasOwnProperty.call(specification, 'mode'),
  false,
  'local determiner-use evidence must not fabricate transfer mode'
);
assert.equal(specification.targetForm, 'which');
assert.equal(specification.targetNoun, 'cheese');
assert.equal(specification.question, 'Which cheese should we choose?');
assert.equal(specification.prompt, 'Which ___ should we choose?');
assert.equal(specification.expectedAlternativeId, 'cheese');
assert.deepEqual(
  specification.alternatives.map(item => item.id),
  ['cheese', 'should', 'we', 'choose']
);
assert.ok(Object.isFrozen(specification));
assert.ok(Object.isFrozen(specification.alternatives));

assert.equal(Source.resolve(null, shopping, 'en'), null);
assert.equal(Source.resolve(which, null, 'en'), null);
assert.equal(Source.resolve(which, shopping, 'es'), null, 'first probe is explicitly target-language English');
assert.equal(
  Source.resolve({ ...which, grammarRole: 'interrogative-pronoun' }, shopping, 'en'),
  null,
  'probe must fail closed when canonical grammar role does not match determiner use'
);

const withoutWhich = {
  ...shopping,
  thinkingMind: shopping.thinkingMind.filter(item => item.questionWord !== 'which')
};
assert.equal(Source.resolve(which, withoutWhich, 'en'), null);

console.log(
  'Adaptive determiner-use probe specification source: PASS — canonical WHICH + focus noun yields one local fail-closed probe without fabricating transfer Evidence.'
);
