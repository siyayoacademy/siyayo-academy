#!/usr/bin/env node

const assert = require('node:assert/strict');
const Sensor = require('../js/adaptive-determiner-use-probe-support-sensor.js');

const sensor = Sensor.create();
const event = Object.freeze({
  observed: true,
  actor: 'learner',
  source: 'determiner-use-probe-select',
  occurrenceId: 'determiner-use-probe-select:1',
  choice: 'cheese',
  experienceId: 'shopping-for-dinner',
  dimension: 'determiner-use',
  targetForm: 'which',
  targetNoun: 'cheese'
});

assert.equal(
  sensor.support(event),
  'none',
  'direct determiner-use selection begins with no observed support'
);

assert.equal(
  sensor.observe({
    type: 'determiner-use-probe-support',
    support: 'hint',
    occurrenceId: 'determiner-use-probe-select:1'
  }),
  'hint'
);
assert.equal(sensor.support(event), 'hint');

const otherOccurrence = {
  ...event,
  occurrenceId: 'determiner-use-probe-select:2'
};
assert.equal(
  sensor.support(otherOccurrence),
  'none',
  'support must not leak across learner occurrences'
);

assert.equal(
  sensor.observe({
    type: 'determiner-use-probe-support',
    support: 'audio',
    occurrenceId: ''
  }),
  null,
  'ungrounded support observation must fail closed'
);

assert.equal(
  sensor.observe({
    type: 'choice-audio',
    support: 'audio',
    occurrenceId: 'determiner-use-probe-select:1'
  }),
  null,
  'unrelated support channels must not contaminate determiner-use support'
);

assert.equal(sensor.reset(), true);
assert.equal(sensor.support(event), 'none');

console.log(
  'Adaptive determiner-use probe support sensor: PASS — support is occurrence-scoped, defaults to none, records only explicit grounded probe support, and does not leak across attempts.'
);
