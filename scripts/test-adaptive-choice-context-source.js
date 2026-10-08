#!/usr/bin/env node

const assert = require('node:assert/strict');
const source = require('../js/adaptive-choice-context-source.js');
const experiences = require('../data/learning/experience-seeds.json').items;
const whichSkill = require('../data/learning/skills/which.json');

const session = Object.freeze({
  decision: Object.freeze({
    skill: 'which.use.determiner',
    experienceId: 'shopping-for-dinner'
  })
});

const resolved = source.resolve(session, whichSkill, experiences);

assert.ok(resolved, 'explicit Session + canonical Skill + Experience catalog must resolve one Choice context');
assert.equal(resolved.skill, 'which.use.determiner');
assert.equal(resolved.experienceId, 'shopping-for-dinner');
assert.equal(resolved.questionWord, 'which');
assert.equal(resolved.intention, 'choice');
assert.equal(resolved.question.en, 'Which cheese should we choose?');
assert.equal(resolved.choiceContext.focusVocabulary, 'cheese');
assert.deepStrictEqual(
  resolved.choiceContext.canonicalCandidates.map(candidate => candidate.id),
  ['fresh-mild-cheese', 'aged-strong-cheese']
);

assert.equal(
  source.resolve(
    { decision: { skill: 'which.use.pronoun', experienceId: 'shopping-for-dinner' } },
    whichSkill,
    experiences
  ),
  null,
  'Skill definition must exactly match the Session-owned Skill'
);

assert.equal(
  source.resolve(
    { decision: { skill: 'which.use.determiner', experienceId: 'preparing-dinner' } },
    whichSkill,
    experiences
  ),
  null,
  'Experience without an exact matching Choice context must WAIT'
);

assert.equal(
  source.resolve(
    { decision: { skill: 'which.use.determiner', experienceId: 'shopping-for-dinner' } },
    Object.assign({}, whichSkill, { form: 'what' }),
    experiences
  ),
  null,
  'mismatched canonical Skill form must not borrow another question'
);

const ambiguousExperiences = JSON.parse(JSON.stringify(experiences));
const shopping = ambiguousExperiences.find(item => item.id === 'shopping-for-dinner');
shopping.thinkingMind.push(JSON.parse(JSON.stringify(
  shopping.thinkingMind.find(item => item.questionWord === 'which')
)));

assert.equal(
  source.resolve(session, whichSkill, ambiguousExperiences),
  null,
  'multiple exact Choice contexts must fail closed rather than guess'
);

assert.equal(source.resolve(null, whichSkill, experiences), null);
assert.equal(source.resolve(session, null, experiences), null);
assert.equal(source.resolve(session, whichSkill, null), null);

console.log(
  'Adaptive Choice Context Source: PASS — Session owns Skill/Experience; canonical Skill definition grounds one exact Choice context; missing, mismatched, or ambiguous inputs WAIT.'
);
