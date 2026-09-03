#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const college = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/learning/college-experience-seeds.json'), 'utf8')
);
const verbs = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/lexicon/verbs/actions.json'), 'utf8')
);

const items = college.items || [];
const expectedCycle = [
  ['going-to-college', 'go', 'studying-in-class'],
  ['studying-in-class', 'study', 'reading-class-material'],
  ['reading-class-material', 'read', 'writing-class-notes'],
  ['writing-class-notes', 'write', 'going-to-college']
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

const linkedVerbIds = new Set(items.flatMap(item => item.links?.verbs || []));
for (const verbId of linkedVerbIds) {
  assert.ok(verbs.some(verb => verb.id === verbId), `${verbId} must resolve from College links to the canonical verb corpus`);
}

let cursor = expectedCycle[0][0];
const visited = [];
for (let step = 0; step < expectedCycle.length; step += 1) {
  assert.ok(!visited.includes(cursor), `College cycle repeated ${cursor} before completing the expected ring`);
  visited.push(cursor);
  const experience = items.find(item => item.id === cursor);
  assert.ok(experience, `${cursor} must resolve while traversing the College toroid`);
  cursor = experience.toroidalNext.nextExperience;
}

assert.deepEqual(visited, expectedCycle.map(([id]) => id), '6.14 College classroom traversal order must remain canonical');
assert.equal(cursor, expectedCycle[0][0], '6.14 College classroom branch must return to going-to-college');

assert.ok(items.find(item => item.id === 'reading-class-material')?.links.verbs.includes('write'), 'reading must expose write as a canonical continuation');
assert.ok(items.find(item => item.id === 'writing-class-notes')?.links.verbs.includes('read'), 'writing must preserve the read relationship for contextual reuse');

console.log('PASS — 6.14 protects the expanded College classroom learning ring.');
console.log('PASS — go → study → read → write → go preserves canonical ACTION semantics, EN/ES/PT continuity and return to origin.');
