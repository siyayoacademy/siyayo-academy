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

// Browser-shaped integration fixture: replacing innerHTML creates a fresh scroll
// region and removes keyboard focus, as the real DOM does. Use both production
// interaction handlers and the production connector renderer.
function retentionFixture() {
  const listeners = Object.create(null);
  const frames = [];
  const state = { clientWidth: 280, renders: 0, focusEvents: 0 };
  let nodes = [], region = null, markup = '';
  const overlay = { innerHTML: '', setAttribute() {} };
  const hint = { hidden: true };
  const doc = {
    activeElement: null,
    getElementById(id) { return id === 'dependencyFocusSurface' ? visual : null; },
    addEventListener(type, handler) {
      (listeners[type] || (listeners[type] = [])).push(handler);
    }
  };
  function dispatch(type, event) {
    for (const handler of listeners[type] || []) handler(event);
  }
  function focus(element, options) {
    doc.activeElement = element;
    state.focusEvents += 1;
    assert.ok(state.focusEvents < 30, 'restoring focus must not recurse through focusin');
    if (!options?.preventScroll) region.scrollLeft = 0;
    dispatch('focusin', { target: element });
  }
  const stage = {
    getBoundingClientRect() {
      return { left: -region.scrollLeft, top: 0, width: region.scrollWidth, height: 180 };
    }
  };
  const visual = {
    dataset: {}, hidden: true, isConnected: true,
    contains(element) { return element === region || nodes.includes(element); },
    querySelector(selector) {
      return ({ '.dependency-diagram-scroll': region, '.dependency-token-stage': stage,
        '.dependency-scroll-hint': hint, '[data-dependency-connectors]': overlay })[selector] || null;
    },
    querySelectorAll(selector) {
      return ['[data-token-id]', '[data-dependency-token]'].includes(selector) ? nodes : [];
    }
  };
  Object.defineProperty(visual, 'innerHTML', {
    get() { return markup; },
    set(value) {
      if (visual.contains(doc.activeElement)) doc.activeElement = null;
      markup = value;
      state.renders += 1;
      nodes = [...value.matchAll(/data-token-id="([^"]+)"/g)].map((match, index) => {
        const node = {
          dataset: { tokenId: match[1], dependencyToken: match[1] },
          closest(selector) { return selector === '[data-dependency-token]' ? this : null; },
          getBoundingClientRect() {
            return { left: index * 140 - region.scrollLeft, top: 112, width: 132, height: 56 };
          },
          focus(options) { focus(this, options); }
        };
        return node;
      });
      let left = 0;
      region = {
        clientWidth: state.clientWidth,
        scrollWidth: Math.max(nodes.length * 140, state.clientWidth),
        focus(options) { focus(this, options); },
        closest() { return null; }
      };
      Object.defineProperty(region, 'scrollLeft', {
        get() { return left; },
        set(value) { left = Math.max(0, Math.min(value, region.scrollWidth - region.clientWidth)); }
      });
    }
  });
  const context = vm.createContext({
    document: doc,
    requestAnimationFrame(callback) { frames.push(callback); },
    AdaptiveDependencyFocusView: require('../js/adaptive-dependency-focus-view.js'),
    AdaptiveDependencyConnectorView: require('../js/adaptive-dependency-connector-view.js')
  });
  context.globalThis = context;
  for (const path of ['js/verb-explorer-dependency-focus-surface.js', 'js/verb-explorer-dependency-focus-interaction.js']) {
    vm.runInContext(fs.readFileSync(path, 'utf8'), context, { filename: path });
  }
  return {
    surface: context.SIYAYOVerbExplorerDependencyFocusSurface,
    interaction: context.SIYAYOVerbExplorerDependencyFocusInteraction,
    visual, doc, state, overlay, dispatch,
    scroll() { return region; },
    token(id) { return nodes.find(node => node.dataset.tokenId === id); },
    flush() { for (const callback of frames.splice(0)) callback(); }
  };
}

const reference = name => JSON.parse(fs.readFileSync('data/learning/dependencies/' + name + '.json', 'utf8'));
const shoppingWhat = reference('shopping-what-en');
const retained = retentionFixture();
assert.equal(retained.surface.render({ structure: shoppingWhat, focusId: 'going', language: 'en' }), true);
assert.equal(retained.interaction.install({ structure: shoppingWhat, surface: retained.surface, language: 'en' }), true);
retained.flush();
retained.scroll().scrollLeft = 260;
const oldRegion = retained.scroll();
retained.dispatch('pointerover', { target: retained.token('cook'), pointerType: 'mouse' });
assert.equal(retained.visual.dataset.focusToken, 'cook');
assert.notEqual(retained.scroll(), oldRegion, 'fixture must reproduce actual region replacement');
assert.equal(retained.scroll().scrollLeft, 260, 'examining cook must retain the visible part of the sentence');
retained.flush();
assert.equal(retained.scroll().scrollLeft, 260, 'deferred arrow refresh must not reset retained scrolling');

