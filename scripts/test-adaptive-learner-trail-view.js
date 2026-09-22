#!/usr/bin/env node

const assert = require('node:assert/strict');
const Profile = require('../js/adaptive-evidence-profile.js');

assert.equal(
  require('node:fs').existsSync('js/adaptive-learner-trail-view.js'),
  true,
  'read-only learner trail projection must exist before the visual trail can consume evidence'
);

const Trail = require('../js/adaptive-learner-trail-view.js');
const skill = 'which.use.determiner';
const profile = Profile.createProfile('learner-trail');

Profile.record(profile, {
  source: 'xespirito-repair-trace',
  status: 'observed-conflict',
  repeated: [],
  requiresReview: true,
  conflict: true,
  requiresReinforcement: false
}, {
  skill: 'auxiliary-have',
  language: 'en',
  chapter: 'verbs',
  confirmed: false,
  experienceId: 'having-dinner'
});

Profile.record(profile, {
  source: 'determiner-use-probe',
  status: 'observed',
  repeated: [],
  requiresReview: false,
  conflict: false,
  requiresReinforcement: false
}, {
  skill,
  language: 'en',
  chapter: 'question-words',
  confirmed: false,
  experienceId: 'shopping-for-dinner'
});

const before = JSON.stringify(profile);
const observed = Trail.project(profile, skill);

assert.ok(observed);
assert.equal(observed.status, 'TRAIL_AVAILABLE');
assert.equal(observed.skill, skill);
assert.equal(observed.state, 'OBSERVED');
assert.equal(observed.counts.footprints, 1);
assert.equal(observed.counts.greenPassClosures, 0);
assert.equal(observed.footprints.length, 1);
assert.equal(observed.footprints[0].source, 'determiner-use-probe');
assert.equal(observed.footprints[0].experienceId, 'shopping-for-dinner');
assert.equal(observed.footprints[0].confirmed, false);
assert.equal(Object.isFrozen(observed), true);
assert.equal(Object.isFrozen(observed.counts), true);
assert.equal(Object.isFrozen(observed.footprints), true);
assert.equal(Object.isFrozen(observed.footprints[0]), true);
assert.equal(JSON.stringify(profile), before, 'trail projection must not mutate longitudinal evidence');

for (const forbidden of ['action', 'score', 'nextExperience', 'transition', 'sound', 'stars']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(observed, forbidden),
    false,
    `trail projection must not invent ${forbidden}`
  );
}

Profile.record(profile, {
  source: 'green-pass-contract',
  status: 'transfer-confirmed',
  repeated: [],
  requiresReview: false,
  conflict: false,
  requiresReinforcement: false
}, {
  skill,
  language: 'en',
  chapter: 'question-words',
  confirmed: true,
  experienceId: 'shopping-for-dinner',
  contractStatus: 'GREEN_PASS'
});

const confirmed = Trail.project(profile, skill);
assert.equal(confirmed.status, 'TRAIL_AVAILABLE');
assert.equal(confirmed.state, 'GREEN_PASS_CONFIRMED');
assert.equal(confirmed.counts.footprints, 2);
assert.equal(confirmed.counts.greenPassClosures, 1);
assert.deepEqual(
  confirmed.footprints.map(item => item.source),
  ['determiner-use-probe', 'green-pass-contract'],
  'trail must preserve chronological evidence order'
);
assert.equal(confirmed.footprints[1].confirmed, true);
assert.equal(confirmed.footprints[1].contractStatus, 'GREEN_PASS');

const empty = Trail.project(profile, 'noun.identity');
assert.ok(empty);
assert.equal(empty.status, 'TRAIL_EMPTY');
assert.equal(empty.state, 'UNOBSERVED');
assert.equal(empty.counts.footprints, 0);
assert.equal(empty.counts.greenPassClosures, 0);
assert.deepEqual(Array.from(empty.footprints), []);

assert.equal(Trail.project(null, skill), null, 'missing Evidence Profile must preserve WAIT');
assert.equal(Trail.project(profile, '   '), null, 'blank skill must preserve WAIT');

console.log(
  'Adaptive learner trail view: PASS — longitudinal evidence becomes a read-only, skill-scoped trail without inventing mastery, progression, stars, or sound.'
);
