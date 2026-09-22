#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

assert.equal(
  fs.existsSync('js/adaptive-dependency-head-probe-browser-wire.js'),
  true,
  'Dependency Head Probe Browser Wire must exist before the presented task can emit an observed learner selection'
);

const HeadProbe = require('../js/adaptive-dependency-head-probe-definition.js');
const Presenter = require('../js/adaptive-dependency-head-probe-presenter.js');
const Wire = require('../js/adaptive-dependency-head-probe-browser-wire.js');

const learnerSandbox = vm.createContext({});
learnerSandbox.globalThis = learnerSandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),
  learnerSandbox,
  { filename:'js/verb-explorer-learner-event.js' }
);
const LearnerEvents = learnerSandbox.SIYAYOVerbExplorerLearnerEvent;

const structure = JSON.parse(
  fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8')
);
const definition = HeadProbe.create(structure,{
  experienceId:'shopping-for-dinner',
  targetTokenId:'three',
  prompt:'Which word is the head of “three”?',
  alternativeTokenIds:['all','these','books']
});
const view = Presenter.present(definition);
assert.ok(view);

const container = {
  innerHTML:'',
  listeners:[],
  addEventListener(type,fn){
    if(type==='click') this.listeners.push(fn);
  }
};

assert.equal(Wire.render(view,{container}),true);
assert.match(container.innerHTML,/Which word is the head of “three”\?/);
for(const id of ['all','these','books']){
  assert.match(
    container.innerHTML,
    new RegExp('data-dependency-head-probe-select="' + id + '"')
  );
}
assert.doesNotMatch(
  container.innerHTML,
  /expectedHeadTokenId|nummod|correct|result|evidence|greenPass/i,
  'learner-facing head probe must not expose correctness, relation, Evidence, or Green Pass authority'
);
assert.doesNotMatch(
  container.innerHTML,
  /data-dependency-token=/,
  'assessed head-probe buttons must not impersonate exploratory Dependency Focus tokens'
);

let delivered = null;
let deliveredCount = 0;
let deliveredTarget = null;

function receive(event,target){
  delivered = event;
  deliveredTarget = target;
  deliveredCount += 1;
}

assert.equal(
  Wire.install(view,{
    container,
    learnerEvents:LearnerEvents,
    onEvent:receive
  }),
  true
);
assert.equal(
  Wire.install(view,{
    container,
    learnerEvents:LearnerEvents,
    onEvent:receive
  }),
  true,
  're-installation may refresh the authorized presentation without multiplying physical listeners'
);
assert.equal(
  container.listeners.length,
  1,
  'one Dependency Head Probe container must own exactly one physical click listener'
);

function dispatchClick(target){
  container.listeners.forEach(fn=>fn({target}));
}

const clickable = {
  dataset:{dependencyHeadProbeSelect:'books'},
  closest(selector){
    return selector==='[data-dependency-head-probe-select]' ? this : null;
  }
};

dispatchClick(clickable);

assert.ok(delivered);
assert.equal(deliveredCount,1);
assert.strictEqual(deliveredTarget,clickable);
assert.equal(delivered.observed,true);
assert.equal(delivered.actor,'learner');
assert.equal(delivered.relevantToWait,true);
assert.equal(delivered.intent,'continue');
assert.equal(delivered.type,'learner-response');
assert.equal(delivered.source,'dependency-head-probe-select');
assert.equal(delivered.choice,'books');
assert.equal(delivered.experienceId,'shopping-for-dinner');
assert.equal(delivered.structureId,'all-these-three-books');
assert.equal(delivered.language,'en');
assert.equal(delivered.dimension,'head-identification');
assert.equal(delivered.targetTokenId,'three');
assert.match(delivered.occurrenceId,/^dependency-head-probe-select:\d+$/);
assert.ok(Object.isFrozen(delivered));

for(const forbidden of [
  'expectedHeadTokenId',
  'relation',
  'correct',
  'result',
  'evidence',
  'attempt',
  'score',
  'mastery',
  'greenPass',
  'progression'
]){
  assert.equal(
    Object.prototype.hasOwnProperty.call(delivered,forbidden),
    false,
    'learner event must not own '+forbidden
  );
}

const before = delivered;
const beforeCount = deliveredCount;
const missing = {
  dataset:{dependencyHeadProbeSelect:'missing'},
  closest(selector){
    return selector==='[data-dependency-head-probe-select]' ? this : null;
  }
};
dispatchClick(missing);
assert.strictEqual(delivered,before);
assert.equal(deliveredCount,beforeCount);

assert.equal(Wire.render(null,{container}),false);
assert.equal(
  Wire.install(view,{container,onEvent:receive}),
  false,
  'missing learner-event authority must fail closed'
);
assert.equal(
  Wire.install(view,{container,learnerEvents:LearnerEvents}),
  false,
  'missing event receiver must fail closed'
);

assert.equal(
  Wire.eventFromTarget,
  undefined,
  'Browser Wire must not expose programmable event minting'
);
assert.equal(Wire.evaluate,undefined,'Browser Wire must not evaluate correctness');
assert.equal(Wire.createEvidence,undefined,'Browser Wire must not create Evidence');

console.log(
  'Adaptive Dependency Head Probe Browser Wire: PASS — one explicit physical learner click creates exactly one immutable head-identification observation without exposing correctness, dependency relation, Evidence, or progression authority.'
);
