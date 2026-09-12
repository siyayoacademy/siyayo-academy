#!/usr/bin/env node
const assert = require('node:assert/strict');
const Sensor = require('../js/choice-support-sensor.js');

const sensor = Sensor.create();
const context = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 2,
  experienceChoiceCandidate: 'fresh-mild-cheese'
};

assert.equal(sensor.support(), 'none');
assert.equal(sensor.observe({ type: 'choice-select', context }), 'none');
assert.equal(sensor.observe({ type: 'choice-audio' }), 'none');
assert.equal(sensor.observe({ type: 'choice-audio', context }), 'audio');
assert.equal(sensor.support(context), 'audio');
assert.equal(sensor.observe({ type: 'choice-select', context }), 'audio');
assert.equal(sensor.reset(), 'none');
assert.equal(sensor.support(context), 'none');

console.log('Choice support sensor: PASS — ungrounded audio=none, grounded audio=audio, selection alone=none, reset=none.');
