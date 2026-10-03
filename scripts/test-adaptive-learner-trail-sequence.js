#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-learner-trail-sequence.js'),
  true,
  'experience-sequence projection must exist before the visual Trail can narrate where the learner has already been'
);

const Sequence = require('../js/adaptive-learner-trail-sequence.js');

const trail = Object.freeze({
  status: 'TRAIL_AVAILABLE',
  skill: 'which.use.determiner',
  state: 'GREEN_PASS_CONFIRMED',
  counts: Object.freeze({ footprints: 6, greenPassClosures: 2 }),
  footprints: Object.freeze([
    Object.freeze({
      source: 'determiner-use-probe',
      status: 'observed',
      experienceId: 'shopping-for-dinner',
      confirmed: false,
      contractStatus: null
    }),
    Object.freeze({
      source: 'green-pass-contract',
      status: 'transfer-confirmed',
      experienceId: 'shopping-for-dinner',
      confirmed: true,
      contractStatus: 'GREEN_PASS'
    }),
    Object.freeze({
      source: 'determiner-use-probe',
      status: 'observed',
      experienceId: 'preparing-dinner',
      confirmed: false,
      contractStatus: null
    }),
    Object.freeze({
      source: 'green-pass-contract',
      status: 'transfer-confirmed',
      experienceId: 'preparing-dinner',
      confirmed: true,
      contractStatus: 'GREEN_PASS'
    }),
    Object.freeze({
      source: 'determiner-use-probe',
      status: 'observed',
      experienceId: 'having-dinner',
      confirmed: false,
      contractStatus: null
    }),
    Object.freeze({
      source: 'determiner-use-probe',
      status: 'observed',
      experienceId: 'preparing-dinner',
      confirmed: false,
      contractStatus: null
    })
  ])
});

const result = Sequence.project(trail);

assert.ok(result);
assert.equal(result.status, 'TRAIL_SEQUENCE_AVAILABLE');
assert.equal(result.skill, 'which.use.determiner');
assert.equal(result.segments.length, 3);
assert.deepEqual(
  result.segments.map(segment => segment.experienceId),
  ['shopping-for-dinner', 'preparing-dinner', 'having-dinner'],
  'sequence must preserve first-observed Experience order'
);

assert.deepEqual(result.segments[0], {
  experienceId: 'shopping-for-dinner',
  state: 'CONFIRMED',
  marker: 'FILLED_DOT',
  footprints: 2,
  greenPassClosures: 1
});
assert.deepEqual(result.segments[1], {
  experienceId: 'preparing-dinner',
  state: 'CONFIRMED',
  marker: 'FILLED_DOT',
  footprints: 3,
  greenPassClosures: 1
});
assert.deepEqual(result.segments[2], {
  experienceId: 'having-dinner',
  state: 'IN_PROGRESS',
  marker: 'PARTIAL_DOT',
  footprints: 1,
  greenPassClosures: 0
});

assert.equal(Object.isFrozen(result), true);
assert.equal(Object.isFrozen(result.segments), true);
assert.ok(result.segments.every(Object.isFrozen));

for (const forbidden of ['score', 'mastery', 'sound', 'nextExperience', 'transition', 'futureExperience']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(result, forbidden),
    false,
    `Trail sequence must not invent ${forbidden}`
  );
}

const empty = Sequence.project(Object.freeze({
  status: 'TRAIL_EMPTY',
  skill: 'noun.identity',
  state: 'UNOBSERVED',
  counts: Object.freeze({ footprints: 0, greenPassClosures: 0 }),
  footprints: Object.freeze([])
}));
assert.ok(empty);
assert.equal(empty.status, 'TRAIL_SEQUENCE_EMPTY');
assert.equal(empty.skill, 'noun.identity');
assert.deepEqual(Array.from(empty.segments), []);

assert.equal(Sequence.project(null), null, 'missing Trail must preserve WAIT');
assert.equal(
  Sequence.project({ skill: 'which.use.determiner', footprints: null }),
  null,
  'malformed Trail must preserve WAIT'
);

console.log(
  'Adaptive learner Trail sequence: PASS — the rasto is grouped into chronological Experience footprints without inventing future route, score, mastery, or sound.'
);
