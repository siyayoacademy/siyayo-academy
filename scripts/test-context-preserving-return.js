#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');
const html = fs.readFileSync(path.join(ROOT, 'verb-explorer.html'), 'utf8');

for (const state of [
  'currentExperienceId',
  'experienceLanguage',
  'experienceTense',
  'experienceForm',
  'experienceQuestion',
  'experiencePerspective',
  'experienceChoiceCandidate',
  'experienceWordType',
  'experienceNounId',
  'experienceAdjectiveId',
  'lineOffset'
]) {
  assert.ok(runtime.includes(state), `missing experience state variable: ${state}`);
}

assert.ok(html.includes('data-mode="dna"'), 'missing VERB DNA mode control');
assert.ok(html.includes('data-mode="experience"'), 'missing EXPERIENCE return control');
assert.ok(html.includes('id="dnaView"'), 'missing dnaView');
assert.ok(html.includes('id="experienceView"'), 'missing experienceView');

assert.ok(runtime.includes('button.dataset.mode==="dna"'), 'missing DNA mode branch');
assert.ok(runtime.includes('document.getElementById("dnaView").hidden=false'), 'DNA branch must reveal dnaView');
assert.ok(runtime.includes('document.getElementById("experienceView").hidden=true'), 'DNA branch must hide experienceView');

const modeHandlerStart = runtime.indexOf('document.querySelectorAll(".explorer-mode").forEach(b=>b.onclick=');
assert.notEqual(modeHandlerStart, -1, 'missing explorer mode handler');
const modeHandler = runtime.slice(modeHandlerStart, modeHandlerStart + 900);
assert.ok(modeHandler.includes('const exp=b.dataset.mode==="experience"'), 'mode handler must derive EXPERIENCE state');
assert.ok(modeHandler.includes('document.getElementById("dnaView").hidden=exp'), 'EXPERIENCE branch must hide dnaView');
assert.ok(modeHandler.includes('document.getElementById("experienceView").hidden=!exp'), 'EXPERIENCE branch must reveal experienceView');
assert.ok(modeHandler.includes('if(exp)renderExperience()'), 'EXPERIENCE return must render from retained state');
assert.ok(!modeHandler.includes('goToExperience('), 'mode return must not reset the active experience');

console.log('PASS — 6.5 closes EXPERIENCE → VERB DNA → EXPERIENCE.');
console.log('PASS — returning to EXPERIENCE reuses retained contextual state instead of resetting it.');
