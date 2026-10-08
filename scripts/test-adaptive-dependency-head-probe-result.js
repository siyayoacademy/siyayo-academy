#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-dependency-head-probe-result.js'),
  true,
  'Dependency Head Probe Result must exist before an observed head selection can be evaluated'
);

const HeadProbe = require('../js/adaptive-dependency-head-probe-definition.js');
const Result = require('../js/adaptive-dependency-head-probe-result.js');

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

function event(choice,overrides={}){
  return {
    observed:true,
    actor:'learner',
    relevantToWait:true,
    intent:'continue',
    type:'learner-response',
    source:'dependency-head-probe-select',
    occurrenceId:'dependency-head-probe-select:1',
    choice,
    experienceId:'shopping-for-dinner',
    structureId:'all-these-three-books',
    language:'en',
    dimension:'head-identification',
    targetTokenId:'three',
    ...overrides
  };
}

const correct = Result.evaluate(definition,event('books'));
assert.deepEqual(correct,{
  occurrenceId:'dependency-head-probe-select:1',
  experienceId:'shopping-for-dinner',
  structureId:'all-these-three-books',
  language:'en',
  dimension:'head-identification',
  targetTokenId:'three',
  selectedAlternativeId:'books',
  result:'pass'
});
assert.ok(Object.isFrozen(correct));

const wrong = Result.evaluate(
  definition,
  event('these',{occurrenceId:'dependency-head-probe-select:2'})
);
assert.ok(wrong);
assert.equal(wrong.selectedAlternativeId,'these');
assert.equal(wrong.result,'fail');
assert.equal(wrong.occurrenceId,'dependency-head-probe-select:2');

for(const alternative of ['all']){
  const evaluated=Result.evaluate(definition,event(alternative));
  assert.ok(evaluated);
  assert.equal(evaluated.result,'fail');
}

for(const forbidden of [
  'expectedHeadTokenId',
  'relation',
  'evidence',
  'attempt',
  'support',
  'score',
  'mastery',
  'greenPass',
  'progression'
]){
  assert.equal(
    Object.prototype.hasOwnProperty.call(correct,forbidden),
    false,
    'ProbeResult must not expose or create '+forbidden
  );
}

assert.equal(Result.evaluate(null,event('books')),null);
assert.equal(Result.evaluate(definition,null),null);
assert.equal(Result.evaluate(definition,event('missing')),null);
assert.equal(Result.evaluate(definition,event('books',{observed:false})),null);
assert.equal(Result.evaluate(definition,event('books',{actor:'system'})),null);
assert.equal(Result.evaluate(definition,event('books',{source:'dependency-focus'})),null);
assert.equal(Result.evaluate(definition,event('books',{occurrenceId:''})),null);
assert.equal(Result.evaluate(definition,event('books',{experienceId:'preparing-dinner'})),null);
assert.equal(Result.evaluate(definition,event('books',{structureId:'other-structure'})),null);
assert.equal(Result.evaluate(definition,event('books',{language:'pt'})),null);
assert.equal(Result.evaluate(definition,event('books',{dimension:'dependency-focus'})),null);
assert.equal(Result.evaluate(definition,event('books',{targetTokenId:'these'})),null);

console.log(
  'Adaptive Dependency Head Probe Result: PASS — one grounded explicit head selection resolves pass/fail against canonical head authority without creating Evidence, Attempt, support, Green Pass, or progression.'
);
