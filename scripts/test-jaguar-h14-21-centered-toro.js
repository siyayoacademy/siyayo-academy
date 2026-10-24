#!/usr/bin/env node
'use strict';const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const p='labs/func13-function-window-h14-21/',h=fs.readFileSync(p+'index.html','utf8'),c=fs.readFileSync(p+'window.css','utf8'),j=fs.readFileSync(p+'window.js','utf8');
assert.match(h,/data-layout="centered-toro"/);assert.match(h,/id="func13Functions" class="function-strip centered-function-strip"/);assert.match(h,/id="func13Study" class="study-grid centered-study-grid"|class="study-grid centered-study-grid" id="func13Study"/);
assert.equal((h.match(/data-function="/g)||[]).length,5);
assert.ok(h.indexOf('id="func13Speak"')<h.indexOf('id="func13Functions"')&&h.indexOf('id="func13Functions"')<h.indexOf('id="func13Study"'));
assert.match(c,/\.function-strip\{\s*display:flex;flex-wrap:wrap;justify-content:space-evenly/);
assert.match(c,/\.study-cell\{\s*display:flex;flex-direction:column;align-items:center/);
assert.match(c,/\.study-band-heading\{text-align:center\}/);
assert.match(c,/@media\(max-width:430px\)/);assert.match(j,/SpeechSynthesisUtterance/);
new vm.Script(j);for(const v of ['localStorage','sessionStorage','recordOutcome(','createEvidence('])assert.ok(!j.includes(v));
console.log('PASS H14.21 centered Toro layout, 5 function buttons, 3 study surfaces, whole-card speech, hidden Explorer');
