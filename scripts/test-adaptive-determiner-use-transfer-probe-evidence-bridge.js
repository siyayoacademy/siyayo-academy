#!/usr/bin/env node

const assert = require('node:assert/strict');
const Bridge = require('../js/adaptive-determiner-use-transfer-probe-evidence-bridge.js');
const Sensor = require('../js/adaptive-determiner-use-transfer-probe-support-sensor.js');

const sensor = Sensor.create();

const learnerEvent = Object.freeze({
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

const result = Object.freeze({
  occurrenceId: 'determiner-use-transfer-probe-select:1',
  fromExperienceId: 'shopping-for-dinner',
  experienceId: 'preparing-dinner',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  mode: 'transfer',
  targetForm: 'which',
  targetNoun: 'carrots',
  selectedAlternativeId: 'carrots',
  result: 'pass'
});

const evidence = Bridge.fromResult({
  result,
  learnerEvent,
  supportSensor: sensor
});

assert.deepEqual(evidence, {
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  result: 'pass',
  mode: 'transfer',
  support: 'none',
  context: {
    occurrenceId: 'determiner-use-transfer-probe-select:1',
    fromExperienceId: 'shopping-for-dinner',
    experienceId: 'preparing-dinner',
    targetForm: 'which',
    targetNoun: 'carrots',
    selectedAlternativeId: 'carrots'
  }
});
assert.ok(Object.isFrozen(evidence));
assert.ok(Object.isFrozen(evidence.context));

sensor.observe({
  type: 'determiner-use-transfer-probe-support',
  support: 'hint',
  occurrenceId: 'determiner-use-transfer-probe-select:1'
});

const supported = Bridge.fromResult({
  result,
  learnerEvent,
  supportSensor: sensor
});
assert.equal(supported.support, 'hint');
assert.equal(supported.mode, 'transfer');

const failResult = Object.freeze({
  ...result,
  selectedAlternativeId: 'should',
  result: 'fail'
});
const failEvidence = Bridge.fromResult({
  result: failResult,
  learnerEvent: Object.freeze({ ...learnerEvent, choice: 'should' }),
  supportSensor: Sensor.create()
});
assert.ok(failEvidence);
assert.equal(failEvidence.result, 'fail');
assert.equal(failEvidence.mode, 'transfer');
assert.equal(failEvidence.support, 'none');

assert.equal(Bridge.fromResult({}), null);
assert.equal(Bridge.fromResult({ result, learnerEvent }), null, 'support authority is required');
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent: { ...learnerEvent, occurrenceId: 'determiner-use-transfer-probe-select:2' },
    supportSensor: Sensor.create()
  }),
  null,
  'result and event must belong to the same transfer occurrence'
);
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent: { ...learnerEvent, fromExperienceId: 'preparing-dinner' },
    supportSensor: Sensor.create()
  }),
  null,
  'transfer origin Experience mismatch must fail closed'
);
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent: { ...learnerEvent, mode: 'controlled-production' },
    supportSensor: Sensor.create()
  }),
  null,
  'transfer Evidence requires explicit transfer event mode'
);
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent: { ...learnerEvent, choice: 'should' },
    supportSensor: Sensor.create()
  }),
  null,
  'selected alternative must match observed transfer learner event'
);

console.log(
  'Adaptive determiner-use transfer probe Evidence bridge: PASS — grounded transfer result plus occurrence-scoped support becomes explicit transfer Evidence without fabricating progression.'
);
