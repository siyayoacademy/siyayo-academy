#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-learner-trail-label.js'),
  true,
  'learner-facing Trail label projection must exist before the surface replaces technical skill ids'
);

const Label = require('../js/adaptive-learner-trail-label.js');

const which = Object.freeze({
  id: 'which.use.determiner',
  language: 'en',
  family: 'question-word',
  form: 'which',
  grammarRole: 'interrogative-determiner'
});

const projected = Label.project(which);
assert.deepEqual(projected, {
  status: 'TRAIL_LABEL_READY',
  skill: 'which.use.determiner',
  form: 'WHICH',
  family: 'QUESTION WORD',
  grammarRole: 'INTERROGATIVE DETERMINER'
});
assert.equal(Object.isFrozen(projected), true);

const minimal = Label.project(Object.freeze({
  id: 'noun.identity',
  form: 'noun'
}));
assert.deepEqual(minimal, {
  status: 'TRAIL_LABEL_READY',
  skill: 'noun.identity',
  form: 'NOUN',
  family: null,
  grammarRole: null
});

for (const forbidden of ['score', 'mastery', 'sound', 'nextExperience', 'transition', 'state']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(projected, forbidden),
    false,
    `learner-facing label must not invent ${forbidden}`
  );
}

assert.equal(Label.project(null), null, 'missing canonical definition must preserve WAIT');
assert.equal(Label.project({ id: 'which.use.determiner' }), null, 'missing canonical form must preserve WAIT');
assert.equal(Label.project({ form: 'which' }), null, 'missing canonical skill id must preserve WAIT');

console.log(
  'Adaptive learner Trail label: PASS — canonical Skill definition becomes a learner-facing word label without inventing progress, mastery, score, sound, or route.'
);
