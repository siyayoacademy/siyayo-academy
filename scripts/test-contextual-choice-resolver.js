#!/usr/bin/env node node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const { LABELS, rankCandidates, resolveChoice } = require('../js/contextual-choice-resolver.js');

const ROOT = path.resolve(__dirname, '..');
const experiences = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'data/learning/experience-seeds.json'), 'utf8')
);
const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const which = shopping?.thinkingMind?.find(question =>
  question.intention === 'choice' && question.questionWord === 'which'
);

assert.ok(which?.choiceContext, '3A choiceContext must exist');

const context = which.choiceContext;
const ranking = rankCandidates(context);
assert.deepEqual(
  ranking.map(candidate => candidate.id),
  ['fresh-mild-cheese', 'aged-strong-cheese'],
  'contextual ranking must follow preferred-trait evidence'
);
assert.equal(ranking[0].score, 4, 'preferred cheese must match all four contextual traits');
assert.equal(ranking[1].score, 0, 'contrasting cheese must not match preferred traits');

for (const language of ['en', 'es', 'pt']) {
  const result = resolveChoice(context, 'fresh-mild-cheese', language);
  assert.equal(result.canonicalForm.label, LABELS[language].canonicalForm);
  assert.equal(result.contextualResponse.label, LABELS[language].contextualResponse);
  assert.equal(result.canonicalForm.valid, true);
  assert.equal(result.contextualResponse.status, LABELS[language].preferred);
  assert.equal(result.contextualResponse.score, 4);
  assert.equal(result.contextualResponse.possibleScore, 4);
  assert.equal(result.canonicalForm.response, context.canonicalCandidates[0].response[language]);
}

const possible = resolveChoice(context, 'aged-strong-cheese', 'pt');
assert.equal(possible.canonicalForm.valid, true, 'the lower-fit alternative remains canonical');
assert.equal(possible.contextualResponse.status, 'Contextualmente possível');
assert.equal(possible.contextualResponse.score, 0);

const unknown = resolveChoice(context, 'missing-cheese', 'es');
assert.equal(unknown.canonicalForm.valid, false);
assert.equal(unknown.canonicalForm.response, null);
assert.equal(unknown.contextualResponse.available, false);
assert.equal(unknown.contextualResponse.status, 'No encontrado entre los candidatos canónicos');

const fallback = resolveChoice(context, 'fresh-mild-cheese', 'xx');
assert.equal(fallback.language, 'en');
assert.equal(fallback.canonicalForm.label, 'Canonical Form');
assert.equal(fallback.canonicalForm.response, context.canonicalCandidates[0].response.en);

console.log('PASS — 3B resolver separates canonical validity from contextual fit.');
console.log('PASS — EN/ES/PT labels and deterministic ranking are correct.');
console.log('PASS — lower-fit canonical and unknown-candidate states remain distinct.');
