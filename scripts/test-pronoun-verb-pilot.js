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

const pilot = readJson(PILOT_PATH);
const subjects = readJson(SUBJECTS_PATH).items;
const subject = subjects.find(item => item.id === pilot.subjectRef);

if (!subject) fail(`Unknown subjectRef: ${pilot.subjectRef}`);

for (const lang of LANGS) {
  const realization = pilot.realizations?.[lang];
  if (!realization) {
    fail(`Missing ${lang} realization`);
    continue;
  }

  const canonicalSubject = subject?.realizations?.[lang]?.display;
  if (realization.subject !== canonicalSubject) {
    fail(`${lang}: subject '${realization.subject}' does not match canonical '${canonicalSubject}'`);
  }

  const built = realization.tokens.join(' ');
  const expected = pilot.tests[0].expected[lang];
  if (built !== expected) fail(`${lang}: expected '${expected}', built '${built}'`);

  const invalid = pilot.tests[1].invalid[lang] ?? [];
  if (invalid.includes(built)) fail(`${lang}: valid realization is listed as invalid`);
}

if (pilot.meaningState.person !== subject?.person || pilot.meaningState.number !== subject?.number) {
  fail('MeaningState person/number does not match subject concept');
}

console.log('SIYAYO Pronoun ↔ Verb Pilot');
console.log('============================');
console.log(`Meaning: ${pilot.meaningState.intent}`);
for (const lang of LANGS) console.log(`${lang.toUpperCase()}: ${pilot.realizations[lang].tokens.join(' ')}`);
console.log('');

if (failures.length) {
  console.log(`FIX — ${failures.length} issue(s):`);
  failures.forEach((message, index) => console.log(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('PASS — shared Meaning State and independent EN/ES/PT realizations agree with the canonical subject corpus.');
