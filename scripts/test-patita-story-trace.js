#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const college = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/learning/college-experience-seeds.json'), 'utf8'));
const verbs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lexicon/verbs/actions.json'), 'utf8'));

const expectedTrace = [
  ['going-to-college', 'go'],
  ['studying-in-class', 'study'],
  ['reading-class-material', 'read'],
  ['writing-class-notes', 'write'],
  ['talking-with-classmates', 'talk']
];

const items = college.items || [];
const visited = [];
let cursor = expectedTrace[0][0];

for (const [expectedId, expectedVerb] of expectedTrace) {
  assert.equal(cursor, expectedId, `Patita expected ${expectedId} as the next footprint`);
  const experience = items.find(item => item.id === cursor);
  assert.ok(experience, `${cursor} must resolve as a Patita footprint`);
  assert.equal(experience.entryVerb, expectedVerb, `${cursor} must preserve ${expectedVerb} as its story action`);

  const canonicalVerb = verbs.find(verb => verb.id === expectedVerb);
  assert.ok(canonicalVerb, `${expectedVerb} must resolve in the canonical verb corpus`);
  assert.ok(canonicalVerb.verbFunction?.includes('action'), `${expectedVerb} must preserve ACTION semantics`);

  visited.push({
    experienceId: experience.id,
    action: expectedVerb,
    title: experience.title
  });
  cursor = experience.toroidalNext.nextExperience;
}

assert.equal(cursor, expectedTrace[0][0], 'Patita must recognize the exact return to the College origin');
assert.deepEqual(visited.map(step => step.experienceId), expectedTrace.map(([id]) => id), 'Patita must preserve traversal order');

for (const language of ['en', 'es', 'pt']) {
  const story = visited.map(step => step.title?.[language]).filter(Boolean);
  assert.equal(story.length, expectedTrace.length, `Patita requires every footprint to be narratable in ${language}`);
  assert.ok(story.every(Boolean), `Patita story trace cannot contain an empty ${language} title`);
}

const storyActions = visited.map(step => step.action);
assert.deepEqual(storyActions, ['go', 'study', 'read', 'write', 'talk'], 'Patita must preserve the canonical action story');

console.log('PASS — 6.16 Patita preserves the College traversal as a narratable story trace.');
console.log('PASS — go → study → read → write → talk is recoverable in EN/ES/PT and returns to origin.');
