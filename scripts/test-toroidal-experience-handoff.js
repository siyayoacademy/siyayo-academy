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

const liveNextWire = fs.readFileSync(path.join(ROOT, 'js/verb-explorer-live-next-wire.js'), 'utf8');

for (const hook of [
  "nextElement.closest('.toroidal-next')",
  "var interactiveTarget=nextCard||nextElement",
  "interactiveTarget.onclick=activate",
  "interactiveTarget.onkeydown=function(event)",
  "nextCard.dataset.nextState='available'",
  "nextCard.classList.remove('next-gated')"
]) {
  assert.ok(liveNextWire.includes(hook), 'missing learner-owned full-card NEXT hook: '+hook);
}

assert.ok(
  !fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8').includes('nextCard.onclick=activateNext'),
  'Verb Explorer base runtime must not bypass adaptive NEXT with direct card navigation'
);

assert.ok(
  liveNextWire.includes('SIYAYOVerbExplorerExperienceNavigation'),
  'NEXT must delegate to the canonical Experience navigation boundary'
);
assert.ok(
  !liveNextWire.includes('AdaptiveProgressionDecision') &&
  !liveNextWire.includes('releaseProgression'),
  'NEXT navigation must not be gated by pedagogical progression authorities'
);

console.log('PASS — the full NEXT card remains learner-owned and delegates to canonical Experience navigation without Green Pass gating.');
