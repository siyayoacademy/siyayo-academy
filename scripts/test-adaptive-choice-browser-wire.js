#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Wire = require('../js/adaptive-choice-browser-wire.js');

const learnerSandbox = vm.createContext({});
learnerSandbox.globalThis = learnerSandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8'),
  learnerSandbox,
  { filename: 'js/verb-explorer-learner-event.js' }
);
const LearnerEvents = learnerSandbox.SIYAYOVerbExplorerLearnerEvent;

const view = Object.freeze({
  skill: 'which.use.determiner',
  experienceId: 'shopping-for-dinner',
  questionWord: 'which',
  intention: 'choice',
  question: Object.freeze({
    en: 'Which cheese should we choose?',
    es: '¿Qué queso deberíamos elegir?',
    pt: 'Qual queijo devemos escolher?'
  }),
  alternatives: Object.freeze([
    Object.freeze({
      id: 'fresh-mild-cheese',
      response: Object.freeze({
        en: 'We should choose the fresh, mild cheese.',
        es: 'Deberíamos elegir el queso fresco y suave.',
        pt: 'Devemos escolher o queijo fresco e suave.'
      })
    }),
    Object.freeze({
      id: 'aged-strong-cheese',
      response: Object.freeze({
        en: 'We should choose the aged, strong cheese.',
        es: 'Deberíamos elegir el queso curado y fuerte.',
        pt: 'Devemos escolher o queijo maturado e forte.'
      })
    })
  ])
});

const listeners = [];
const documentRef = {
  addEventListener(type, fn) {
    if (type === 'click') listeners.push(fn);
  }
};

let delivered = null;
let deliveredCount = 0;
function receive(event, target) {
  delivered = { event, target };
  deliveredCount += 1;
}

assert.equal(
  Wire.install(view, {
    document: documentRef,
    learnerEvents: LearnerEvents,
    onEvent: receive
  }),
  true
);

assert.equal(
  Wire.install(view, {
    document: documentRef,
    learnerEvents: LearnerEvents,
    onEvent: receive
  }),
  true,
  're-installation may refresh the authorized presentation'
);

assert.equal(
  listeners.length,
  1,
  'one browser document must own exactly one physical Choice click listener'
);

const clickable = {
  dataset: { choiceSelect: 'fresh-mild-cheese' },
  closest(selector) {
    return selector === '[data-choice-select]' ? this : null;
  }
};

listeners[0]({ target: clickable });

assert.ok(delivered);
assert.equal(deliveredCount, 1);
assert.strictEqual(delivered.target, clickable);
assert.equal(delivered.event.observed, true);
assert.equal(delivered.event.actor, 'learner');
assert.equal(delivered.event.relevantToWait, true);
assert.equal(delivered.event.intent, 'continue');
assert.equal(delivered.event.type, 'learner-response');
assert.equal(delivered.event.source, 'choice-select');
assert.equal(delivered.event.choice, 'fresh-mild-cheese');
assert.equal(delivered.event.experienceId, 'shopping-for-dinner');
assert.equal(delivered.event.question, 'Which cheese should we choose?');
assert.match(delivered.event.occurrenceId, /^choice-select:\d+$/);
assert.ok(Object.isFrozen(delivered.event));

const previous = delivered;
const previousCount = deliveredCount;
const missing = {
  dataset: { choiceSelect: 'not-authorized' },
  closest(selector) {
    return selector === '[data-choice-select]' ? this : null;
  }
};
listeners[0]({ target: missing });
assert.strictEqual(delivered, previous, 'unknown candidate must not mint a learner event');
assert.equal(deliveredCount, previousCount);

assert.equal(
  Wire.install(null, {
    document: documentRef,
    learnerEvents: LearnerEvents,
    onEvent: receive
  }),
  false
);
assert.equal(
  Wire.install(view, {
    document: documentRef,
    onEvent: receive
  }),
  false,
  'missing LearnerEvent authority must fail closed'
);
assert.equal(
  Wire.install(view, {
    document: documentRef,
    learnerEvents: LearnerEvents
  }),
  false,
  'missing event receiver must fail closed'
);

assert.equal(Wire.eventFromTarget, undefined, 'wire must not expose programmable event minting');
assert.equal(Wire.submitChoice, undefined, 'wire must not submit to Coordinator');
assert.equal(Wire.createAttempt, undefined, 'wire must not create Attempt');

console.log(
  'Adaptive Choice Browser Wire: PASS — one physical data-choice-select click creates exactly one canonical LearnerEvent; unknown choices and missing authorities WAIT; no Attempt or submission is owned here.'
);
