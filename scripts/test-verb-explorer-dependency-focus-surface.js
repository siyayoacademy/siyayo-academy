#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

assert.equal(
  fs.existsSync('js/verb-explorer-dependency-focus-surface.js'),
  true,
  'Dependency Focus Surface must exist before canonical syntactic focus can be rendered'
);

const structure = JSON.parse(
  fs.readFileSync('data/learning/dependencies/all-these-three-books.json','utf8')
);

const surface = {
  hidden: true,
  innerHTML: '',
  dataset: {}
};

const documentRef = {
  getElementById(id) {
    return id === 'dependencyFocusSurface' ? surface : null;
  }
};

const sandbox = vm.createContext({
  Object,
  document: documentRef,
  AdaptiveDependencyFocusView: require('../js/adaptive-dependency-focus-view.js'),
  AdaptiveDependencyConnectorView: Object.freeze({
    draw(input) {
      assert.ok(input.surface);
      assert.ok(input.resolved);
      assert.equal(input.resolved.status, 'DEPENDENCY_FOCUS_READY');
      return true;
    }
  })
});
sandbox.globalThis = sandbox;

vm.runInContext(
  fs.readFileSync('js/verb-explorer-dependency-focus-surface.js','utf8'),
  sandbox,
  { filename: 'js/verb-explorer-dependency-focus-surface.js' }
);

const Surface = sandbox.SIYAYOVerbExplorerDependencyFocusSurface;
assert.ok(Surface);
assert.equal(typeof Surface.render, 'function');

assert.equal(
  Surface.render({ document: documentRef, structure, focusId: 'books' }),
  true
);
assert.equal(surface.hidden, false);
assert.equal(surface.dataset.focusToken, 'books');
assert.match(surface.innerHTML, /DEPENDENCY FOCUS/);
assert.match(surface.innerHTML, /data-token-id="books"[^>]*data-role="focus"/);
assert.match(surface.innerHTML, /data-token-id="all"[^>]*data-role="dependent"/);
assert.match(surface.innerHTML, /data-token-id="these"[^>]*data-role="dependent"/);
assert.match(surface.innerHTML, /data-token-id="three"[^>]*data-role="dependent"/);
assert.match(surface.innerHTML, />NOUN</);
assert.match(surface.innerHTML, />DETERMINER</);
assert.match(surface.innerHTML, />NUMERAL</);
assert.match(surface.innerHTML, />det</);
assert.match(surface.innerHTML, />nummod</);

assert.doesNotMatch(surface.innerHTML, /<button/i);
assert.doesNotMatch(surface.innerHTML, /onclick=/i);
assert.doesNotMatch(surface.innerHTML, /audio/i);
assert.doesNotMatch(surface.innerHTML, /mastery/i);
assert.doesNotMatch(surface.innerHTML, /score/i);
assert.doesNotMatch(surface.innerHTML, /green.?pass/i);

assert.equal(
  Surface.render({ document: documentRef, structure, focusId: 'three' }),
  true
);
assert.equal(surface.dataset.focusToken, 'three');
assert.match(surface.innerHTML, /data-token-id="three"[^>]*data-role="focus"/);
assert.match(surface.innerHTML, /data-token-id="books"[^>]*data-role="head"/);
assert.match(surface.innerHTML, />nummod</);


assert.equal(
  Surface.render({ document: documentRef, structure, focusId: 'all', language: 'en' }),
  true
);
assert.match(surface.innerHTML, /ALL \/ DETERMINER/i);
assert.match(surface.innerHTML, /Quantifying Determiner/);
assert.match(surface.innerHTML, />det</);

assert.equal(
  Surface.render({ document: documentRef, structure, focusId: 'these', language: 'es' }),
  true
);
assert.match(surface.innerHTML, /these \/ DETERMINANTE/i);
assert.match(surface.innerHTML, /Determinante demostrativo/);
assert.match(surface.innerHTML, />det</);

assert.equal(
  Surface.render({ document: documentRef, structure, focusId: 'three', language: 'pt' }),
  true
);
assert.match(surface.innerHTML, /three \/ NUMERAL/i);
assert.match(surface.innerHTML, /Numeral cardinal/);
assert.match(surface.innerHTML, />nummod</);

assert.equal(
  Surface.render({ document: documentRef, structure, focusId: 'books', language: 'pt' }),
  true
);
assert.match(surface.innerHTML, /books \/ SUBSTANTIVO/i);
assert.match(surface.innerHTML, /Núcleo da frase/);
assert.match(surface.innerHTML, />det</);
assert.match(surface.innerHTML, />nummod</);

assert.equal(
  Surface.render({ document: documentRef, structure, focusId: 'missing-token' }),
  false,
  'unknown focus must fail closed rather than rendering guessed relations'
);

console.log(
  'Verb Explorer Dependency Focus Surface: PASS — canonical focus renders trilingual full human terminology while preserving compact grounded relation labels without interaction, parser inference, evidence, score, mastery, or Green Pass.'
);
