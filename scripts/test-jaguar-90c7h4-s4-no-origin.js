#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('js/verb-explorer.js','utf8');
const origin=js.indexOf("function renderAssessmentEntryNotice(experience)");
const entry=js.slice(origin,js.indexOf('function selectThinkingMindAssessment',origin));
assert.ok(entry.includes("experience?.id==='after-dinner-conversation'&&question?.questionWord==='why'"));
assert.ok(entry.includes("getRetainedProgress?.('why.use.contextual-reason',experienceLanguage)"));
assert.ok(entry.includes("originExperienceId==='having-dinner'"));
for(const word of ['en','es','pt'])assert.ok(entry.includes(word+':{heading:'));
assert.ok(!entry.includes('provider.select('));
assert.ok(!entry.includes('coordinator.clear('));
console.log('PASS 90C7H4 S4 no-origin advisory only; EN ES PT, no evidence or contract writes');
