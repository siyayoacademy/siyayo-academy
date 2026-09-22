#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

assert.equal(
  fs.existsSync('js/adaptive-dependency-connector-view.js'),
  true,
  'Dependency Connector View must exist before canonical relations can be drawn as SVG'
);

const Focus = require('../js/adaptive-dependency-focus-view.js');
const Connectors = require('../js/adaptive-dependency-connector-view.js');
const structure = JSON.parse(
  fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8')
);

const booksFocus = Focus.resolve(structure, 'books');
const booksPlan = Connectors.plan(booksFocus);

assert.ok(booksPlan);
assert.equal(booksPlan.status, 'DEPENDENCY_CONNECTORS_READY');
assert.equal(booksPlan.focusId, 'books');
assert.deepEqual(booksPlan.connectors, [
  { from: 'all', to: 'books', label: 'det' },
  { from: 'these', to: 'books', label: 'det' },
  { from: 'three', to: 'books', label: 'nummod' }
]);
assert.equal(Object.isFrozen(booksPlan), true);
assert.equal(Object.isFrozen(booksPlan.connectors), true);
assert.ok(booksPlan.connectors.every(Object.isFrozen));

const threeFocus = Focus.resolve(structure, 'three');
const threePlan = Connectors.plan(threeFocus);
assert.deepEqual(threePlan.connectors, [
  { from: 'three', to: 'books', label: 'nummod' }
]);

const overlay = {
  attrs: {},
  innerHTML: '',
  setAttribute(name, value) {
    this.attrs[name] = String(value);
  }
};

const stageRect = { left: 0, top: 0, width: 440, height: 120 };
const tokenRects = {
  all:   { left: 20,  top: 70, width: 70, height: 32 },
  these: { left: 120, top: 70, width: 70, height: 32 },
  three: { left: 220, top: 70, width: 70, height: 32 },
  books: { left: 340, top: 70, width: 80, height: 32 }
};

const tokenElements = Object.entries(tokenRects).map(([id, rect]) => ({
  dataset: { tokenId: id },
  getBoundingClientRect() { return rect; }
}));

const stage = {
  getBoundingClientRect() { return stageRect; }
};

const surface = {
  querySelector(selector) {
    if (selector === '[data-dependency-connectors]') return overlay;
    if (selector === '.dependency-token-stage') return stage;
    return null;
  },
  querySelectorAll(selector) {
    return selector === '[data-token-id]' ? tokenElements : [];
  }
};

assert.equal(
  Connectors.draw({
    surface,
    resolved: booksFocus
  }),
  true
);

assert.equal(overlay.attrs.viewBox, '0 0 440 120');
assert.match(overlay.innerHTML, /<marker[^>]+id="dependencyArrow"/);
assert.equal((overlay.innerHTML.match(/<path /g) || []).length, 3);
assert.match(overlay.innerHTML, /marker-end="url\(#dependencyArrow\)"/);
assert.match(overlay.innerHTML, />det<\/text>/);
assert.match(overlay.innerHTML, />nummod<\/text>/);

for (const forbidden of ['score','mastery','greenPass','learnerEvent','progression','nextExperience']) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(booksPlan, forbidden),
    false,
    `Connector plan must not invent ${forbidden}`
  );
}

assert.equal(Connectors.plan(null), null);
assert.equal(
  Connectors.draw({ surface, resolved: null }),
  false,
  'missing canonical focus must fail closed'
);

console.log(
  'Adaptive Dependency Connector View: PASS — canonical dependent→head relations become a frozen connector plan and responsive SVG curves with labels, without parser inference or pedagogical authority.'
);
