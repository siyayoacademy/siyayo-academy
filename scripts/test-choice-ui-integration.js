#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/verb-explorer.css'), 'utf8');

const resolverScript = html.indexOf('js/contextual-choice-resolver.js');
const explorerScript = html.indexOf('js/verb-explorer.js');
assert.ok(resolverScript >= 0, 'resolver script must be loaded');
assert.ok(explorerScript > resolverScript, 'resolver must load before the explorer runtime');

for (const id of ['choiceResolverPanel', 'choiceOptions', 'choiceFeedback']) {
  assert.ok(html.includes(`id="${id}"`), `missing UI integration point: ${id}`);
}

for (const hook of [
  'renderChoiceResolver(x)',
  'window.SIYAYOChoiceResolver',
  'data-choice-candidate',
  'experienceChoiceCandidate=null'
]) {
  assert.ok(runtime.includes(hook), `missing runtime integration hook: ${hook}`);
}

for (const selector of [
  '.choice-resolver-panel',
  '.choice-options',
  '.choice-feedback',
  '.choice-feedback-card.is-contextual'
]) {
  assert.ok(css.includes(selector), `missing responsive feedback style: ${selector}`);
}

assert.ok(
  runtime.includes('Forma canônica') === false,
  'runtime must obtain translated labels from the resolver instead of duplicating them'
);

console.log('PASS — 3B.2 loads the resolver before the experience runtime.');
console.log('PASS — choice controls and dual feedback panels are wired.');
console.log('PASS — responsive styles and centralized labels are preserved.');
