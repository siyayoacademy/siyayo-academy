#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const corpus = JSON.parse(fs.readFileSync(path.join(root, 'data/learning/experience-seeds.json'), 'utf8'));
const shopping = corpus.items.find(item => item.id === 'shopping-for-dinner');
for (const word of ['why', 'where', 'what']) {
const question = shopping.thinkingMind.find(item => item.questionWord === word);
assert.ok(question && !question.assessmentTarget, `Exploratory ${word} must not create an assessment target`);
for (const tense of ['present', 'past', 'future']) {
  for (const form of ['affirmative', 'negative', 'interrogative']) {
    const turn = question.dialogueForms?.[tense]?.[form];
    assert.ok(turn, `Missing ${tense}/${form} dialogue turn`);
    for (const lang of ['en', 'es', 'pt']) {
      assert.ok(turn.question?.[lang]?.trim().endsWith('?'), `Missing question: ${tense}/${form}/${lang}`);
      assert.ok(turn.response?.[lang]?.trim(), `Missing response: ${tense}/${form}/${lang}`);
      assert.notEqual(turn.question[lang], turn.response[lang], 'Question and response must be distinct');
    }
  }
}
}
const runtime = fs.readFileSync(path.join(root, 'js/verb-explorer.js'), 'utf8');
assert.ok(runtime.includes('question.dialogueForms?.[experienceTense]?.[experienceForm]'), 'Lines must select the declared tense and form');
assert.ok(runtime.includes('if(!turn)return[]'), 'Missing dialogue turn must remain absent');
console.log('PASS — S1 WHY, WHERE and WHAT provide 81 grounded question/response pairs without assessment authority.');
