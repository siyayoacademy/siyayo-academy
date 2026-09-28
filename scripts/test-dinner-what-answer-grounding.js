#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const items = JSON.parse(fs.readFileSync(path.join(root, 'data/learning/experience-seeds.json'), 'utf8')).items;
const nouns = JSON.parse(fs.readFileSync(path.join(root, 'data/lexicon/nouns/nouns.json'), 'utf8')).items;
const nounById = new Map(nouns.map(noun => [noun.id, noun]));
const whatSkill = JSON.parse(fs.readFileSync(path.join(root, 'data/learning/skills/what.json'), 'utf8'));
const greenPolicy = fs.readFileSync(path.join(root, 'js/green-pass-authority-policy.js'), 'utf8');
const byId = new Map(items.map(item => [item.id, item]));
const shopping = byId.get('shopping-for-dinner');
const preparing = byId.get('preparing-dinner');
const having = byId.get('having-dinner');
assert.equal(shopping.toroidalNext.nextExperience, preparing.id);
assert.equal(preparing.toroidalNext.nextExperience, having.id);

function what(entry) {
  const questions = entry.thinkingMind.filter(item => item.questionWord === 'what');
  assert.equal(questions.length, 1, `${entry.id} needs exactly one WHAT question`);
  const question = questions[0];
  assert.equal(question.intention, 'thing-or-action');
  assert.ok(question.answerGrounding);
  const {context, acceptedVocabularyIds} = question.answerGrounding;
  assert.ok(acceptedVocabularyIds.length > 0);
  assert.equal(new Set(acceptedVocabularyIds).size, acceptedVocabularyIds.length);
  for (const language of ['en', 'es', 'pt']) {
    assert.ok(question.question[language]);
    assert.ok(context[language]);
  }
  for (const id of acceptedVocabularyIds) {
    assert.ok(entry.links.vocabulary.includes(id), `${id} absent from ${entry.id}`);
    const noun = nounById.get(id);
    assert.ok(noun, `${id} absent from canonical nouns`);
    for (const language of ['en', 'es', 'pt']) assert.ok(noun.translations[language]);
  }
  if (entry.id === 'preparing-dinner') {
    assert.deepEqual(question.assessmentTarget, {
      skill: 'what.use.object-question', definitionPath: 'data/learning/skills/what.json'
    });
  } else {
    assert.equal(question.assessmentTarget, undefined, 'S3 transfer cannot start a new WHAT session');
  }
  return acceptedVocabularyIds;
}

const vegetables = what(preparing);
assert.ok(vegetables.length > 1, 'open WHAT question must accept more than one vegetable');
for (const id of vegetables) assert.ok(nounById.get(id).semanticTags.includes('vegetable'));
assert.deepEqual(what(having), ['salmon']);

const transfer = preparing.thinkingMind.filter(item => item.questionWord === 'which');
assert.equal(transfer.length, 1);
assert.deepEqual(transfer[0].question, {
  en: 'Which carrots should we cook first?',
  es: '¿Qué zanahorias deberíamos cocinar primero?',
  pt: 'Quais cenouras devemos cozinhar primeiro?'
});
assert.equal(transfer[0].answerGrounding, undefined, 'S1 transfer remains a separate assessment');

assert.equal(whatSkill.id, 'what.use.object-question');
assert.deepEqual(whatSkill.passContract.requires, [
  {dimension: 'question-function', result: 'pass'},
  {dimension: 'object-answer', result: 'pass', support: 'none'},
  {dimension: 'object-answer', result: 'pass', mode: 'transfer', support: 'none'}
]);
assert.ok(!greenPolicy.includes("'what.use.object-question'"), 'WHAT cannot become a Green authority without observed probes');

console.log('PASS — S2 and S3 WHAT answer grounding is trilingual, canonical and separate from S1 WHICH transfer.');
