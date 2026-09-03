#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const experiences = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/learning/experience-seeds.json'), 'utf8')
);
const verbs = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/lexicon/verbs/actions.json'), 'utf8')
);

const items = experiences.items || [];
const expectedCycle = [
  ['shopping-for-dinner', 'buy', 'preparing-dinner'],
  ['preparing-dinner', 'cook', 'having-dinner'],
  ['having-dinner', 'eat', 'after-dinner-conversation'],
  ['after-dinner-conversation', 'talk', 'shopping-for-dinner']
];

for (const [id, entryVerb, nextId] of expectedCycle) {
  const experience = items.find(item => item.id === id);
  assert.ok(experience, `${id} experience is required`);
  assert.equal(experience.entryVerb, entryVerb, `${id} must enter through canonical ${entryVerb}`);
  assert.equal(experience.toroidalNext?.nextExperience, nextId, `${id} must hand off to ${nextId}`);

  const verb = verbs.find(item => item.id === entryVerb);
  assert.ok(verb, `${entryVerb} must resolve to the canonical verb corpus`);
  assert.ok(verb.verbFunction?.includes('action'), `${entryVerb} must preserve canonical ACTION semantics`);

  for (const language of ['en', 'es', 'pt']) {
    assert.ok(experience.title?.[language], `${id} requires ${language} title`);
    assert.ok(experience.situation?.[language], `${id} requires ${language} situation`);
    assert.ok(experience.toroidalNext?.prompt?.[language], `${id} requires ${language} toroidal prompt`);
    assert.ok(experience.toroidalNext?.answer?.[language], `${id} requires ${language} toroidal answer`);
  }
}

let cursor = expectedCycle[0][0];
const visited = [];
for (let step = 0; step < expectedCycle.length; step += 1) {
  assert.ok(!visited.includes(cursor), `cycle repeated ${cursor} before visiting every expected experience`);
  visited.push(cursor);
  const experience = items.find(item => item.id === cursor);
  assert.ok(experience, `${cursor} must resolve while traversing the toroid`);
  cursor = experience.toroidalNext.nextExperience;
}

assert.deepEqual(visited, expectedCycle.map(([id]) => id), 'toroidal traversal order must remain canonical');
assert.equal(cursor, expectedCycle[0][0], 'complete toroidal traversal must return to shopping-for-dinner');

console.log('PASS — 6.12 protects the complete SIYAYO dinner toroidal cycle.');
console.log('PASS — buy → cook → eat → talk preserves ACTION semantics, EN/ES/PT continuity, canonical order and return to origin.');
