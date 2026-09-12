#!/usr/bin/env node
const assert = require('assert/strict');
const sensor = require('../js/choice-mode-sensor.js');

assert.equal(sensor.observe(), null);
assert.equal(sensor.observe({type:'choice-select'}), null);
assert.equal(sensor.observe({type:'sentence-built'}), null);
assert.equal(sensor.observe({type:'sentence-built',canonicalCandidate:true}), null);
assert.equal(sensor.observe({type:'sentence-built',canonicalCandidate:true,systemStructure:true}), 'controlled-production');

console.log('Choice mode sensor: PASS — controlled production requires sentence-built + canonical candidate + system structure.');
