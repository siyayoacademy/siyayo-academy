#!/usr/bin/env node

const assert = require('node:assert/strict');
const Sensor = require('../js/adaptive-determiner-use-transfer-probe-support-sensor.js');

const sensor = Sensor.create();
const event = Object.freeze({
  observed: true,
  actor: 'learner',
  source: 'determiner-use-transfer-probe-select',
  occurrenceId: 'determiner-use-transfer-probe-select:1',
  choice: 'carrots',
  fromExperienceId: 'shopping-for-dinner',
  experienceId: 'preparing-dinner',
  dimension: 'determiner-use',
  mode: 'transfer',
  targetForm: 'which',
  targetNoun: 'carrots'
});

assert.equal(
  sensor.support(event),
  'none',
  'direct transfer selection begins with no observed support'
);

assert.equal(
  sensor.observe({
    type: 'determiner-use-transfer-probe-support',
    support: 'hint',
    occurrenceId: 'determiner-use-transfer-probe-select:1'
  }),
  'hint'
);
assert.equal(sensor.support(event), 'hint');

const otherTransferOccurrence = {
  ...event,
  occurrenceId: 'determiner-use-transfer-probe-select:2'
};
assert.equal(
  sensor.support(otherTransferOccurrence),
  'none',
  'support must not leak across transfer occurrences'
);

const localOccurrence = {
  ...event,
  source: 'determiner-use-probe-select',
  occurrenceId: 'determiner-use-probe-select:1',
  mode: undefined
};
assert.equal(
  sensor.support(localOccurrence),
  'none',
  'transfer support must not leak into local determiner-use attempts'
);

assert.equal(
  sensor.observe({
    type: 'determiner-use-transfer-probe-support',
    support: 'audio',
    occurrenceId: ''
  }),
  null,
  'ungrounded transfer support observation must fail closed'
);

assert.equal(
  sensor.observe({
    type: 'determiner-use-probe-support',
    support: 'hint',
    occurrenceId: 'determiner-use-transfer-probe-select:1'
  }),
  null,
  'local support channels must not contaminate transfer support'
);

assert.equal(sensor.reset(), true);
assert.equal(sensor.support(event), 'none');

console.log(
  'Adaptive determiner-use transfer probe support sensor: PASS — support is transfer-occurrence-scoped, defaults to none, and never leaks into local or sibling attempts.'
);
