#!/usr/bin/env node

const assert = require('node:assert/strict');
const Boundary = require('../js/adaptive-determiner-use-probe-attempt-boundary.js');

const event = Object.freeze({
  observed: true,
  actor: 'learner',
  source: 'determiner-use-probe-select',
  occurrenceId: 'determiner-use-probe-select:1',
  choice: 'cheese',
  experienceId: 'shopping-for-dinner',
  dimension: 'determiner-use',
  targetForm: 'which',
  targetNoun: 'cheese'
});

const evidence = Object.freeze({
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  support: 'none',
  context: Object.freeze({
    occurrenceId: 'determiner-use-probe-select:1',
    experienceId: 'shopping-for-dinner',
    targetForm: 'which',
    targetNoun: 'cheese',
    selectedAlternativeId: 'cheese'
  })
});

const attempt = Boundary.assemble({ learnerEvent: event, evidence });
assert.deepEqual(attempt, {
  occurrenceId: 'determiner-use-probe-select:1',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  support: 'none',
  context: {
    occurrenceId: 'determiner-use-probe-select:1',
    experienceId: 'shopping-for-dinner',
    targetForm: 'which',
    targetNoun: 'cheese',
    selectedAlternativeId: 'cheese'
  }
});
assert.ok(Object.isFrozen(attempt));
assert.ok(Object.isFrozen(attempt.context));
assert.equal(
  Object.prototype.hasOwnProperty.call(attempt, 'mode'),
  false,
  'local determiner-use Attempt must not fabricate transfer mode'
);

const failed = Boundary.assemble({
  learnerEvent: Object.freeze({ ...event, choice: 'should' }),
  evidence: Object.freeze({
    ...evidence,
    result: 'fail',
    context: Object.freeze({ ...evidence.context, selectedAlternativeId: 'should' })
  })
});
assert.ok(failed);
assert.equal(failed.result, 'fail');

assert.equal(Boundary.assemble({}), null);
assert.equal(Boundary.assemble({ learnerEvent: event }), null);
assert.equal(Boundary.assemble({ evidence }), null);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...event, occurrenceId: 'determiner-use-probe-select:2' },
    evidence
  }),
  null,
  'event and Evidence must belong to the same occurrence'
);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...event, experienceId: 'preparing-dinner' },
    evidence
  }),
  null,
  'Experience mismatch must fail closed'
);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...event, targetNoun: 'bread' },
    evidence
  }),
  null,
  'target noun mismatch must fail closed'
);
assert.equal(
  Boundary.assemble({
    learnerEvent: { ...event, choice: 'should' },
    evidence
  }),
  null,
  'selected alternative mismatch must fail closed'
);
assert.equal(
  Boundary.assemble({
    learnerEvent: event,
    evidence: { ...evidence, dimension: 'choice-function' }
  }),
  null,
  'foreign Evidence dimension must not enter determiner-use Attempt'
);

console.log(
  'Adaptive determiner-use probe Attempt boundary: PASS — one grounded learner occurrence owns exactly its local determiner-use Evidence without borrowing transfer mode.'
);
