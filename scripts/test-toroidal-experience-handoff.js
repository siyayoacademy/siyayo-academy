#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const experiences = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/learning/experience-seeds.json'), 'utf8')
);

const items = experiences.items || [];
const shopping = items.find(item => item.id === 'shopping-for-dinner');
assert.ok(shopping, 'shopping-for-dinner experience is required');

const nextId = shopping.toroidalNext?.nextExperience;
assert.equal(nextId, 'preparing-dinner', 'shopping must hand off to preparing-dinner');

const preparing = items.find(item => item.id === nextId);
assert.ok(preparing, 'toroidal nextExperience must resolve to an existing experience');
assert.equal(preparing.entryVerb, 'cook', 'preparing-dinner must enter through canonical cook');

assert.ok(shopping.toroidalNext?.prompt?.en, 'toroidal handoff requires an English prompt');
assert.ok(shopping.toroidalNext?.prompt?.es, 'toroidal handoff requires a Spanish prompt');
assert.ok(shopping.toroidalNext?.prompt?.pt, 'toroidal handoff requires a Portuguese prompt');
assert.ok(shopping.toroidalNext?.answer?.en, 'toroidal handoff requires an English answer');
assert.ok(shopping.toroidalNext?.answer?.es, 'toroidal handoff requires a Spanish answer');
assert.ok(shopping.toroidalNext?.answer?.pt, 'toroidal handoff requires a Portuguese answer');

console.log('PASS — 6.8 resolves shopping-for-dinner → preparing-dinner as a valid toroidal handoff.');
console.log('PASS — the next experience preserves trilingual continuity and enters through cook.');
