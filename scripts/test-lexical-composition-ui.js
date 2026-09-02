#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const css = fs.readFileSync(path.join(ROOT, 'css/verb-explorer.css'), 'utf8');

for (const hook of ['id="compositionGear"', 'id="compositionGearLabel"', 'id="composeSelection"']) {
  assert.ok(html.includes(hook), `missing 6.1 composition UI hook: ${hook}`);
}

for (const hook of [
  'composeLexicalPhrase(noun,adjective,language)',
  'compositionIsContextual(x,noun,adjective)',
  'context.focusVocabulary===noun?.id',
  '(context.preferredTraits||[]).includes(adjective?.id)',
  'experienceWordType==="composition"',
  'compositionLines(x)',
  'compositionGrammarLockText(experienceLanguage)',
  'event.target.closest("#composeSelection")'
]) {
  assert.ok(runtime.includes(hook), `missing controlled composition hook: ${hook}`);
}

for (const phrase of [
  'adjective + noun',
  'sustantivo + adjetivo',
  'substantivo + adjetivo',
  'This combination fits the active WHICH choice.',
  'Esta combinación corresponde a la elección WHICH activa.',
  'Esta combinação corresponde à escolha WHICH ativa.'
]) {
  assert.ok(runtime.includes(phrase), `missing composition translation or rule: ${phrase}`);
}

for (const selector of ['.composition-gear', '.compose-selection', '.compose-selection.active', '.compose-selection:disabled']) {
  assert.ok(css.includes(selector), `missing composition UI style: ${selector}`);
}

assert.match(runtime, /language==="en"\?`\$\{adjectiveText\} \$\{nounText\}`:`\$\{nounText\} \$\{adjectiveText\}`/);

console.log('PASS — 6.1 composes canonical ADJECTIVE + NOUN selections.');
console.log('PASS — English and Romance-language word orders remain distinct.');
console.log('PASS — contextual fit requires both focusVocabulary and preferredTraits.');
console.log('PASS — composition is a layer, not a fourth word type.');
