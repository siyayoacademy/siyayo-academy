#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const spec=read('data/learning/references/jaguar-h14-17-func13-design-contract-v0.1.json');
const {inspect}=require('./jaguar-h14-17-func13-fine-study.js');
assert.equal(spec.id,'FUNC-13');assert.equal(spec.surfaces.length,3);
assert.equal(spec.feature.defaultOff,true);assert.equal(spec.feature.finalHtmlPlacement,'UNDECIDED');
assert.equal(spec.visibility.noRuntimeChangeThisElo,true);assert.equal(spec.guardrails.noEvidence,true);
const counts={SOURCE_CLOSE:0,BRIDGE:0,CONTRAST:0};let n=0;
for(const e of spec.axes.experiences)for(const f of spec.axes.functions)for(const p of spec.axes.perspectives){
 for(const l of spec.axes.languages){const r=inspect(e,f,p,l);assert.ok(r,e+f+p+l);assert.equal(r.assessmentAuthority,false);assert.equal(r.approvedExercise,false);assert.equal(r.newQuestion,null);assert.equal(r.newResponse,null);assert.ok(r.masterPattern);assert.ok(r.functionAdaptation);assert.ok(r.contextLines.length);}
 const r=inspect(e,f,p,'en');counts[r.semanticReview]++;n++;
}
assert.equal(n,80);assert.deepEqual(counts,{SOURCE_CLOSE:1,BRIDGE:57,CONTRAST:22});
assert.equal(inspect('having-dinner','state','describing','fr'),null);
assert.equal(read('data/learning/references/jaguar-h14-14-preservation-extension-v0.1.json').h1414.defaultOff,true);
console.log('PASS H14.17 80 reference relationships/240 language views, three design surfaces, default-off, zero evaluation authority');
