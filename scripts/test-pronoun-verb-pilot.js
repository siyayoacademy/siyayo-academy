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

function licensedAgreementKeys(languageRule, tense, candidate) {
  return Object.entries(languageRule?.[tense] ?? {})
    .filter(([, surface]) => surface === candidate)
    .map(([agreementKey]) => agreementKey);
}

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
    semanticPerson: subject.person,
    semanticNumber: subject.number,
    agreementKey
  };
}

function validateCandidate(pilot, subject, lang, candidate) {
  const result = realize(pilot, subject, lang);
  if (!result) return null;

  const languageRule = pilot.verbConcept.realizations[lang];
  const tense = pilot.meaningState.tense;
  const candidateAgreementKeys = licensedAgreementKeys(languageRule, tense, candidate);
  const valid = candidateAgreementKeys.includes(result.agreementKey);

  return {
    valid,
    status: valid ? 'VALID' : 'INVALID',
    reason: {
      code: valid ? 'AGREEMENT_MATCH' : 'AGREEMENT_MISMATCH',
      language: lang,
      subject: result.subject,
      candidate,
      semanticFeatures: {
        person: result.semanticPerson,
        number: result.semanticNumber
      },
      requiredAgreement: result.agreementKey,
      candidateAgreement: candidateAgreementKeys,
      expectedForm: result.verb,
      tense,
      verbConcept: pilot.verbConcept.id
    }
  };
}

function explain(reason) {
  if (reason.code === 'AGREEMENT_MATCH') {
    return `${reason.subject} requires ${reason.requiredAgreement}; '${reason.candidate}' is licensed for that agreement.`;
  }

  const licensed = reason.candidateAgreement.length
    ? reason.candidateAgreement.join(' or ')
    : 'no agreement pattern in the current rule set';

  return `${reason.subject} requires ${reason.requiredAgreement}; '${reason.candidate}' is licensed for ${licensed}. Expected '${reason.expectedForm}'.`;
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
    const evaluations = candidates.map(candidate => validateCandidate(pilot, subject, lang, candidate));
    const validCandidates = evaluations.filter(evaluation => evaluation?.valid);

    if (validCandidates.length !== 1) {
      fail(`${testCase.id}/${lang}: expected exactly one valid verb candidate, found ${validCandidates.length}`);
    }

    for (const evaluation of evaluations) {
      if (!evaluation) continue;
      console.log(`  ${lang.toUpperCase()} ${result.subject} → ${evaluation.reason.candidate}: ${evaluation.status}`);
      console.log(`    WHY: ${explain(evaluation.reason)}`);
    }

    console.log(`  ${lang.toUpperCase()} RESULT: ${result.sentence} [semantic=${result.semanticPerson}-${result.semanticNumber}; agreement=${result.agreementKey}]`);
  }

  console.log('');
}

if (failures.length) {
  console.log(`FIX — ${failures.length} issue(s):`);
  failures.forEach((message, index) => console.log(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('PASS — concordance decisions now carry structured WHY evidence for EN/ES/PT singular subjects.');
