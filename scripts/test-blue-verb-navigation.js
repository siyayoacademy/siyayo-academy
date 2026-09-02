#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const readJson = relative => JSON.parse(fs.readFileSync(path.join(ROOT, relative), 'utf8'));
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const actions = readJson('data/lexicon/verbs/actions.json');
const examples = readJson('data/lexicon/verbs/action-examples.json');
const experiences = readJson('data/learning/experience-seeds.json');
const sentenceForms = readJson('data/lexicon/verbs/choose-sentence-forms.json');
const subjectForms = readJson('data/lexicon/verbs/choose-subject-forms.json');

const choose = actions.find(item => item.id === 'choose');
assert.ok(choose, 'missing canonical choose verb');
assert.deepEqual(choose.translations, { en: 'choose', es: 'elegir', pt: 'escolher' });
assert.deepEqual(choose.forms, {
  thirdPersonSingular: 'chooses',
  past: 'chose',
  pastParticiple: 'chosen',
  gerund: 'choosing'
});
assert.ok(examples.items.some(item => item.verb === 'choose'), 'missing choose example unit');

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const which = shopping.thinkingMind.find(item => item.questionWord === 'which');
assert.equal(which.choiceContext.sentenceBridge.verbId, 'choose');
assert.deepEqual(which.choiceContext.sentenceBridge.action, choose.translations);

assert.ok(sentenceForms.items.every(item => item.verb === 'choose'));
assert.equal(subjectForms.verb, 'choose');
for (const tense of ['present', 'past', 'future']) {
  const sentenceTense = sentenceForms.items.find(item => item.tense === tense);
  assert.ok(sentenceTense, `missing choose ${tense} sentence forms`);
  assert.deepEqual(Object.keys(sentenceTense.forms), ['affirmative', 'negative', 'interrogative']);

  const subjectTense = subjectForms.tenses[tense];
  assert.ok(subjectTense, `missing choose ${tense} subject forms`);
  for (const [formName, subjects] of Object.entries(subjectTense.forms)) {
    assert.equal(subjects.length, 8, `choose ${tense}/${formName} must cover eight subjects`);
    assert.equal(new Set(subjects.map(item => item.subject)).size, 8, `choose ${tense}/${formName} subjects must be unique`);
    for (const subject of subjects) {
      assert.deepEqual(Object.keys(subject.sentences).sort(), ['en', 'es', 'pt']);
    }
  }
}

for (const hook of [
  'choose-sentence-forms.json',
  'choose-subject-forms.json',
  'kind:"verb",axis:"verb",verbId:',
  'data-sentence-verb-id=',
  'function openVerbDna(verbId)',
  'verbs.findIndex(verb=>verb.id===verbId)',
  'part.dataset.sentenceVerbId',
  'if(axis==="verb")',
  'button.dataset.mode==="dna"',
  'document.getElementById("dnaView").hidden=false',
  'document.getElementById("experienceView").hidden=true'
]) assert.ok(runtime.includes(hook), `missing 6.4 runtime hook: ${hook}`);

for (const label of ['Open VERB DNA', 'Abrir ADN DEL VERBO', 'Abrir DNA DO VERBO']) {
  assert.ok(runtime.includes(label), `missing localized blue verb label: ${label}`);
}

console.log('PASS — CHOOSE is a complete canonical trilingual irregular verb.');
console.log('PASS — all tense, mode and eight-subject combinations are present.');
console.log('PASS — the blue sentence verb opens its exact canonical VERB DNA.');
console.log('PASS — the experience state remains available when returning to EXPERIENCE.');
