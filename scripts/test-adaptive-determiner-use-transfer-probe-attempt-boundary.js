#!/usr/bin/env node

const assert = require('node:assert/strict');
const Boundary = require('../js/adaptive-determiner-use-transfer-probe-attempt-boundary.js');

const learnerEvent = Object.freeze({
  observed: true,
  actor: 'learner',
  source: 'determiner-use-transfer-probe-select',
  occurrenceId: 'determiner-use-transfer-probe-select:1',
  choice: 'carrots',
  fromExperienceId: 'shopping-for-dinner',
  experienceId: 'preparing-dinner',
  dimension: 'determiner-use',
  mode: 'transfer',
  targetForm: 'which',
  targetNoun: 'carrots'
});

const evidence = Object.freeze({
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'transfer',
  support: 'none',
  context: Object.freeze({
    occurrenceId: 'determiner-use-transfer-probe-select:1',
    fromExperienceId: 'shopping-for-dinner',
    experienceId: 'preparing-dinner',
    targetForm: 'which',
    targetNoun: 'carrots',
    selectedAlternativeId: 'carrots'
  })
});

const attempt = Boundary.assemble({ learnerEvent, evidence });
assert.deepEqual(attempt, {
  occurrenceId: 'determiner-use-transfer-probe-select:1',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'transfer',
  support: 'none',
  context: {
    occurrenceId: 'determiner-use-transfer-probe-select:1',
    fromExperienceId: 'shopping-for-dinner',
    experienceId: 'preparing-dinner',
    targetForm: 'which',
    targetNoun: 'carrots',
    selectedAlternativeId: 'carrots'
  }
});
assert.ok(Object.isFrozen(attempt));
assert.ok(Object.isFrozen(attempt.context));

const failed = Boundary.assemble({
  learnerEvent: Object.freeze({ ...learnerEvent, choice: 'should' }),
  evidence: Object.freeze({
    ...evidence,
    result: 'fail',
    context: Object.freeze({ ...evidence.context, selectedAlternativeId: 'should' })
  })
});
assert.ok(failed);
assert.equal(failed.result, 'fail');
assert.equal(failed.mode, 'transfer');

assert.equal(Boundary.assemble({}), null);
assert.equal(Boundary.assemble({ learnerEvent }), null);
assert.equal(Boundary.assemble({ evidence }), null);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...learnerEvent, occurrenceId: 'determiner-use-transfer-probe-select:2' },
    evidence
  }),
  null,
  'event and transfer Evidence must belong to the same occurrence'
);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...learnerEvent, fromExperienceId: 'preparing-dinner' },
    evidence
  }),
  null,
  'transfer origin mismatch must fail closed'
);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...learnerEvent, experienceId: 'shopping-for-dinner' },
    evidence
  }),
  null,
  'transfer destination mismatch must fail closed'
);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...learnerEvent, mode: 'controlled-production' },
    evidence
  }),
  null,
  'transfer Attempt requires explicit transfer ownership'
);
assert.equal(
  Boundary.assemble({
    learnerEvent,
    evidence: { ...evidence, mode: undefined }
  }),
  null,
  'transfer mode must not disappear from Evidence'
);

console.log(
  'Adaptive determiner-use transfer probe Attempt boundary: PASS — one grounded cross-Experience learner occurrence owns exactly its transfer Evidence and preserves explicit transfer mode.'
);
