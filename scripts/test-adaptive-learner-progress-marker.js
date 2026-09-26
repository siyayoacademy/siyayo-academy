#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-learner-progress-marker.js'),
  true,
  'semantic progress-marker authority must exist before any visual bolinha/star rendering'
);

const Marker = require('../js/adaptive-learner-progress-marker.js');

function trail(footprints) {
  const closures = footprints.filter(item =>
    item.source === 'green-pass-contract' &&
    item.status === 'transfer-confirmed' &&
    item.confirmed === true &&
    item.contractStatus === 'GREEN_PASS'
  );
  return Object.freeze({
    status: footprints.length ? 'TRAIL_AVAILABLE' : 'TRAIL_EMPTY',
    skill: 'which.use.determiner',
    state: closures.length ? 'GREEN_PASS_CONFIRMED' : (footprints.length ? 'OBSERVED' : 'UNOBSERVED'),
    counts: Object.freeze({
      footprints: footprints.length,
      greenPassClosures: closures.length
    }),
    footprints: Object.freeze(footprints.map(Object.freeze))
  });
}

const unobserved = Marker.resolve(trail([]));
assert.deepEqual(unobserved, {
  status: 'PROGRESS_MARKER_READY',
  skill: 'which.use.determiner',
  state: 'UNOBSERVED',
  marker: 'EMPTY_DOT',
  confirmedExperiences: 0
});

const developing = Marker.resolve(trail([
  {
    source: 'determiner-use-probe',
    status: 'observed',
    experienceId: 'shopping-for-dinner',
    confirmed: false,
    contractStatus: null
  }
]));
assert.deepEqual(developing, {
  status: 'PROGRESS_MARKER_READY',
  skill: 'which.use.determiner',
  state: 'IN_PROGRESS',
  marker: 'PARTIAL_DOT',
  confirmedExperiences: 0
});

const confirmed = Marker.resolve(trail([
  {
    source: 'determiner-use-probe',
    status: 'observed',
    experienceId: 'shopping-for-dinner',
    confirmed: false,
    contractStatus: null
  },
  {
    source: 'green-pass-contract',
    status: 'transfer-confirmed',
    experienceId: 'shopping-for-dinner',
    confirmed: true,
    contractStatus: 'GREEN_PASS'
  }
]));
assert.deepEqual(confirmed, {
  status: 'PROGRESS_MARKER_READY',
  skill: 'which.use.determiner',
  state: 'CONFIRMED',
  marker: 'FILLED_DOT',
  confirmedExperiences: 1
});

const duplicateSameExperience = Marker.resolve(trail([
  {
    source: 'green-pass-contract',
    status: 'transfer-confirmed',
    experienceId: 'shopping-for-dinner',
    confirmed: true,
    contractStatus: 'GREEN_PASS'
  },
  {
    source: 'green-pass-contract',
    status: 'transfer-confirmed',
    experienceId: 'shopping-for-dinner',
    confirmed: true,
    contractStatus: 'GREEN_PASS'
  }
]));
assert.equal(
  duplicateSameExperience.state,
  'CONFIRMED',
  'repeated closure in the same Experience must not manufacture consolidation'
);
assert.equal(duplicateSameExperience.confirmedExperiences, 1);

const consolidated = Marker.resolve(trail([
  {
    source: 'green-pass-contract',
    status: 'transfer-confirmed',
    experienceId: 'shopping-for-dinner',
    confirmed: true,
    contractStatus: 'GREEN_PASS'
  },
  {
    source: 'green-pass-contract',
    status: 'transfer-confirmed',
    experienceId: 'preparing-dinner',
    confirmed: true,
    contractStatus: 'GREEN_PASS'
  }
]));
assert.deepEqual(consolidated, {
  status: 'PROGRESS_MARKER_READY',
  skill: 'which.use.determiner',
  state: 'CONSOLIDATED_EVIDENCE',
  marker: 'MILESTONE',
  confirmedExperiences: 2
});

for (const result of [unobserved, developing, confirmed, consolidated]) {
  assert.equal(Object.isFrozen(result), true);
  for (const forbidden of ['score', 'mastery', 'sound', 'nextExperience', 'transition']) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(result, forbidden),
      false,
      `progress marker semantics must not invent ${forbidden}`
    );
  }
}

assert.equal(Marker.resolve(null), null, 'missing Trail must preserve WAIT');
assert.equal(
  Marker.resolve({ skill: 'which.use.determiner', footprints: null }),
  null,
  'malformed Trail must preserve WAIT'
);

console.log(
  'Adaptive learner progress marker: PASS — ○/partial/●/milestone semantics are grounded only in longitudinal Trail evidence, with consolidation requiring confirmation in multiple distinct Experiences.'
);
