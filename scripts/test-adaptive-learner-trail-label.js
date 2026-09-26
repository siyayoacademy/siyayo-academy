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
  grammarRole: 'interrogative-determiner',
  realizations: {
    en: { form: 'which', family: 'question-word', grammarRole: 'interrogative-determiner' },
    es: { form: 'qué', family: 'palabra-interrogativa', grammarRole: 'determinante-interrogativo' },
    pt: { form: 'qual', family: 'palavra-interrogativa', grammarRole: 'determinante-interrogativo' }
  }
});

const projected = Label.project(which);
assert.deepEqual(projected, {
  status: 'TRAIL_LABEL_READY',
  skill: 'which.use.determiner',
  form: 'WHICH',
  language: 'en',
  family: 'QUESTION WORD',
  grammarRole: 'INTERROGATIVE DETERMINER'
});
assert.equal(Object.isFrozen(projected), true);

const spanish = Label.project(which, 'es');
assert.equal(spanish.skill, 'which.use.determiner');
assert.equal(spanish.form, 'QUÉ');
assert.equal(spanish.family, 'PALABRA INTERROGATIVA');
assert.equal(spanish.grammarRole, 'DETERMINANTE INTERROGATIVO');
const portuguese = Label.project(which, 'pt');
assert.equal(portuguese.skill, 'which.use.determiner');
assert.equal(portuguese.form, 'QUAL');
assert.equal(portuguese.family, 'PALAVRA INTERROGATIVA');
assert.equal(portuguese.grammarRole, 'DETERMINANTE INTERROGATIVO');

const minimal = Label.project(Object.freeze({
  id: 'noun.identity',
  form: 'noun'
}));
assert.deepEqual(minimal, {
  status: 'TRAIL_LABEL_READY',
  skill: 'noun.identity',
  form: 'NOUN',
  language: 'en',
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
