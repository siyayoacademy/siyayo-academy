#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const LocalSource = require('../js/adaptive-determiner-use-probe-specification-source.js');
const TransferSource = require('../js/adaptive-determiner-use-transfer-probe-specification-source.js');
const Presenter = require('../js/adaptive-determiner-use-transfer-probe-presenter.js');
const Wire = require('../js/adaptive-determiner-use-transfer-probe-browser-wire.js');
const which = require('../data/learning/skills/which.json');
const experiences = require('../data/learning/experience-seeds.json');
const nouns = require('../data/lexicon/nouns/nouns.json');

const learnerSandbox = vm.createContext({});
learnerSandbox.globalThis = learnerSandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8'),
  learnerSandbox,
  { filename: 'js/verb-explorer-learner-event.js' }
);
const LearnerEvents = learnerSandbox.SIYAYOVerbExplorerLearnerEvent;

const shopping = experiences.items.find(item => item.id === 'shopping-for-dinner');
const preparing = experiences.items.find(item => item.id === 'preparing-dinner');
const local = LocalSource.resolve(which, shopping, 'en');
const specification = TransferSource.resolve(which, local, preparing, nouns, 'en');
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
assert.match(container.innerHTML, /Which ___ should we cook first\?/);
for (const option of ['carrots', 'should', 'we', 'cook']) {
  assert.match(
    container.innerHTML,
    new RegExp('data-determiner-use-transfer-probe-select="' + option + '"')
  );
}
assert.doesNotMatch(
  container.innerHTML,
  /expectedAlternativeId|correct|result|mode="transfer"|fromExperienceId/,
  'learner-facing HTML must not expose correctness or transfer routing authority'
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
  true
);
assert.equal(
  container.listeners.length,
  1,
  'one transfer probe container must own exactly one physical click listener'
);

function dispatchClick(target) {
  container.listeners.forEach(fn => fn({ target }));
}

const clickable = {
  dataset: { determinerUseTransferProbeSelect: 'carrots' },
  closest(selector) {
    return selector === '[data-determiner-use-transfer-probe-select]' ? this : null;
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
assert.equal(delivered.source, 'determiner-use-transfer-probe-select');
assert.equal(delivered.choice, 'carrots');
assert.equal(delivered.fromExperienceId, 'shopping-for-dinner');
assert.equal(delivered.experienceId, 'preparing-dinner');
assert.equal(delivered.dimension, 'determiner-use');
assert.equal(delivered.mode, 'transfer');
assert.equal(delivered.targetForm, 'which');
assert.equal(delivered.targetNoun, 'carrots');
assert.match(delivered.occurrenceId, /^determiner-use-transfer-probe-select:\d+$/);
assert.ok(Object.isFrozen(delivered));

for (const forbidden of ['expectedAlternativeId', 'correct', 'result']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(delivered, forbidden),
    false,
    'transfer learner event must not own ' + forbidden
  );
}

const before = delivered;
const beforeCount = deliveredCount;
const missing = {
  dataset: { determinerUseTransferProbeSelect: 'missing' },
  closest(selector) {
    return selector === '[data-determiner-use-transfer-probe-select]' ? this : null;
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

assert.equal(Wire.eventFromTarget, undefined);
assert.equal(Wire.evaluate, undefined);
assert.equal(Wire.createEvidence, undefined);

console.log(
  'Adaptive determiner-use transfer probe browser wire: PASS — one physical cross-Experience learner click creates exactly one immutable transfer observation without exposing correctness or Evidence authority.'
);
