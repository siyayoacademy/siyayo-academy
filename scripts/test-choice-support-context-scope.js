#!/usr/bin/env node
const assert = require('node:assert/strict');
const Sensor = require('../js/choice-support-sensor.js');

const sensor = Sensor.create();
const enA = { currentExperienceId: 'shopping-for-dinner', experienceLanguage: 'en', experienceQuestion: 2, experienceChoiceCandidate: 'fresh-mild-cheese' };
const esA = { ...enA, experienceLanguage: 'es' };
const enB = { ...enA, experienceChoiceCandidate: 'aged-strong-cheese' };

assert.equal(sensor.observe({ type: 'choice-audio', context: enA }), 'audio');
assert.equal(sensor.support(enA), 'audio');
assert.equal(sensor.support(esA), 'none');
assert.equal(sensor.support(enB), 'none');

console.log('Choice support context scope: PASS — audio belongs only to the same Experience + Language + Question + Choice.');