const beforeKeyboard = retained.state.renders;
retained.token('we').focus({ preventScroll: true });
assert.equal(retained.visual.dataset.focusToken, 'we');
assert.equal(retained.doc.activeElement.dataset.dependencyToken, 'we', 'keyboard focus must survive replacement');
assert.equal(retained.state.renders, beforeKeyboard + 1, 'focus restoration must render only once');
assert.equal(retained.scroll().scrollLeft, 260);
for (const key of ['Enter', ' ']) {
  let prevented = false;
  retained.dispatch('keydown', { target: retained.doc.activeElement, key, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(retained.state.renders, beforeKeyboard + 1, 'repeated keyboard activation must remain idempotent');
}
retained.dispatch('pointerup', { target: retained.token('to'), pointerType: 'touch' });
assert.equal(retained.visual.dataset.focusToken, 'to');
assert.equal(retained.scroll().scrollLeft, 260, 'touch activation must retain scrolling');
assert.equal(retained.doc.activeElement.dataset.dependencyToken, 'we');

retained.scroll().focus({ preventScroll: true });
retained.dispatch('pointerover', { target: retained.token('are'), pointerType: 'mouse' });
assert.equal(retained.doc.activeElement, retained.scroll(), 'focused scroll region must survive token exploration');
assert.equal(retained.scroll().scrollLeft, 260);

const beforeUnknown = retained.scroll();
assert.equal(retained.surface.render({ structure: shoppingWhat, focusId: 'missing', language: 'en', preserveScroll: true }), false);
assert.equal(retained.scroll(), beforeUnknown, 'a rejected token must leave the existing diagram intact');

// A narrower available scroll range clamps the retained position after layout.
retained.state.clientWidth = 700;
retained.dispatch('pointerover', { target: retained.token('going'), pointerType: 'mouse' });
assert.equal(retained.scroll().scrollLeft, Math.max(0, retained.scroll().scrollWidth - 700));
retained.flush();

// Explicit context rendering resets even an identical reference; token-only
// rendering cannot leak a position into another language, QW or Experience.
retained.surface.render({ structure: shoppingWhat, focusId: 'going', language: 'en' });
assert.equal(retained.scroll().scrollLeft, 0);
retained.state.clientWidth = 280;
let lastReference;
for (const name of ['shopping-what-es', 'shopping-what-pt', 'shopping-what-en',
  'shopping-where-en', 'preparing-where-en', 'preparing-which-en']) {
  const next = reference(name);
  lastReference = next;
  retained.scroll().scrollLeft = 80;
  retained.surface.render({ structure: next, focusId: next.tokens[0].id, language: next.language, preserveScroll: true });
  assert.equal(retained.scroll().scrollLeft, 0, name + ' must start its own diagram at the beginning');
  retained.interaction.updateStructure(next, next.language);
  for (const width of [280, 430, 844]) {
    retained.state.clientWidth = width;
    const last = next.tokens.at(-1).id;
    retained.surface.render({ structure: next, focusId: next.tokens[0].id, language: next.language });
    retained.scroll().scrollLeft = 100;
    const expected = retained.scroll().scrollLeft;
    retained.interaction.updateStructure(next, next.language);
    retained.dispatch('pointerup', { target: retained.token(last), pointerType: 'touch' });
    retained.flush();
    assert.equal(retained.scroll().scrollLeft, expected, name + ' retains position at width ' + width);
    const plan = require('../js/adaptive-dependency-connector-view.js').plan(
      require('../js/adaptive-dependency-focus-view.js').resolve(next, last)
    );
    const paths = [...retained.overlay.innerHTML.matchAll(/d="M ([\d.]+) ([\d.]+) Q ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"[^>]*data-relation="([^"]+)"/g)];
    assert.equal(paths.length, plan.connectors.length);
    plan.connectors.forEach((connector, index) => {
      assert.equal(Number(paths[index][1]), next.tokens.findIndex(token => token.id === connector.from) * 140 + 66);
      assert.equal(Number(paths[index][5]), next.tokens.findIndex(token => token.id === connector.to) * 140 + 66);
      assert.equal(paths[index][7], connector.label, 'connector relation must remain canonical');
    });
  }
}
retained.visual.hidden = true;
retained.scroll().scrollLeft = 80;
retained.surface.render({ structure: lastReference, focusId: lastReference.tokens[0].id, language: 'en', preserveScroll: true });
assert.equal(retained.scroll().scrollLeft, 0, 'a hidden or cleared surface must not revive stale scroll state');

console.log(
  'Verb Explorer Dependency Focus Surface: PASS — canonical trilingual focus, mouse/touch/keyboard scroll retention, non-recursive focus restoration, layout clamping, reference isolation and aligned canonical connectors without pedagogical side effects.'
);
