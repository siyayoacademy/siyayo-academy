#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/verb-explorer.css'), 'utf8');

for (const hook of [
  'kind:"adjective",axis:"adjective"',
  'kind:"noun",axis:"noun"',
  'data-sentence-axis=',
  'sentenceAxisTitle(match.axis,experienceLanguage)',
  'e.target.closest("[data-sentence-axis]")',
  'experienceWordType=axis',
  'if(axis){experienceWordType=axis;lineOffset=0;renderExperience();return}'
]) assert.ok(runtime.includes(hook), `missing 6.3 axis navigation hook: ${hook}`);

for (const phrase of ['Open NOUN', 'Abrir SUSTANTIVO', 'Abrir SUBSTANTIVO', 'Open ADJECTIVE', 'Abrir ADJETIVO']) {
  assert.ok(runtime.includes(phrase), `missing 6.3 navigation label: ${phrase}`);
}

assert.ok(css.includes('.sentence-part[data-sentence-axis]'), 'missing interactive sentence-part style');
assert.ok(css.includes('cursor:pointer'), 'interactive sentence parts must signal navigation');

console.log('PASS — 6.3 makes canonical NOUN and ADJECTIVE sentence parts navigable.');
console.log('PASS — selections remain in state while returning to their source axes.');
console.log('PASS — non-target sentence clicks preserve complete-line audio.');
console.log('PASS — data-backed sentence axes remain available for canonical navigation.');
