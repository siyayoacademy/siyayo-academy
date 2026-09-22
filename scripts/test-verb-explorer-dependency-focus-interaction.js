#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

assert.equal(
  fs.existsSync('js/verb-explorer-dependency-focus-interaction.js'),
  true,
  'Dependency Focus interaction boundary must exist before learner pointing can change syntactic focus'
);

const structure = JSON.parse(
  fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8')
);

const listeners = Object.create(null);
const documentRef = {
  addEventListener(type, handler) {
    (listeners[type] || (listeners[type] = [])).push(handler);
  }
};

const renders = [];
const surface = Object.freeze({
  render(input) {
    renders.push(input);
    return true;
  }
});

const sandbox = vm.createContext({
  Object,
  Promise,
  document: documentRef
});
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-dependency-focus-interaction.js','utf8'),
  sandbox,
  { filename: 'js/verb-explorer-dependency-focus-interaction.js' }
);

const Interaction = sandbox.SIYAYOVerbExplorerDependencyFocusInteraction;
assert.ok(Interaction);
assert.equal(typeof Interaction.install, 'function');

assert.equal(
  Interaction.install({
    document: documentRef,
    structure,
    surface
  }),
  true
);
assert.equal(
  Interaction.install({
    document: documentRef,
    structure,
    surface
  }),
  false,
  'Dependency Focus interaction installs once'
);
for (const type of ['pointerover','pointerup','focusin','keydown']) {
  assert.equal(Array.isArray(listeners[type]) && listeners[type].length, 1);
}

function clickToken(id) {
  const token = {
    dataset: { dependencyToken: id },
    closest(selector) {
      return selector === '[data-dependency-token]' ? this : null;
    }
  };
  listeners.pointerup[0]({ target: token, pointerType: 'mouse' });
}

clickToken('books');
clickToken('three');

assert.equal(renders.length, 2);
assert.strictEqual(renders[0].structure, structure);
assert.strictEqual(renders[1].structure, structure);
assert.equal(renders[0].focusId, 'books');
assert.equal(renders[1].focusId, 'three');
assert.strictEqual(renders[0].document, documentRef);
assert.strictEqual(renders[1].document, documentRef);

const unrelated = {
  dataset: {},
  closest() { return null; }
};
listeners.pointerup[0]({ target: unrelated, pointerType: 'mouse' });
assert.equal(renders.length, 2, 'unrelated clicks must not change syntactic focus');

for (const input of renders) {
  for (const forbidden of ['learnerEvent','evidence','greenPass','score','mastery','progression']) {
    assert.equal(
      Object.prototype.hasOwnProperty.call(input, forbidden),
      false,
      `read-only focus interaction must not create ${forbidden}`
    );
  }
}

console.log(
  'Verb Explorer Dependency Focus interaction: PASS — explicit learner pointing switches canonical syntactic focus BOOKS ↔ THREE without producing LearnerEvent, evidence, score, mastery, progression, or Green Pass.'
);
