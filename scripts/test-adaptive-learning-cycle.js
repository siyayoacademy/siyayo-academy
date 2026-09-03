#!/usr/bin/env node

const assert = require('assert/strict');
const fs = require('fs');
const path = require('path');
const AdaptiveEvidenceProfile = require('../js/adaptive-evidence-profile.js');
const AdaptiveAttemptLoop = require('../js/adaptive-attempt-loop.js');
const AdaptiveLearningCycle = require('../js/adaptive-learning-cycle.js');
const GreenPassProfile = require('../js/green-pass-profile.js');

const corpus = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/learning/experience-seeds.json'), 'utf8'));
const experiences = corpus.items;

const evidenceProfile = AdaptiveEvidenceProfile.createProfile('learner-cycle');
AdaptiveEvidenceProfile.record(evidenceProfile, {
  source: 'multilingual-contrast-verifier',
  status: 'transfer-confirmed',
  requiresReview: false,
  conflict: false,
  requiresReinforcement: true
}, {
  confirmed: true,
  language: 'pt',
  chapter: 'verbs',
  skill: 'auxiliary-be'
});

const session = AdaptiveAttemptLoop.begin(AdaptiveEvidenceProfile, evidenceProfile, {});
assert.equal(session.decision.action, 'reinforce');
assert.equal(session.decision.experienceId, 'preparing-dinner');
assert.equal(session.trace[0].event, 'experience-selected');

let greenProfile = GreenPassProfile.createProfile('learner-cycle');
const context = { experiences };

let result = AdaptiveLearningCycle.submit(greenProfile, session, {
  language: 'pt',
  chapter: 'verbs',
  skill: 'auxiliary-be',
  correct: true,
  confidence: 0.85
}, context);
greenProfile = result.greenProfile;
assert.equal(result.recommendation.action, 'continue-assessment');
assert.equal(result.advanceSelection, null);
assert.equal(result.nextContext.currentExperience, 'preparing-dinner');
assert.equal(greenProfile.bySkill['pt:verbs:auxiliary-be'].status, 'observing');
assert.equal(greenProfile.greenPass, false, 'one correct answer must never force Green Pass');

result = AdaptiveLearningCycle.submit(greenProfile, session, {
  language: 'pt',
  chapter: 'verbs',
  skill: 'auxiliary-be',
  correct: true,
  confidence: 0.85
}, context);
greenProfile = result.greenProfile;
assert.equal(greenProfile.bySkill['pt:verbs:auxiliary-be'].status, 'ready');
assert.equal(greenProfile.greenPass, true);
assert.equal(result.recommendation.action, 'advance');
assert.equal(result.advanceSelection.status, 'selected');
assert.equal(result.advanceSelection.fromExperience, 'preparing-dinner');
assert.equal(result.advanceSelection.experienceId, 'having-dinner');
assert.equal(result.advanceSelection.entryVerb, 'eat');
assert.equal(result.nextContext.currentExperience, 'having-dinner');
assert.equal(session.trace.at(-2).event, 'green-pass-evaluated');
assert.equal(session.trace.at(-2).nextAction, 'advance');
assert.equal(session.trace.at(-1).event, 'adaptive-next-selected');
assert.equal(session.trace.at(-1).fromExperience, 'preparing-dinner');
assert.equal(session.trace.at(-1).experienceId, 'having-dinner');
assert.equal(session.trace.at(-1).entryVerb, 'eat');

console.log('Adaptive learning cycle: PASS');
console.log('confirmed evidence -> experience -> Patita attempt -> Green Pass -> canonical next experience -> Patita trace');
