#!/usr/bin/env node
// JAGUAR QW S1–S4: read-only coverage census. No evidence, credits or deployment.
const fs = require('node:fs');
const assert = require('node:assert/strict');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const capabilities = read('data/learning/question-word-capabilities.json').canonical;
const experiences = read('data/learning/experience-seeds.json').items;
const languages = ['en', 'es', 'pt'];
assert.equal(capabilities.length, 14, 'Canonical QW inventory changed: review required');
assert.equal(experiences.length, 4, 'S1–S4 inventory changed: review required');
const canonical = capabilities.map(x => x.questionWord);
const rows = [];
for (const [i, exp] of experiences.entries()) {
  const questions = exp.thinkingMind || [];
  for (const qw of canonical) {
    const matched = questions.filter(x => x.questionWord === qw);
    assert.ok(matched.length <= 1, 'Duplicate QW opportunity: ' + exp.id + '/' + qw);
    const entry = matched[0];
    const missingLanguages = entry ? languages.filter(lang => !entry.question?.[lang]) : languages;
    rows.push({
      experience: 'S' + (i + 1), experienceId: exp.id, questionWord: qw,
      opportunity: !!entry, questionTrilingual: !!entry && missingLanguages.length === 0,
      missingLanguages: entry ? missingLanguages : [],
      dialogueForms: !!entry?.dialogueForms,
      assessmentTarget: !!entry?.assessmentTarget,
      assessmentResumeTarget: !!entry?.assessmentResumeTarget
    });
  }
}
assert.equal(rows.length, 56);
const summary = {
  canonicalQWs: canonical.length, experiences: experiences.length,
  possibleCells: rows.length, presentOpportunities: rows.filter(x => x.opportunity).length,
  trilingualOpportunities: rows.filter(x => x.questionTrilingual).length,
  explicitAssessmentTargets: rows.filter(x => x.assessmentTarget).length,
  missingOpportunityCells: rows.filter(x => !x.opportunity).length
};
process.stdout.write(JSON.stringify({kind: 'OBSERVATIONAL_ONLY_NOT_EVALUATION', summary, rows}, null, 2) + '\n');
// Coverage gaps are not fatal: creating assessment authority from presence is prohibited.
