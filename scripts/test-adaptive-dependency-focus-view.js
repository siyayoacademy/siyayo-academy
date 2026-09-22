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
assert.deepEqual(books.focus, {
  id: 'books',
  index: 4,
  form: 'books',
  wordClass: 'NOUN'
});
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
assert.deepEqual(three.focus, {
  id: 'three',
  index: 3,
  form: 'three',
  wordClass: 'NUM'
});
assert.deepEqual(three.head, {
  id: 'books',
  index: 4,
  form: 'books',
  wordClass: 'NOUN'
});
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

assert.equal(
  JSON.stringify(fixture),
  JSON.stringify(JSON.parse(fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8'))),
  'Dependency Focus must not mutate the canonical JSON fixture'
);

console.log(
  'Adaptive Dependency Focus View: PASS — BOOKS exposes ALL/THESE/THREE as grounded dependents and THREE resolves back to BOOKS through nummod, with no parser inference or pedagogical authority.'
);
