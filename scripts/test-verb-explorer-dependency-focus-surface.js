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
  const state = { clientWidth: 280, renders: 0, focusEvents: 0,
    tokenStep: 140, tokenWidth: 132, visible: true };
  let nodes = [], region = null, stage = null, markup = '', resizeCallback;
  const observed = new Set();
  const viewport = {dataset: {}};
  const previewButtons = ['auto', 'portrait', 'landscape'].map(mode => ({
    dataset: {preview: mode}, classList: {toggle() {}}, setAttribute() {},
    addEventListener(type, handler) { this[type] = handler; }
  }));
  const toolbar = {querySelectorAll() { return previewButtons; }};
  const overlay = { innerHTML: '', setAttribute() {} };
  const hint = { hidden: true };
  const doc = {
    activeElement: null,
    getElementById(id) { return id === 'dependencyFocusSurface' ? visual : null; },
    querySelector(selector) {
      return selector === '[data-siyayo-responsive-viewport]' ? viewport :
        selector === '[data-siyayo-responsive-toolbar]' ? toolbar : null;
    },
    fonts: {ready: {then(handler) { handler(); }},
      addEventListener(type, handler) { (listeners['fonts:' + type] ||= []).push(handler); }},
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
      stage = {getBoundingClientRect() {
        return {left: -region.scrollLeft, top: 0,
          width: state.visible ? region.scrollWidth : 0, height: state.visible ? 180 : 0};
      }};
      nodes = [...value.matchAll(/data-token-id="([^"]+)"/g)].map((match, index) => {
        const node = {
          dataset: { tokenId: match[1], dependencyToken: match[1] },
          closest(selector) { return selector === '[data-dependency-token]' ? this : null; },
          getBoundingClientRect() {
            return { left: index * state.tokenStep - region.scrollLeft,
              top: 112, width: state.tokenWidth, height: 56 };
          },
          focus(options) { focus(this, options); }
        };
        return node;
      });
      let left = 0;
      region = {
        get clientWidth() { return state.clientWidth; },
        get scrollWidth() { return Math.max(nodes.length * state.tokenStep, state.clientWidth); },
        focus(options) { focus(this, options); },
        closest() { return null; }
      };
      Object.defineProperty(region, 'scrollLeft', {
        get() { return Math.min(left, region.scrollWidth - region.clientWidth); },
        set(value) { left = Math.max(0, Math.min(value, region.scrollWidth - region.clientWidth)); }
      });
    }
  });
  const context = vm.createContext({
    document: doc,
    requestAnimationFrame(callback) { frames.push(callback); },
    addEventListener(type, handler) { (listeners[type] ||= []).push(handler); },
    dispatchEvent(event) { dispatch(event.type, event); },
    CustomEvent: class { constructor(type, input) { this.type = type; this.detail = input.detail; } },
    matchMedia() { return {matches: false}; },
    localStorage: {getItem() { return null; }, setItem() {}},
    ResizeObserver: class {
      constructor(callback) { resizeCallback = callback; }
      disconnect() { observed.clear(); }
      observe(element) { observed.add(element); }
    },
    AdaptiveDependencyFocusView: require('../js/adaptive-dependency-focus-view.js'),
    AdaptiveDependencyConnectorView: require('../js/adaptive-dependency-connector-view.js')
  });
  context.globalThis = context;
  context.window = context;
  for (const path of ['js/siyayo-responsive-preview.js',
    'js/verb-explorer-dependency-focus-surface.js', 'js/verb-explorer-dependency-focus-interaction.js']) {
    vm.runInContext(fs.readFileSync(path, 'utf8'), context, { filename: path });
  }
  return {
    surface: context.SIYAYOVerbExplorerDependencyFocusSurface,
    interaction: context.SIYAYOVerbExplorerDependencyFocusInteraction,
    visual, doc, state, overlay, dispatch,
    scroll() { return region; },
    token(id) { return nodes.find(node => node.dataset.tokenId === id); },
    flush() { for (const callback of frames.splice(0)) callback(); },
    preview(mode, width) {
      state.clientWidth = width;
      previewButtons.find(button => button.dataset.preview === mode).click();
      assert.equal(context.SIYAYOResponsivePreview.getMode(), mode);
    },
    resize() { assert.ok(observed.has(stage), 'current stage must be observed'); resizeCallback(); }
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

// Exercise the actual preview controller and redraw listeners, without another
// render or assessment event. Geometry is a controlled DOM fixture, not browser QA.
const runtime = fs.readFileSync('js/verb-explorer.js', 'utf8');
const paths = [...runtime.match(/DEPENDENCY_FOCUS_URLS=\[([^\]]+)\]/)[1].matchAll(/"([^"]+)"/g)].map(match => match[1]);
const Focus = require('../js/adaptive-dependency-focus-view.js');
const Connectors = require('../js/adaptive-dependency-connector-view.js');
const initiallyHidden = retentionFixture();
initiallyHidden.state.visible = false;
assert.equal(initiallyHidden.surface.render({structure: shoppingWhat, focusId: 'going', language: 'en'}), true,
  'a deferred SVG must not reject valid canonical token/interaction setup');
