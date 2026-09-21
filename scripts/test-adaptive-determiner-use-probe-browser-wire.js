#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const Source = require('../js/adaptive-determiner-use-probe-specification-source.js');
const Presenter = require('../js/adaptive-determiner-use-probe-presenter.js');
const Wire = require('../js/adaptive-determiner-use-probe-browser-wire.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');

const learnerSandbox = vm.createContext({});
learnerSandbox.globalThis = learnerSandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8'),
  learnerSandbox,
  { filename: 'js/verb-explorer-learner-event.js' }
);
const LearnerEvents = learnerSandbox.SIYAYOVerbExplorerLearnerEvent;

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const specification = Source.resolve(which, shopping, 'en');
const view = Presenter.present(specification);
assert.ok(view);

const container = {
  innerHTML: '',
  listeners: [],
  addEventListener(type, fn) {
    if (type === 'click') this.listeners.push(fn);
  }
};

assert.equal(Wire.render(view, { container }), true);
assert.match(container.innerHTML, /Which ___ should we choose\?/);
for (const option of ['cheese', 'should', 'we', 'choose']) {
  assert.match(
    container.innerHTML,
    new RegExp('data-determiner-use-probe-select="' + option + '"')
  );
}
assert.doesNotMatch(
  container.innerHTML,
  /expectedAlternativeId|correct|result|transfer/,
  'learner surface must not expose correctness, Evidence result, or transfer authority'
);
assert.doesNotMatch(
  container.innerHTML,
  /data-choice-select=/,
  'determiner-use probe must not impersonate contextual Choice UI'
);

let delivered = null;
let deliveredCount = 0;
let deliveredTarget = null;

function receive(event, target) {
  delivered = event;
  deliveredTarget = target;
  deliveredCount += 1;
}

assert.equal(
  Wire.install(view, {
    container,
    learnerEvents: LearnerEvents,
    onEvent: receive
  }),
  true
);
assert.equal(
  Wire.install(view, {
    container,
    learnerEvents: LearnerEvents,
    onEvent: receive
  }),
  true,
  're-installation may refresh the authorized presentation'
);
assert.equal(
  container.listeners.length,
  1,
  'one microprobe container must own exactly one physical click listener'
);

function dispatchClick(target) {
  container.listeners.forEach(fn => fn({ target }));
}

const clickable = {
  dataset: { determinerUseProbeSelect: 'cheese' },
  closest(selector) {
    return selector === '[data-determiner-use-probe-select]' ? this : null;
  }
};

dispatchClick(clickable);

assert.ok(delivered);
assert.equal(deliveredCount, 1);
assert.strictEqual(deliveredTarget, clickable);
assert.equal(delivered.observed, true);
assert.equal(delivered.actor, 'learner');
assert.equal(delivered.relevantToWait, true);
assert.equal(delivered.intent, 'continue');
assert.equal(delivered.type, 'learner-response');
assert.equal(delivered.source, 'determiner-use-probe-select');
assert.equal(delivered.choice, 'cheese');
assert.equal(delivered.experienceId, 'shopping-for-dinner');
assert.equal(delivered.dimension, 'determiner-use');
assert.equal(delivered.targetForm, 'which');
assert.equal(delivered.targetNoun, 'cheese');
assert.match(delivered.occurrenceId, /^determiner-use-probe-select:\d+$/);
assert.ok(Object.isFrozen(delivered));

for (const forbidden of ['expectedAlternativeId', 'correct', 'result', 'mode']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(delivered, forbidden),
    false,
    'learner event must not own ' + forbidden
  );
}

const before = delivered;
const beforeCount = deliveredCount;
const missing = {
  dataset: { determinerUseProbeSelect: 'missing' },
  closest(selector) {
    return selector === '[data-determiner-use-probe-select]' ? this : null;
  }
};
dispatchClick(missing);
assert.strictEqual(delivered, before);
assert.equal(deliveredCount, beforeCount);

assert.equal(Wire.render(null, { container }), false);
assert.equal(
  Wire.install(view, { container, onEvent: receive }),
  false,
  'missing learner-event authority must fail closed'
);
assert.equal(
  Wire.install(view, { container, learnerEvents: LearnerEvents }),
  false,
  'missing event receiver must fail closed'
);

assert.equal(
  Wire.eventFromTarget,
  undefined,
  'Browser Wire must not expose programmable event minting'
);
assert.equal(Wire.evaluate, undefined, 'Browser Wire must not evaluate correctness');
assert.equal(Wire.createEvidence, undefined, 'Browser Wire must not create Evidence');

console.log(
  'Adaptive determiner-use probe browser wire: PASS — one physical learner click creates exactly one immutable determiner-use observation without exposing correctness, transfer, or Evidence authority.'
);
