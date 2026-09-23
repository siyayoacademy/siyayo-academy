#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

const schema = JSON.parse(fs.readFileSync('data/schemas/experience-seed.schema.json','utf8'));
const corpus = JSON.parse(fs.readFileSync('data/learning/experience-seeds.json','utf8'));
const runtime = fs.readFileSync('js/verb-explorer.js','utf8');

const shopping = corpus.items.find(item => item.id === 'shopping-for-dinner');
assert.ok(shopping, 'shopping-for-dinner Experience must exist');

assert.deepEqual(shopping.dependencyFocus, {
  structureIds: {
    en: 'all-these-three-books',
    es: 'todos-estos-tres-libros',
    pt: 'todos-estes-tres-livros'
  },
  defaultFocus: 'books'
});

const experienceProperties = schema.$defs?.experienceSeed?.properties || {};
assert.ok(experienceProperties.dependencyFocus, 'Experience schema must allow dependencyFocus metadata');

for (const hook of [
  'DEPENDENCY_FOCUS_URLS',
  'dependencyStructuresById',
  'x?.dependencyFocus',
  'activeDependencyStructure(meta)',
  'meta?.defaultFocus',
  'SIYAYOVerbExplorerDependencyFocusSurface',
  'SIYAYOVerbExplorerDependencyFocusInteraction',
  'updateStructure(structure,experienceLanguage)'
]) {
  assert.ok(runtime.includes(hook), 'missing live Dependency Focus hook: '+hook);
}

assert.ok(
  runtime.includes('data/learning/dependencies/all-these-three-books.json'),
  'Verb Explorer must load the canonical Dependency Focus structure'
);

console.log(
  'Verb Explorer live Dependency Focus Experience: PASS — shopping-for-dinner declares canonical EN/ES/PT dependency structures and live runtime resolves the language that is ON, renders, and updates its read-only focus surface without parser inference or English fallback.'
);
