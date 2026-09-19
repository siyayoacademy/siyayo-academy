#!/usr/bin/env node
const assert = require('assert/strict');
const sensor = require('../js/choice-mode-sensor.js');

const context = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 2,
  experienceChoiceCandidate: 'fresh-mild-cheese'
};

assert.equal(sensor.observe(), null);
assert.equal(sensor.observe({type:'choice-select', context}), null);
assert.equal(sensor.observe({type:'sentence-built', context}), null);
assert.equal(sensor.observe({type:'sentence-built',canonicalCandidate:true, context}), null);
assert.equal(sensor.observe({type:'sentence-built',canonicalCandidate:true,systemStructure:true}), null);
assert.equal(sensor.observe({type:'sentence-built',canonicalCandidate:true,systemStructure:true, context}), 'controlled-production');

console.log('Choice mode sensor: PASS — controlled production requires sentence-built + canonical candidate + system structure + grounded context.');
