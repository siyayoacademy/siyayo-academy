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

function semanticAgreementKey(subject) {
  return `${subject.person}-${subject.number}`;
}

function realize(pilot, subject, lang) {
  const subjectSurface = subject?.realizations?.[lang]?.display;
  const languageRule = pilot.verbConcept?.realizations?.[lang];
  const semanticKey = semanticAgreementKey(subject);
  const agreementKey = languageRule?.agreementProfile?.[subject.id];
  const verbSurface = languageRule?.[pilot.meaningState.tense]?.[agreementKey];

  if (!subjectSurface || !agreementKey || !verbSurface) return null;

  return {
    subject: subjectSurface,
    verb: verbSurface,
    sentence: `${subjectSurface} ${verbSurface}`,
    semanticPerson: subject.person,
    semanticNumber: subject.number,
    semanticAgreementKey: semanticKey,
    agreementKey,
    agreementMappingType: semanticKey === agreementKey ? 'DIRECT' : 'REMAPPED'
  };
}

function realizeOrder(baseRealization, order, punctuation = '') {
  const slots = {
    subject: baseRealization.subject,
    verb: baseRealization.verb
  };

  const tokens = order.map(slot => slots[slot]);
  if (tokens.some(token => !token)) return null;

  return `${tokens.join(' ')}${punctuation}`;
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
      semanticAgreement: result.semanticAgreementKey,
      requiredAgreement: result.agreementKey,
      agreementMappingType: result.agreementMappingType,
      isAgreementRemapped: result.agreementMappingType === 'REMAPPED',
      candidateAgreement: candidateAgreementKeys,
      isSyncretic: candidateAgreementKeys.length > 1,
      expectedForm: result.verb,
      tense,
      verbConcept: pilot.verbConcept.id
    }
  };
}

function explain(reason) {
  const licensed = reason.candidateAgreement.length
    ? reason.candidateAgreement.join(', ')
    : 'no agreement pattern in the current rule set';

  const remapping = reason.isAgreementRemapped
    ? ` Semantic agreement is ${reason.semanticAgreement}, but this language maps it to morphological ${reason.requiredAgreement}.`
    : '';

  if (reason.code === 'AGREEMENT_MATCH') {
    const syncretism = reason.isSyncretic
      ? ` The form '${reason.candidate}' is syncretic: it is licensed for ${licensed}; here '${reason.subject}' selects ${reason.requiredAgreement}.`
      : '';

    return `${reason.subject} requires ${reason.requiredAgreement}; '${reason.candidate}' is licensed for that agreement.${remapping}${syncretism}`;
  }

  const syncretism = reason.isSyncretic
    ? ` The form '${reason.candidate}' is syncretic across ${licensed}, but none matches the required agreement here.`
    : '';

  return `${reason.subject} requires ${reason.requiredAgreement}; '${reason.candidate}' is licensed for ${licensed}. Expected '${reason.expectedForm}'.${remapping}${syncretism}`;
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

    console.log(`  ${lang.toUpperCase()} RESULT: ${result.sentence} [semantic=${result.semanticAgreementKey}; agreement=${result.agreementKey}; mapping=${result.agreementMappingType}]`);
  }

  console.log('');
}

if (pilot.orderPilot) {
  const orderSubject = subjects.find(item => item.id === pilot.orderPilot.subjectRef);

  if (!orderSubject) {
    fail(`orderPilot: unknown subjectRef '${pilot.orderPilot.subjectRef}'`);
  } else {
    const lang = 'en';
    const base = realize(pilot, orderSubject, lang);

    if (!base) {
      fail('orderPilot/en: could not derive base realization');
    } else {
      const statementRule = pilot.orderPilot.statement?.[lang];
      const questionRule = pilot.orderPilot.question?.[lang];

      const statement = statementRule
        ? realizeOrder(base, statementRule.order)
        : null;

      const question = questionRule
        ? realizeOrder(base, questionRule.order, '?')
        : null;

      if (!statementRule || !statement) {
        fail('orderPilot/en: statement order could not be realized');
      } else if (statement !== statementRule.expected) {
        fail(`orderPilot/en statement: expected '${statementRule.expected}', derived '${statement}'`);
      }

      if (!questionRule || !question) {
        fail('orderPilot/en: question order could not be realized');
      } else if (question !== questionRule.expected) {
        fail(`orderPilot/en question: expected '${questionRule.expected}', derived '${question}'`);
      }

      if (statement && question) {
        console.log('ORDER PILOT:');
        console.log(`  RELATION: ${pilot.orderPilot.relation}`);
        console.log(`  STATEMENT (${pilot.orderPilot.statement.speechAct}): ${statement}`);
        console.log(`  QUESTION (${pilot.orderPilot.question.speechAct}): ${question}`);
        console.log(`  AGREEMENT STAYS: ${base.subject} ↔ ${base.verb} [${base.agreementKey}]`);
        console.log('  PRINCIPLE: RELATION ≠ ORDER');
        console.log('');
      }
    }
  }
}

if (failures.length) {
  console.log(`FIX — ${failures.length} issue(s):`);
  failures.forEach((message, index) => console.log(`${index + 1}. ${message}`));
  process.exit(1);
}

console.log('PASS — concordance WHY and the EN order pilot confirm that grammatical relation can remain stable while speech act changes surface order.');
