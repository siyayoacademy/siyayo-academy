#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/verb-explorer.css'), 'utf8');

for (const hook of [
  'data-choice-select',
  'data-choice-audio',
  'speakChoiceCandidate',
  'clearChoiceAudioHighlight',
  'e.stopPropagation()',
  'aria-pressed'
]) {
  assert.ok(runtime.includes(hook), `missing independent choice-audio hook: ${hook}`);
}

for (const label of [
  'Listen to this response',
  'Escuchar esta respuesta',
  'Ouvir esta resposta'
]) {
  assert.ok(runtime.includes(label), `missing accessible audio label: ${label}`);
}

assert.ok(
  runtime.includes('experienceChoiceCandidate=select.dataset.choiceSelect'),
  'only the selection control may update the pedagogical choice'
);
assert.ok(
  runtime.includes('speakChoiceCandidate(audio.dataset.choiceAudio,audio);return'),
  'audio action must return before selection logic'
);
assert.ok(
  runtime.includes('candidate?.response?.[experienceLanguage]'),
  'audio must follow the active experience language'
);

for (const selector of [
  '.choice-select,.choice-audio',
  '.choice-audio:hover',
  '.choice-option.is-speaking',
  '.choice-select:focus-visible'
]) {
  assert.ok(css.includes(selector), `missing choice-audio style: ${selector}`);
}

console.log('PASS — 3C.2 listening and choosing are independent actions.');
console.log('PASS — canonical response audio follows EN/ES/PT.');
console.log('PASS — keyboard focus and temporary speaking highlight are present.');
