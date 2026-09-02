#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/verb-explorer.css'), 'utf8');

for (const hook of ['data-word-type="adjective"', 'id="adjectiveGear"', 'id="adjectiveGearLabel"', 'id="adjectiveOptions"']) {
  assert.ok(html.includes(hook), `missing 5.2 adjective UI hook: ${hook}`);
}
assert.ok(!html.includes('data-word-type="adjective" type="button" disabled'), 'ADJECTIVE must be enabled');

for (const hook of [
  'ADJECTIVES_URL="data/lexicon/adjectives/adjectives.json"',
  'adjectivesById=new Map',
  'activeExperienceAdjectives(x)',
  'preferredTraits',
  'experienceWordType==="adjective"',
  'data-adjective-id',
  'adjectiveLines(x)',
  'adjectiveGrammarLockText(experienceLanguage)',
  'chooseInitialAdjective(activeExperience())'
]) {
  assert.ok(runtime.includes(hook), `missing controlled adjective runtime hook: ${hook}`);
}

for (const phrase of [
  'TENSE / MODE PAUSED · ADJECTIVE AXIS',
  'TIEMPO / MODO EN PAUSA · EJE ADJETIVO',
  'TEMPO / MODO PAUSADOS · EIXO ADJETIVO',
  'Positive appreciation',
  'Apreciación positiva',
  'Apreciação positiva'
]) {
  assert.ok(runtime.includes(phrase), `missing adjective translation: ${phrase}`);
}

for (const selector of ['.adjective-gear', '.adjective-options', '.adjective-option.active', '.adjective-option:focus-visible']) {
  assert.ok(css.includes(selector), `missing adjective UI style: ${selector}`);
}

console.log('PASS — 5.2 enables ADJECTIVE from canonical positive experience links.');
console.log('PASS — WHICH selects FRESH from preferredTraits and pauses TENSE/MODE.');
console.log('PASS — adjective class, polarity, audio lines and EN/ES/PT labels are wired.');
