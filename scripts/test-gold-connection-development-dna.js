#!/usr/bin/env node
const assert=require('node:assert/strict');
const map=require('../data/canonical/siyayo-development-map.json');

assert.equal(map.goldConnection.status,'canonical-adaptive-expansion-dna');
assert.equal(map.goldConnection.surface,'Tri-Language Verb Explorer');
assert.ok(map.goldConnection.expansionFlow.includes('contract-authority-check'));
assert.ok(map.goldConnection.expansionFlow.includes('experience-assessment-target'));
assert.ok(map.goldConnection.expansionFlow.includes('toro-expansion'));
assert.match(map.goldConnection.nonEquivalences.join('|'),/capability-present != contract-authorized/);
assert.match(map.goldConnection.nonEquivalences.join('|'),/navigation != session-transition/);
assert.match(map.goldConnection.nonEquivalences.join('|'),/animation != evidence/);
assert.equal(map.goldConnection.toro.gates,'contract authority plus explicit Experience assessment target');
assert.ok(map.goldConnection.toro.center.includes('assessment-scope'));
assert.ok(map.goldConnection.toro.rings.includes('verbs'));
assert.ok(map.goldConnection.toro.rings.includes('adjectives'));
assert.ok(map.goldConnection.toro.rings.includes('question-words'));
assert.match(map.goldConnection.encyclopediaVision.description,/encyclopedia-scale interactivity/);
assert.match(map.goldConnection.encyclopediaVision.branchRule,/independent mastery, score, progression or routing systems/);
console.log('PASS — GOLD CONNECTION preserves SIYAYO adaptive TORO expansion DNA across corpus, authority, profile and future branches.');
