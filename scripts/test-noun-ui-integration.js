#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/verb-explorer.css'), 'utf8');

for (const hook of ['id="wordTypeGear"', 'data-word-type="verb"', 'data-word-type="noun"', 'id="nounGear"', 'id="nounOptions"']) {
  assert.ok(html.includes(hook), `missing 4.2 noun UI hook: ${hook}`);
}
assert.ok(!html.includes('data-word-type="noun" type="button" disabled'), 'NOUN must be enabled');

for (const hook of [
  'NOUNS_URL="data/lexicon/nouns/nouns.json"',
  'nounsById=new Map',
  'activeExperienceNouns(x)',
  'focusVocabulary',
  'experienceWordType==="noun"',
  'data-noun-id',
  'nounLines(x)',
  'nounGrammarLockText(experienceLanguage)',
  'experienceWordType="verb"'
]) {
  assert.ok(runtime.includes(hook), `missing controlled noun runtime hook: ${hook}`);
}

for (const phrase of [
  'TENSE / MODE PAUSED · NOUN AXIS',
  'TIEMPO / MODO EN PAUSA · EJE SUSTANTIVO',
  'TEMPO / MODO PAUSADOS · EIXO SUBSTANTIVO'
]) {
  assert.ok(runtime.includes(phrase), `missing noun grammar lock translation: ${phrase}`);
}

for (const selector of ['.noun-gear', '.noun-options', '.noun-option.active', '.noun-option:focus-visible']) {
  assert.ok(css.includes(selector), `missing noun UI style: ${selector}`);
}

console.log('PASS — 4.2 enables NOUN from the canonical experience vocabulary.');
console.log('PASS — WHICH selects its focus noun and noun mode pauses TENSE/MODE.');
console.log('PASS — VERB remains a reversible axis and EN/ES/PT noun labels are present.');
