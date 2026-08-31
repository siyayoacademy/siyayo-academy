#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PILOT_PATH = path.join(ROOT, 'data/grammar/pronoun-verb-pilot.json');
const SUBJECTS_PATH = path.join(ROOT, 'data/grammar/subjects.json');
const LANGS = ['en', 'es', 'pt'];
const failures = [];

function fail(message) { failures.push(message); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }

function realize(pilot, subject, lang) {
  const subjectSurface = subject?.realizations?.[lang]?.display;
  const languageRule = pilot.verbConcept?.realizations?.[lang];
  const agreementKey = languageRule?.agreementProfile?.[subject.id];
  const verbSurface = languageRule?.[pilot.meaningState.tense]?.[agreementKey];

  if (!subjectSurface || !agreementKey || !verbSurface) return null;

  return {
    subject: subjectSurface,
    verb: verbSurface,
    sentence: `${subjectSurface} ${verbSurface}`,
    agreementKey
  };
}

const pilot = readJson(PILOT_PATH);
const subjects = readJson(SUBJECTS_PATH).items;

if (pilot.meaningState.verbConcept !== pilot.verbConcept.id) {
  fail(`MeaningState verbConcept '${pilot.meaningState.verbConcept}' does not match '${pilot.verbConcept.id}'`);
}

for (const testCase of pilot.testCases) {
  const subject = subjects.find(item => item.id === testCase.subjectRef);
  if (!subject) {
    fail(`${testCase.id}: unknown subjectRef '${testCase.subjectRef}'`);
    continue;
  }

  console.log(`CASE: ${testCase.id}`);

  for (const lang of LANGS) {
    const result = realize(pilot, subject, lang);
    if (!result) {
      fail(`${testCase.id}/${lang}: could not derive realization`);
      continue;
    }

    const expected = testCase.expected[lang];
    if (result.sentence !== expected) {
      fail(`${testCase.id}/${lang}: expected '${expected}', derived '${result.sentence}'`);
    }

    const candidates = pilot.verbConcept.realizations[lang].candidateForms ?? [];
    const validCandidates = candidates.filter(candidate => candidate === result.verb);

    if (validCandidates.length !== 1) {
      fail(`${testCase.id}/${lang}: expected exactly one valid verb candidate, found ${validCandidates.length}`);
    }

    for (const candidate of candidates) {
      const status = candidate === result.verb ? 'VALID' : 'INVALID';
      console.log(`  ${lang.toUpperCase()} ${result.subject} → ${candidate}: ${status}`);
    }

    console.log(`  ${lang.toUpperCase()} RESULT: ${result.sentence} [${result.agreementKey}]`);
  }

  console.log('');
}

if (failures.length) {
  console.log(`FIX — ${failures.length} issue(s):`);
  failures.forEach((message, index) => console.log(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('PASS — first, second and third singular Pronoun ↔ Verb concordance is derived independently for EN/ES/PT.');
