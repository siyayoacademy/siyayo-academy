#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-dependency-head-probe-definition.js'),
  true,
  'Dependency Head Probe Definition must exist before an exploratory dependency focus can become an assessed learner task'
);

const HeadProbe = require('../js/adaptive-dependency-head-probe-definition.js');
const structure = JSON.parse(
  fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8')
);

const definition = HeadProbe.create(structure,{
  experienceId:'shopping-for-dinner',
  targetTokenId:'three',
  prompt:'Which word is the head of “three”?',
  alternativeTokenIds:['all','these','books']
});

assert.ok(definition);
assert.equal(definition.status,'DEPENDENCY_HEAD_PROBE_READY');
assert.equal(definition.experienceId,'shopping-for-dinner');
assert.equal(definition.structureId,'all-these-three-books');
assert.equal(definition.language,'en');
assert.equal(definition.dimension,'head-identification');
assert.deepEqual(definition.targetToken,{
  id:'three',
  form:'three',
  wordClass:'NUM'
});
assert.equal(definition.prompt,'Which word is the head of “three”?');
assert.equal(definition.expectedHeadTokenId,'books');
assert.equal(definition.relation,'nummod');
assert.deepEqual(definition.alternatives,[
  {id:'all',form:'All',wordClass:'DET'},
  {id:'these',form:'these',wordClass:'DET'},
  {id:'books',form:'books',wordClass:'NOUN'}
]);

assert.equal(Object.isFrozen(definition),true);
assert.equal(Object.isFrozen(definition.targetToken),true);
assert.equal(Object.isFrozen(definition.alternatives),true);
assert.ok(definition.alternatives.every(Object.isFrozen));

for (const forbidden of [
  'learnerEvent',
  'evidence',
  'attempt',
  'score',
  'mastery',
  'greenPass',
  'progression',
  'selectedAlternativeId'
]) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(definition,forbidden),
    false,
    'Definition must not contain '+forbidden
  );
}

assert.equal(
  HeadProbe.create(structure,{
    experienceId:'shopping-for-dinner',
    targetTokenId:'books',
    prompt:'Which word is the head of “books”?',
    alternativeTokenIds:['all','these','three']
  }),
  null,
  'a token without one canonical head must fail closed'
);

assert.equal(
  HeadProbe.create(structure,{
    experienceId:'shopping-for-dinner',
    targetTokenId:'missing',
    prompt:'Which word is the head?',
    alternativeTokenIds:['books','three']
  }),
  null,
  'unknown target token must fail closed'
);

assert.equal(
  HeadProbe.create(structure,{
    experienceId:'shopping-for-dinner',
    targetTokenId:'three',
    prompt:'Which word is the head of “three”?',
    alternativeTokenIds:['all','these']
  }),
  null,
  'the canonical expected head must be present among authorized alternatives'
);

const ambiguous = JSON.parse(JSON.stringify(structure));
ambiguous.relations.push({head:'these',dependent:'three',relation:'dep'});
assert.equal(
  HeadProbe.create(ambiguous,{
    experienceId:'shopping-for-dinner',
    targetTokenId:'three',
    prompt:'Which word is the head of “three”?',
    alternativeTokenIds:['all','these','books']
  }),
  null,
  'multiple canonical heads must fail closed rather than guessing'
);

console.log(
  'Adaptive Dependency Head Probe Definition: PASS — THREE resolves to the single canonical head BOOKS through nummod, alternatives are explicit and frozen, and the definition creates no learner event, evidence, score, mastery, Green Pass, or progression.'
);
