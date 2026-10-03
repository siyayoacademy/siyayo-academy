#!/usr/bin/env node
const assert = require('node:assert/strict');
const map = require('../data/stage/siyayo-stage-participation-map.json');

assert.equal(map.id, 'siyayo-stage-participation-map');
assert.ok(Array.isArray(map.participation) && map.participation.length >= 10);

const ids = new Set(map.participation.map(item => item.id));
for (const required of ['question-words','nouns-core','verb-actions','nice-party-perspectives','social-identity']) {
  assert.equal(ids.has(required), true, 'missing stage participant: ' + required);
}

for (const item of map.participation) {
  assert.ok(item.whatIsIt, item.id + ' requires whatIsIt');
  assert.ok(Array.isArray(item.source) && item.source.length, item.id + ' requires source');
  assert.ok(Array.isArray(item.learnerAction) && item.learnerAction.length, item.id + ' requires learnerAction');
  assert.ok(item.actorOrchestration, item.id + ' requires actorOrchestration');
  assert.ok(item.languageCoverage, item.id + ' requires languageCoverage');
  assert.ok(item.evidenceRole, item.id + ' requires evidenceRole');
  assert.ok(item.destinationOrPurpose, item.id + ' requires destinationOrPurpose');
}

console.log('PASS — Stage Participation Map preserves source, learner action, actor orchestration, language, evidence and purpose contracts.');
