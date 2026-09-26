#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

for (const path of [
  'js/adaptive-dependency-head-probe-support-sensor.js',
  'js/adaptive-dependency-head-probe-evidence-bridge.js'
]) {
  assert.equal(
    fs.existsSync(path),
    true,
    path+' must exist before Dependency Head Probe results can become grounded Evidence'
  );
}

const Sensor = require('../js/adaptive-dependency-head-probe-support-sensor.js');
const Bridge = require('../js/adaptive-dependency-head-probe-evidence-bridge.js');
const Loop = require('../js/adaptive-attempt-loop.js');

const sensor = Sensor.create();
const session = Object.freeze({
  decision:Object.freeze({
    skill:'which.use.determiner',
    experienceId:'shopping-for-dinner'
  })
});

const learnerEvent = Object.freeze({
  observed:true,
  actor:'learner',
  relevantToWait:true,
  intent:'continue',
  type:'learner-response',
  source:'dependency-head-probe-select',
  occurrenceId:'dependency-head-probe-select:1',
  choice:'books',
  experienceId:'shopping-for-dinner',
  structureId:'all-these-three-books',
  language:'en',
  dimension:'head-identification',
  targetTokenId:'three'
});

const result = Object.freeze({
  occurrenceId:'dependency-head-probe-select:1',
  experienceId:'shopping-for-dinner',
  structureId:'all-these-three-books',
  language:'en',
  dimension:'head-identification',
  targetTokenId:'three',
  selectedAlternativeId:'books',
  result:'pass'
});

assert.equal(
  sensor.support(learnerEvent),
  'none',
  'direct head selection begins with no observed support'
);

const evidence = Bridge.fromResult({
  result,
  learnerEvent,
  session,
  supportSensor:sensor,
  attemptLoop:Loop
});

assert.deepEqual(evidence,{
  skill:'which.use.determiner',
  dimension:'head-identification',
  result:'pass',
  support:'none',
  context:{
    occurrenceId:'dependency-head-probe-select:1',
    experienceId:'shopping-for-dinner',
    structureId:'all-these-three-books',
    language:'en',
    targetTokenId:'three',
    selectedAlternativeId:'books'
  }
});
assert.ok(Object.isFrozen(evidence));
assert.ok(Object.isFrozen(evidence.context));

for (const forbidden of [
  'expectedHeadTokenId',
  'relation',
  'mode',
  'greenPass',
  'progression',
  'mastery',
  'score'
]) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(evidence,forbidden),
    false,
    'Evidence bridge must not create '+forbidden
  );
}

sensor.observe({
  type:'dependency-head-probe-support',
  support:'hint',
  occurrenceId:'dependency-head-probe-select:1'
});

const supported = Bridge.fromResult({
  result,
  learnerEvent,
  session,
  supportSensor:sensor,
  attemptLoop:Loop
});
assert.equal(supported.support,'hint');
assert.equal(supported.skill,'which.use.determiner');

const failed = Bridge.fromResult({
  result:Object.freeze({
    ...result,
    selectedAlternativeId:'these',
    result:'fail'
  }),
  learnerEvent:Object.freeze({
    ...learnerEvent,
    choice:'these',
    occurrenceId:'dependency-head-probe-select:2'
  }),
  session,
  supportSensor:Sensor.create(),
  attemptLoop:Loop
});
assert.equal(
  failed,
  null,
  'occurrence identity mismatch between Result and LearnerEvent must fail closed'
);

const failEvent = Object.freeze({
  ...learnerEvent,
  choice:'these',
  occurrenceId:'dependency-head-probe-select:2'
});
const failResult = Object.freeze({
  ...result,
  occurrenceId:'dependency-head-probe-select:2',
  selectedAlternativeId:'these',
  result:'fail'
});
const failEvidence = Bridge.fromResult({
  result:failResult,
  learnerEvent:failEvent,
  session,
  supportSensor:Sensor.create(),
  attemptLoop:Loop
});
assert.ok(failEvidence);
assert.equal(failEvidence.result,'fail');
assert.equal(failEvidence.support,'none');

assert.equal(Bridge.fromResult({}),null);
assert.equal(
  Bridge.fromResult({result,learnerEvent,session,attemptLoop:Loop}),
  null,
  'support authority is required'
);
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent,
    session:{decision:{experienceId:'shopping-for-dinner'}},
    supportSensor:Sensor.create(),
    attemptLoop:Loop
  }),
  null,
  'missing canonical Session skill must preserve WAIT'
);
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent,
    session:{decision:{skill:'caller.override',experienceId:'preparing-dinner'}},
    supportSensor:Sensor.create(),
    attemptLoop:Loop
  }),
  null,
  'Session Experience mismatch must fail closed'
);
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent:{...learnerEvent,choice:'these'},
    session,
    supportSensor:Sensor.create(),
    attemptLoop:Loop
  }),
  null,
  'selected alternative must match observed learner action'
);
assert.equal(
  Bridge.fromResult({
    result:{...result,dimension:'dependency-focus'},
    learnerEvent,
    session,
    supportSensor:Sensor.create(),
    attemptLoop:Loop
  }),
  null,
  'exploratory dependency-focus must not become assessed Evidence'
);

const fakeLoop = {
  toEvidencePacket(_session,attempt){
    return {
      skill:'caller.override',
      dimension:attempt.dimension,
      result:attempt.result,
      support:attempt.support,
      context:attempt.context
    };
  }
};
assert.equal(
  Bridge.fromResult({
    result,
    learnerEvent,
    session,
    supportSensor:Sensor.create(),
    attemptLoop:fakeLoop
  }),
  null,
  'Evidence packet must preserve Session-owned skill and reject downstream override'
);

console.log(
  'Adaptive Dependency Head Probe Evidence bridge: PASS — grounded result plus occurrence-scoped support becomes head-identification Evidence using only Session-owned skill, with no mode, Green Pass, mastery, or progression authority.'
);
