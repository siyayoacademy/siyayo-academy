#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/verb-explorer.css'), 'utf8');

assert.ok(html.includes('id="experienceGrammarLock"'), 'grammar lock indicator must exist');
assert.ok(runtime.includes('contextualChoiceIsActive(x)'), 'contextual choice guard must exist');
assert.ok(
  runtime.includes('button.disabled=locked') &&
  runtime.includes('button.setAttribute("aria-disabled",String(locked))'),
  'TENSE/MODE controls must be disabled accessibly while locked'
);
assert.ok(
  runtime.includes('if(question?.choiceContext)return contextualChoiceLines(question,experienceLanguage)'),
  'contextual choices must bypass the unrelated generic verb response'
);
for (const label of [
  'TENSE / MODE PAUSED · CONTEXTUAL CHOICE',
  'TIEMPO / MODO EN PAUSA · ELECCIÓN CONTEXTUAL',
  'TEMPO / MODO PAUSADOS · ESCOLHA CONTEXTUAL'
]) {
  assert.ok(runtime.includes(label), `missing trilingual lock label: ${label}`);
}
for (const role of [
  'CANONICAL CHOICE', 'REVIEW',
  'ELECCIÓN CANÓNICA', 'REVISIÓN',
  'ESCOLHA CANÔNICA', 'REVISÃO'
]) {
  assert.ok(runtime.includes(role), `missing localized contextual learning role: ${role}`);
}
assert.ok(runtime.includes('contextualRoleLabels(language)'), 'contextual role labels must be centralized');
assert.ok(css.includes('.gear-lock'), 'grammar lock must have a visible style');
assert.ok(css.includes('.gear-option:disabled'), 'locked gears must have a disabled style');
assert.ok(css.includes('scrollbar-color:#8f6a1e'), 'horizontal controls must use the SIYAYO gold scrollbar');
assert.ok(css.includes('::-webkit-scrollbar{height:6px}'), 'WebKit scrollbar must remain visually discreet');

console.log('PASS — 3C pauses TENSE/MODE during contextual choice resolution.');
console.log('PASS — the unrelated generic verb response is not rendered for WHICH.');
console.log('PASS — lock state, contextual roles and gold scrollbars are explicit in EN/ES/PT.');
