#!/usr/bin/env node
const assert = require('node:assert/strict');
const sensor = require('../js/choice-mode-sensor.js');

const context = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 2,
  experienceChoiceCandidate: 'fresh-mild-cheese'
};

assert.equal(sensor.observe({
  type: 'sentence-built',
  canonicalCandidate: true,
  systemStructure: true
}), null);

assert.equal(sensor.observe({
  type: 'sentence-built',
  canonicalCandidate: true,
  systemStructure: true,
  context
}), 'controlled-production');

console.log('Choice mode context scope: PASS — controlled-production requires the grounded Experience + Language + Question + Choice context.');
