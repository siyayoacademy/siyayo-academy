#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-dependency-head-probe-attempt-boundary.js'),
  true,
  'Dependency Head Probe Attempt boundary must exist before Evidence can enter the adaptive Cycle'
);

const Boundary = require('../js/adaptive-dependency-head-probe-attempt-boundary.js');

const event = Object.freeze({
  observed:true,
  actor:'learner',
  source:'dependency-head-probe-select',
  occurrenceId:'dependency-head-probe-select:1',
  choice:'books',
  experienceId:'shopping-for-dinner',
  structureId:'all-these-three-books',
  language:'en',
  dimension:'head-identification',
  targetTokenId:'three'
});

const evidence = Object.freeze({
  skill:'which.use.determiner',
  dimension:'head-identification',
  result:'pass',
  support:'none',
  context:Object.freeze({
    occurrenceId:'dependency-head-probe-select:1',
    experienceId:'shopping-for-dinner',
    structureId:'all-these-three-books',
    language:'en',
    targetTokenId:'three',
    selectedAlternativeId:'books'
  })
});

const attempt = Boundary.assemble({learnerEvent:event,evidence});
assert.deepEqual(attempt,{
  occurrenceId:'dependency-head-probe-select:1',
  skill:'which.use.determiner',
  dimension:'head-identification',
  result:'pass',
  support:'none',
  context:{
    occurrenceId:'dependency-head-probe-select:1',
    experienceId:'shopping-for-dinner',
    structureId:'all-these-three-books',
    language:'en',
    targetTokenId:'three',
    selectedAlternativeId:'books'
  }
});
assert.ok(Object.isFrozen(attempt));
assert.ok(Object.isFrozen(attempt.context));

for(const forbidden of ['mode','greenPass','progression','mastery','score']){
  assert.equal(Object.prototype.hasOwnProperty.call(attempt,forbidden),false);
}

assert.equal(Boundary.assemble({}),null);
assert.equal(Boundary.assemble({learnerEvent:event}),null);
assert.equal(Boundary.assemble({evidence}),null);
assert.equal(Boundary.assemble({
  learnerEvent:{...event,occurrenceId:'dependency-head-probe-select:2'},
  evidence
}),null);
assert.equal(Boundary.assemble({
  learnerEvent:{...event,choice:'these'},
  evidence
}),null);
assert.equal(Boundary.assemble({
  learnerEvent:{...event,targetTokenId:'these'},
  evidence
}),null);
assert.equal(Boundary.assemble({
  learnerEvent:event,
  evidence:{...evidence,dimension:'dependency-focus'}
}),null);
assert.equal(Boundary.assemble({
  learnerEvent:event,
  evidence:{...evidence,skill:''}
}),null);

console.log(
  'Adaptive Dependency Head Probe Attempt boundary: PASS — one observed occurrence owns exactly its grounded head-identification Evidence without inventing mode, Green Pass, mastery, or progression.'
);
