#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const verbs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/lexicon/verbs/actions.json'), 'utf8'));
const schema = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/schemas/verb.schema.json'), 'utf8'));
const experiences = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/learning/experience-seeds.json'), 'utf8'));

const actionEnum = schema.items?.properties?.verbFunction?.items?.enum || [];
const classEnum = schema.items?.properties?.verbClass?.items?.enum || [];
assert.ok(actionEnum.includes('action'), 'ACTION must remain a canonical verbFunction');
assert.ok(!classEnum.includes('action'), 'ACTION must not be collapsed into verbClass');

const choose = verbs.find(verb => verb.id === 'choose');
assert.ok(choose, 'canonical choose verb is required');
assert.ok(choose.verbFunction?.includes('action'), 'choose must expose ACTION through verbFunction');
assert.ok(!choose.verbClass?.includes('action'), 'choose must not encode ACTION as verbClass');

const items = experiences.items || [];
const shopping = items.find(item => item.id === 'shopping-for-dinner');
assert.ok(shopping, 'shopping-for-dinner experience is required');
const which = (shopping.thinkingMind || []).find(question => question.questionWord === 'which');
assert.ok(which?.choiceContext, 'WHICH contextual choice is required');
assert.equal(which.choiceContext.sentenceBridge?.verbId, 'choose', 'experience sentence bridge must resolve canonical choose');

const bridgedVerb = verbs.find(verb => verb.id === which.choiceContext.sentenceBridge.verbId);
assert.ok(bridgedVerb?.verbFunction?.includes('action'), 'sentence bridge must resolve to a canonical ACTION verb');
assert.equal(bridgedVerb.id, 'choose', 'ACTION bridge must preserve the canonical verb id');

console.log('PASS — 6.7 resolves the contextual Blue Verb to canonical ACTION semantics.');
console.log('PASS — ACTION remains verbFunction, independent from verbClass and regularity.');
