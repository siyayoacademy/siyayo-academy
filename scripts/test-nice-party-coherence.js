#!/usr/bin/env node

const assert = require('node:assert/strict');
const corpus = require('../data/learning/experience-seeds.json');

const items = (corpus.items || []).filter(item => item.tags?.includes('nice-party'));
const expectedIds = [
  'shopping-for-dinner',
  'preparing-dinner',
  'having-dinner',
  'after-dinner-conversation'
];
const expectedLines = {
  describing: 'red',
  narrating: 'yellow',
  debating: 'green',
  concluding: 'blue'
};
const languages = ['en', 'es', 'pt'];

assert.deepEqual(items.map(item => item.id), expectedIds, 'Nice Party must preserve the canonical four-experience arc');

const questionCoverage = new Set();
for (const experience of items) {
  assert.equal(experience.tags.includes('toroidal'), true, `${experience.id} must remain toroidal`);
  assert.equal(experience.tags.includes('questions'), true, `${experience.id} must remain question-driven`);
  assert.equal(experience.tags.includes('perspective'), true, `${experience.id} must preserve perspective learning`);

  for (const [perspective, line] of Object.entries(expectedLines)) {
    assert.equal(experience.perspectives?.[perspective]?.line, line, `${experience.id} ${perspective} must stay on ${line}`);
    for (const language of languages) {
      assert.ok(experience.perspectives?.[perspective]?.examples?.[language]?.length, `${experience.id} ${perspective} requires ${language} evidence`);
    }
  }

  const localQuestions = new Set();
  for (const question of experience.thinkingMind || []) {
    assert.ok(question.questionWord, `${experience.id} questionWord is required`);
    assert.equal(localQuestions.has(question.questionWord), false, `${experience.id} must not duplicate ${question.questionWord}`);
    localQuestions.add(question.questionWord);
    questionCoverage.add(question.questionWord);
    for (const language of languages) {
      assert.ok(question.question?.[language], `${experience.id} ${question.questionWord} requires ${language}`);
    }
  }
}

for (const required of ['what', 'where', 'when', 'how', 'why', 'who', 'which', 'how-much']) {
  assert.equal(questionCoverage.has(required), true, `Nice Party must cover ${required}`);
}

for (let index = 0; index < items.length; index += 1) {
  const current = items[index];
  const expectedNext = items[(index + 1) % items.length].id;
  assert.equal(current.toroidalNext?.nextExperience, expectedNext, `${current.id} must hand off to ${expectedNext}`);
}

console.log('PASS — Nice Party keeps its four-stage toroidal arc, trilingual questions and spectral perspective lines coherent.');
