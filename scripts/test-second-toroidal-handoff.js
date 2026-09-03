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
const preparing = items.find(item => item.id === 'preparing-dinner');
assert.ok(preparing, 'preparing-dinner experience is required');

const nextId = preparing.toroidalNext?.nextExperience;
assert.equal(nextId, 'having-dinner', 'preparing-dinner must hand off to having-dinner');

const having = items.find(item => item.id === nextId);
assert.ok(having, 'having-dinner must resolve to an existing experience');
assert.equal(having.entryVerb, 'eat', 'having-dinner must enter through canonical eat');

const eat = verbs.find(verb => verb.id === having.entryVerb);
assert.ok(eat, 'having-dinner entryVerb must resolve to the canonical verb corpus');
assert.ok(eat.verbFunction?.includes('action'), 'eat must preserve canonical ACTION semantics');

for (const language of ['en', 'es', 'pt']) {
  assert.ok(preparing.toroidalNext?.prompt?.[language], `preparing-dinner requires ${language} toroidal prompt`);
  assert.ok(preparing.toroidalNext?.answer?.[language], `preparing-dinner requires ${language} toroidal answer`);
  assert.ok(having.title?.[language], `having-dinner requires ${language} title`);
  assert.ok(having.situation?.[language], `having-dinner requires ${language} situation`);
}

console.log('PASS — 6.10 resolves preparing-dinner → having-dinner as the second toroidal handoff.');
console.log('PASS — trilingual continuity is preserved and the next experience enters through canonical ACTION verb eat.');
