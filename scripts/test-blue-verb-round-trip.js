#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');

const ROOT = path.resolve(__dirname, '..');
const runtime = fs.readFileSync(path.join(ROOT, 'js/verb-explorer.js'), 'utf8');

assert.ok(runtime.includes('function openVerbDna(verbId)'), 'missing canonical Blue Verb DNA opener');
assert.ok(runtime.includes('verbs.findIndex(verb=>verb.id===verbId)'), 'Blue Verb must resolve the canonical verb by id');
assert.ok(runtime.includes('renderVerb(index)'), 'Blue Verb must render the resolved canonical verb');
assert.ok(runtime.includes('data-sentence-verb-id'), 'sentence verb must carry its canonical verb id');
assert.ok(runtime.includes('openVerbDna(part.dataset.sentenceVerbId)'), 'sentence Blue Verb must reopen DNA from its canonical id');

const modeHandlerStart = runtime.indexOf('document.querySelectorAll(".explorer-mode").forEach(b=>b.onclick=');
assert.notEqual(modeHandlerStart, -1, 'missing EXPERIENCE/DNA mode handler');
const modeHandler = runtime.slice(modeHandlerStart, modeHandlerStart + 900);
assert.ok(modeHandler.includes('if(exp)renderExperience()'), 'return to EXPERIENCE must rerender retained experience state');
assert.ok(!modeHandler.includes('goToExperience('), 'return must not reset the experience before another Blue Verb visit');

const livingLinesHandlerStart = runtime.indexOf('document.getElementById("livingLines").onclick=');
assert.notEqual(livingLinesHandlerStart, -1, 'missing living sentence navigation handler');
const livingLinesHandler = runtime.slice(livingLinesHandlerStart, livingLinesHandlerStart + 700);
assert.ok(livingLinesHandler.includes('if(axis==="verb")'), 'living sentence must preserve the verb navigation branch');
assert.ok(livingLinesHandler.includes('openVerbDna(part.dataset.sentenceVerbId)'), 'repeated Blue Verb visits must use the same canonical id route');

console.log('PASS — 6.6 makes the Blue Verb route repeatable after returning to EXPERIENCE.');
console.log('PASS — repeated EXPERIENCE ↔ VERB DNA visits remain canonical and context-preserving.');
