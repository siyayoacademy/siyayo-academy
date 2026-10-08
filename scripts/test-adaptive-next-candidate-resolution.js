#!/usr/bin/env node

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const AdaptiveAdvanceSelector = require('../js/adaptive-advance-selector.js');

const corpus = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/learning/experience-seeds.json'), 'utf8')
);

const context = {
  experiences: corpus.items,
  currentExperience: 'shopping-for-dinner'
};
const before = context.currentExperience;

const candidate = AdaptiveAdvanceSelector.resolveCandidate(context);

assert.equal(candidate.status, 'candidate-resolved');
assert.equal(candidate.fromExperience, 'shopping-for-dinner');
assert.equal(candidate.experienceId, 'preparing-dinner');
assert.equal(candidate.entryVerb, 'cook');
assert.equal(context.currentExperience, before, 'candidate resolution must not move current Experience');
assert.equal(Object.prototype.hasOwnProperty.call(candidate, 'action'), false, 'candidate must not authorize advance');
assert.notEqual(candidate.status, 'selected', 'candidate resolution must not imply selection');

const legacySelection = AdaptiveAdvanceSelector.select({ action: 'advance' }, context);
assert.equal(legacySelection.status, 'selected');
assert.equal(legacySelection.experienceId, 'preparing-dinner');
assert.equal(legacySelection.entryVerb, 'cook');
assert.equal(context.currentExperience, before, 'legacy selection must not mutate caller context directly');

console.log('PASS — canonical toroidal candidate resolves without movement or advance authorization.');
console.log('PASS — legacy select(action=advance) remains backward compatible.');
