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
function agreementKey(subject) { return `${subject.person}-${subject.number}`; }

function realize(pilot, subject, lang) {
  const subjectSurface = subject?.realizations?.[lang]?.display;
  const languageRule = pilot.verbConcept?.realizations?.[lang];
  const tense = pilot.meaningState.tense;
  const key = agreementKey(subject);
  const verbSurface = languageRule?.[tense]?.[key];

  if (!subjectSurface || !verbSurface) return null;

  return {
    subject: subjectSurface,
    verb: verbSurface,
    sentence: `${subjectSurface} ${verbSurface}`,
    subjectRequired: languageRule.subjectRequired,
    agreementKey: key
  };
}

const pilot = readJson(PILOT_PATH);
const subjects = readJson(SUBJECTS_PATH).items;
const subject = subjects.find(item => item.id === pilot.subjectRef);

if (!subject) fail(`Unknown subjectRef: ${pilot.subjectRef}`);
if (pilot.meaningState.verbConcept !== pilot.verbConcept.id) {
  fail(`MeaningState verbConcept '${pilot.meaningState.verbConcept}' does not match '${pilot.verbConcept.id}'`);
}
if (pilot.meaningState.person !== subject?.person || pilot.meaningState.number !== subject?.number) {
  fail('MeaningState person/number does not match subject concept');
}

for (const lang of LANGS) {
  const result = realize(pilot, subject, lang);
  if (!result) {
    fail(`${lang}: could not derive realization from subject features`);
    continue;
  }

  const expected = pilot.tests.expected[lang];
  if (result.sentence !== expected) {
    fail(`${lang}: expected '${expected}', derived '${result.sentence}'`);
  }

  const candidates = pilot.verbConcept.realizations[lang].candidateForms ?? [];
  for (const candidate of candidates) {
    const candidateSentence = `${result.subject} ${candidate}`;
    const shouldBeValid = candidate === result.verb;
    const listedInvalid = (pilot.tests.invalid[lang] ?? []).includes(candidateSentence);

    if (!shouldBeValid && !listedInvalid) {
      fail(`${lang}: non-agreeing candidate '${candidateSentence}' is not documented as invalid`);
    }
    if (shouldBeValid && listedInvalid) {
      fail(`${lang}: agreeing candidate '${candidateSentence}' is incorrectly invalid`);
    }
  }

  console.log(`${lang.toUpperCase()}: ${result.sentence} — ${result.agreementKey} → ${result.verb}`);
}

console.log('');
if (failures.length) {
  console.log(`FIX — ${failures.length} issue(s):`);
  failures.forEach((message, index) => console.log(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('PASS — Pronoun ↔ Verb concordance is derived from grammatical features for EN/ES/PT.');
