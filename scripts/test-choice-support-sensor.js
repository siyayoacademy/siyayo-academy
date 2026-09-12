#!/usr/bin/env node
const assert = require('node:assert/strict');
const Sensor = require('../js/choice-support-sensor.js');

const sensor = Sensor.create();
assert.equal(sensor.support(), 'none');
assert.equal(sensor.observe({ type: 'choice-select' }), 'none');
assert.equal(sensor.observe({ type: 'choice-audio' }), 'audio');
assert.equal(sensor.support(), 'audio');
assert.equal(sensor.observe({ type: 'choice-select' }), 'audio');
assert.equal(sensor.reset(), 'none');
assert.equal(sensor.support(), 'none');

console.log('Choice support sensor: PASS — selection alone=none, observed audio=audio, reset=none.');
