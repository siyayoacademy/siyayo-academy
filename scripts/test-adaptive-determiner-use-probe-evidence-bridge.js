#!/usr/bin/env node

const assert = require('node:assert/strict');
const Bridge = require('../js/adaptive-determiner-use-probe-evidence-bridge.js');
const Sensor = require('../js/adaptive-determiner-use-probe-support-sensor.js');

const sensor = Sensor.create();

const learnerEvent = Object.freeze({
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

const result = Object.freeze({
  occurrenceId: 'determiner-use-probe-select:1',
  experienceId: 'shopping-for-dinner',
  skill: 'which.use.determiner',
  dimension: 'determiner-use',
  targetForm: 'which',
  targetNoun: 'cheese',
  selectedAlternativeId: 'cheese',
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
  support: 'none',
  context: {
    occurrenceId: 'determiner-use-probe-select:1',
    experienceId: 'shopping-for-dinner',
    targetForm: 'which',
    targetNoun: 'cheese',
    selectedAlternativeId: 'cheese'
  }
});
assert.ok(Object.isFrozen(evidence));
assert.ok(Object.isFrozen(evidence.context));
assert.equal(
  Object.prototype.hasOwnProperty.call(evidence, 'mode'),
  false,
  'local determiner-use evidence must not fabricate transfer mode'
);

sensor.observe({
  type: 'determiner-use-probe-support',
  support: 'hint',
  occurrenceId: 'determiner-use-probe-select:1'
});

const supported = Bridge.fromResult({
  result,
  learnerEvent,
  supportSensor: sensor
});
assert.equal(supported.support, 'hint');

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
assert.equal(failEvidence.support, 'none');

assert.equal(Bridge.fromResult({}), null);
assert.equal(Bridge.fromResult({ result, learnerEvent }), null, 'support authority is required');
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent: { ...learnerEvent, occurrenceId: 'determiner-use-probe-select:2' },
    supportSensor: Sensor.create()
  }),
  null,
  'result and event must belong to the same occurrence'
);
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent: { ...learnerEvent, choice: 'should' },
    supportSensor: Sensor.create()
  }),
  null,
  'selected alternative must match the observed learner event'
);

console.log(
  'Adaptive determiner-use probe Evidence bridge: PASS — grounded probe result plus occurrence-scoped support becomes local determiner-use Evidence without fabricating transfer mode.'
);
