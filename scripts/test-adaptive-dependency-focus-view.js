#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

const fixture = JSON.parse(
  fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8')
);

assert.equal(
  fs.existsSync('js/adaptive-dependency-focus-view.js'),
  true,
  'Dependency Focus View must exist before syntactic relations can be projected to the UI'
);

const Focus = require('../js/adaptive-dependency-focus-view.js');

const books = Focus.resolve(fixture, 'books');
assert.ok(books);
assert.equal(books.status, 'DEPENDENCY_FOCUS_READY');
assert.equal(books.focus.id, 'books');
assert.equal(books.focus.index, 4);
assert.equal(books.focus.form, 'books');
assert.equal(books.focus.wordClass, 'NOUN');
assert.deepEqual(books.focus.pedagogy, fixture.tokens.find(item => item.id === 'books').pedagogy);
assert.deepEqual(
  books.dependents.map(item => item.id),
  ['all','these','three']
);
assert.deepEqual(
  books.relations.map(item => item.relation),
  ['det','det','nummod']
);
assert.deepEqual(
  books.relations.map(item => [item.head,item.dependent]),
  [['books','all'],['books','these'],['books','three']]
);

const three = Focus.resolve(fixture, 'three');
assert.ok(three);
assert.equal(three.status, 'DEPENDENCY_FOCUS_READY');
assert.equal(three.focus.id, 'three');
assert.equal(three.focus.index, 3);
assert.equal(three.focus.form, 'three');
assert.equal(three.focus.wordClass, 'NUM');
assert.deepEqual(three.focus.pedagogy, fixture.tokens.find(item => item.id === 'three').pedagogy);
assert.equal(three.head.id, 'books');
assert.equal(three.head.index, 4);
assert.equal(three.head.form, 'books');
assert.equal(three.head.wordClass, 'NOUN');
assert.deepEqual(three.head.pedagogy, fixture.tokens.find(item => item.id === 'books').pedagogy);
assert.deepEqual(three.dependents, []);
assert.deepEqual(three.relations, [
  {
    head: 'books',
    dependent: 'three',
    relation: 'nummod'
  }
]);

assert.equal(
  Focus.resolve(fixture, 'missing-token'),
  null,
  'unknown focus token must fail closed'
);

for (const result of [books, three]) {
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.focus), true);
  assert.equal(Object.isFrozen(result.relations), true);
  assert.equal(Object.isFrozen(result.dependents), true);
  for (const forbidden of ['score','mastery','progression','greenPass','learnerEvent','route']) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(result, forbidden),
      false,
      `Dependency Focus must not invent ${forbidden}`
    );
  }
}


const tenKinds = Object.freeze({
  tokens: Object.freeze([
    Object.freeze({ id:'pronoun', index:1, form:'we', wordClass:'PRONOUN' }),
    Object.freeze({ id:'verb', index:2, form:'see', wordClass:'VERB' }),
    Object.freeze({ id:'adjective', index:3, form:'bright', wordClass:'ADJECTIVE' }),
    Object.freeze({ id:'conjunction', index:4, form:'and', wordClass:'CONJUNCTION' }),
    Object.freeze({ id:'article', index:5, form:'the', wordClass:'ARTICLE' }),
    Object.freeze({ id:'adverb', index:6, form:'clearly', wordClass:'ADVERB' }),
    Object.freeze({ id:'preposition', index:7, form:'with', wordClass:'PREPOSITION' }),
    Object.freeze({ id:'interjection', index:8, form:'wow', wordClass:'INTERJECTION' }),
    Object.freeze({ id:'noun', index:9, form:'pattern', wordClass:'NOUN' }),
    Object.freeze({ id:'numeral', index:10, form:'two', wordClass:'NUMERAL' })
  ]),
  relations: Object.freeze([
    Object.freeze({ head:'verb', dependent:'pronoun', relation:'subject' }),
    Object.freeze({ head:'noun', dependent:'adjective', relation:'modifier' }),
    Object.freeze({ head:'verb', dependent:'conjunction', relation:'connector' }),
    Object.freeze({ head:'noun', dependent:'article', relation:'determiner' }),
    Object.freeze({ head:'verb', dependent:'adverb', relation:'modifier' }),
    Object.freeze({ head:'noun', dependent:'preposition', relation:'relation-marker' }),
    Object.freeze({ head:'verb', dependent:'interjection', relation:'discourse' }),
    Object.freeze({ head:'verb', dependent:'noun', relation:'object' }),
    Object.freeze({ head:'noun', dependent:'numeral', relation:'numeric-modifier' })
  ])
});

for (const token of tenKinds.tokens) {
  const result = Focus.resolve(tenKinds, token.id);
  assert.ok(result, 'TEN KINDS genericity: '+token.wordClass+' must be focusable');
  assert.equal(result.focus.wordClass, token.wordClass);
}

assert.equal(
  JSON.stringify(fixture),
  JSON.stringify(JSON.parse(fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8'))),
  'Dependency Focus must not mutate the canonical JSON fixture'
);

console.log(
  'Adaptive Dependency Focus View: PASS — grounded head/dependent resolution is word-class agnostic across the TEN KINDS; BOOKS exposes ALL/THESE/THREE and THREE resolves back to BOOKS through nummod, with no parser inference or pedagogical authority.'
);