assert.equal(initiallyHidden.interaction.install({structure: shoppingWhat, surface: initiallyHidden.surface, language: 'en'}), true);
initiallyHidden.flush();
assert.equal(initiallyHidden.overlay.innerHTML, '');
initiallyHidden.state.visible = true;
initiallyHidden.resize(); initiallyHidden.flush();
assert.match(initiallyHidden.overlay.innerHTML, /dependency-connector-path/);
initiallyHidden.dispatch('pointerup', {target: initiallyHidden.token('cook'), pointerType: 'touch'});
assert.equal(initiallyHidden.visual.dataset.focusToken, 'cook', 'first visible interaction must use the current structure');
let layoutCases = 0;
for (const path of paths) {
  const model = JSON.parse(fs.readFileSync(path, 'utf8'));
  const fixture = retentionFixture();
  for (const token of model.tokens) {
    fixture.surface.render({structure: model, focusId: token.id, language: model.language});
    fixture.flush();
    const plan = Connectors.plan(Focus.resolve(model, token.id));
    assert.deepEqual([...fixture.visual.innerHTML.matchAll(/data-token-id="([^"]+)"/g)].map(match => match[1]),
      model.tokens.map(item => item.id), 'every canonical word must be rendered in order');
    assert.deepEqual([...fixture.visual.innerHTML.matchAll(/<b>(.*?)<\/b>/g)].map(match => match[1]),
      model.tokens.map(item => item.form), 'word forms must stay complete, including multiword tokens');
    const renders = fixture.state.renders;
    for (const [mode, width] of [['auto', 1200], ['portrait', 430], ['landscape', 844]]) {
      fixture.preview(mode, width);
      fixture.scroll().scrollLeft = 150;
      const position = fixture.scroll().scrollLeft;
      fixture.flush();
      const drawn = [...fixture.overlay.innerHTML.matchAll(/d="M ([\d.]+) ([\d.]+) Q ([\d.]+) ([\d.]+) ([\d.]+) ([\d.]+)"[^>]*data-relation="([^"]+)"/g)];
      assert.equal(drawn.length, plan.connectors.length, path + ' ' + token.id + ' ' + mode);
      plan.connectors.forEach((connector, index) => {
        assert.equal(Number(drawn[index][1]), model.tokens.findIndex(item => item.id === connector.from) * 140 + 66);
        assert.equal(Number(drawn[index][5]), model.tokens.findIndex(item => item.id === connector.to) * 140 + 66);
        assert.equal(drawn[index][7], connector.label);
      });
      assert.equal(fixture.scroll().scrollLeft, position);
      assert.equal(fixture.visual.dataset.focusToken, token.id);
      assert.equal(fixture.state.renders, renders, 'format change must not rebuild the sentence');
      layoutCases += 1;
    }
  }
  const saved = fixture.overlay.innerHTML;
  fixture.state.visible = false;
  fixture.resize(); fixture.flush();
  assert.equal(fixture.overlay.innerHTML, saved, 'zero-sized frame must retain the valid projection');
  fixture.state.visible = true;
  fixture.state.tokenStep = 120; fixture.state.tokenWidth = 112;
  fixture.resize(); fixture.dispatch('resize', {}); fixture.dispatch('fonts:loadingdone', {});
  fixture.flush();
  assert.equal(fixture.state.renders, model.tokens.length);
  assert.ok(!fixture.overlay.innerHTML.includes('NaN'));
  const finalPlan = Connectors.plan(Focus.resolve(model, model.tokens.at(-1).id));
  const redrawn = [...fixture.overlay.innerHTML.matchAll(/d="M ([\d.]+) [\d.]+ Q [\d.]+ [\d.]+ ([\d.]+) [\d.]+"[^>]*data-relation="([^"]+)"/g)];
  assert.equal(redrawn.length, finalPlan.connectors.length);
  finalPlan.connectors.forEach((connector, index) => {
    assert.equal(Number(redrawn[index][1]), model.tokens.findIndex(item => item.id === connector.from) * 120 + 56);
    assert.equal(Number(redrawn[index][2]), model.tokens.findIndex(item => item.id === connector.to) * 120 + 56);
  });
}
console.log('PASS — ' + layoutCases + ' token/format redraw cases across all loaded EN/ES/PT canonical diagrams; resize/font/hidden-frame recovery preserves words, focus and scroll.');

console.log(
  'Verb Explorer Dependency Focus Surface: PASS — canonical trilingual focus, mouse/touch/keyboard scroll retention, non-recursive focus restoration, layout clamping, reference isolation and aligned canonical connectors without pedagogical side effects.'
);
