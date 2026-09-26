#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

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
    renders.push(input.focusId);
    return true;
  }
});

const sandbox = vm.createContext({ Object, document: documentRef });
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-dependency-focus-interaction.js','utf8'),
  sandbox,
  { filename: 'js/verb-explorer-dependency-focus-interaction.js' }
);

const Interaction = sandbox.SIYAYOVerbExplorerDependencyFocusInteraction;
assert.ok(Interaction);

assert.equal(Interaction.install({ document: documentRef, structure, surface }), true);

for (const type of ['pointerover','pointerup','focusin','keydown']) {
  assert.equal(
    Array.isArray(listeners[type]) && listeners[type].length,
    1,
    type + ' boundary must be installed exactly once'
  );
}

function token(id) {
  return {
    dataset: { dependencyToken: id },
    closest(selector) {
      return selector === '[data-dependency-token]' ? this : null;
    }
  };
}

const books = token('books');
const three = token('three');
const these = token('these');
const all = token('all');

// Mouse / pen preview.
listeners.pointerover[0]({ target: books, pointerType: 'mouse' });
assert.deepEqual(renders, ['books']);

// Repeated activation of the same token must be idempotent.
listeners.pointerup[0]({ target: books, pointerType: 'mouse' });
assert.deepEqual(renders, ['books']);

// Touch activation.
listeners.pointerup[0]({ target: three, pointerType: 'touch' });
assert.deepEqual(renders, ['books','three']);

// Keyboard focus alone can illuminate the token.
listeners.focusin[0]({ target: these });
assert.deepEqual(renders, ['books','three','these']);

// Enter / Space are accessible activation keys. Same-token repeats remain idempotent.
let prevented = 0;
listeners.keydown[0]({
  target: these,
  key: 'Enter',
  preventDefault() { prevented += 1; }
});
assert.deepEqual(renders, ['books','three','these']);
assert.equal(prevented, 1);

listeners.keydown[0]({
  target: all,
  key: ' ',
  preventDefault() { prevented += 1; }
});
assert.deepEqual(renders, ['books','three','these','all']);
assert.equal(prevented, 2);

// Touch pointerover is ignored; touch commits through pointerup.
listeners.pointerover[0]({ target: books, pointerType: 'touch' });
assert.deepEqual(renders, ['books','three','these','all']);

const unrelated = { dataset: {}, closest() { return null; } };
for (const type of ['pointerover','pointerup','focusin','keydown']) {
  const event = { target: unrelated, pointerType: 'mouse', key: 'Enter', preventDefault() {} };
  listeners[type][0](event);
}
assert.deepEqual(renders, ['books','three','these','all']);

console.log(
  'Verb Explorer Dependency Focus accessible interaction: PASS — mouse/pen hover, touch pointerup, keyboard focus, Enter and Space all illuminate canonical syntax without duplicate renders or pedagogical side effects.'
);
