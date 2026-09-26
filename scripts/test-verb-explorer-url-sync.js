#!/usr/bin/env node

const fs = require('fs');
const assert = require('assert/strict');

const runtime = fs.readFileSync('js/verb-explorer.js','utf8');

for (const hook of [
  'function syncExplorerRoute(mode,experienceId,options)',
  'url.searchParams.set("mode",normalizedMode)',
  'url.searchParams.set("experience",experienceId)',
  'window.history[method]',
  'syncExplorerRoute("experience",id);renderExperience()',
  'syncExplorerRoute("dna",currentExperienceId)',
  'syncExplorerRoute(exp?"experience":"dna",currentExperienceId)',
  'window.addEventListener("popstate",applyInitialRoute)'
]) {
  assert.ok(runtime.includes(hook), 'missing URL sync hook: '+hook);
}

assert.ok(
  runtime.includes('if(normalizedMode==="experience"&&!canonical)return false'),
  'Experience URL sync must refuse non-canonical Experience IDs'
);

assert.ok(
  runtime.includes('if(route.experienceId)currentExperienceId=route.experienceId'),
  'Back/Forward route application must restore the canonical Experience ID'
);

assert.ok(
  runtime.includes('document.getElementById("dnaView").hidden=exp') &&
  runtime.includes('document.getElementById("experienceView").hidden=!exp'),
  'Back/Forward route application must restore the visible mode'
);

console.log('PASS — URL sync tracks active Experience and browser history restores mode + canonical Experience.');
