#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-learner-trail-position.js'),
  true,
  'current-position projection must exist before the Trail can illuminate where the learner is now'
);

const Position = require('../js/adaptive-learner-trail-position.js');

const sequence = Object.freeze({
  status: 'TRAIL_SEQUENCE_AVAILABLE',
  skill: 'which.use.determiner',
  segments: Object.freeze([
    Object.freeze({
      experienceId: 'shopping-for-dinner',
      state: 'CONFIRMED',
      marker: 'FILLED_DOT',
      footprints: 2,
      greenPassClosures: 1
    }),
    Object.freeze({
      experienceId: 'preparing-dinner',
      state: 'IN_PROGRESS',
      marker: 'PARTIAL_DOT',
      footprints: 1,
      greenPassClosures: 0
    })
  ])
});

const visitedCurrent = Position.resolve(sequence, 'preparing-dinner');
assert.deepEqual(visitedCurrent, {
  status: 'TRAIL_POSITION_READY',
  skill: 'which.use.determiner',
  currentExperienceId: 'preparing-dinner',
  visited: true,
  segmentIndex: 1
});
assert.equal(Object.isFrozen(visitedCurrent), true);

const newCurrent = Position.resolve(sequence, 'having-dinner');
assert.deepEqual(newCurrent, {
  status: 'TRAIL_POSITION_READY',
  skill: 'which.use.determiner',
  currentExperienceId: 'having-dinner',
  visited: false,
  segmentIndex: -1
});
assert.equal(
  sequence.segments.length,
  2,
  'current position outside the Trail must not be manufactured into longitudinal evidence'
);

for (const result of [visitedCurrent, newCurrent]) {
  for (const forbidden of ['score', 'mastery', 'sound', 'nextExperience', 'transition', 'marker']) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(result, forbidden),
      false,
      `current-position projection must not invent ${forbidden}`
    );
  }
}

assert.equal(Position.resolve(null, 'shopping-for-dinner'), null, 'missing Trail sequence must preserve WAIT');
assert.equal(Position.resolve(sequence, '   '), null, 'missing current Experience must preserve WAIT');

console.log(
  'Adaptive learner Trail position: PASS — live current Experience illuminates the learner position without becoming evidence, progression, mastery, score, or sound.'
);
