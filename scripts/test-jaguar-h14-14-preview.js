#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),crypto=require('node:crypto'),vm=require('node:vm');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const old=read('data/learning/references/jaguar-h14-12-integration-ledger-v0.1.json');
const ext=read('data/learning/references/jaguar-h14-14-preservation-extension-v0.1.json');
const sha=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
assert.equal(old.assets.length,14);assert.equal(ext.newTrackedAssets.length,11);
for(const item of [...old.assets,...ext.newTrackedAssets]){
 const actual=sha(fs.readFileSync(item.path));
 if(item.path==='scripts/jaguar-h14-13-specialized-mirror-reference.js'){
  assert.equal(item.gitBlobSha,'560b03298159678d44f61629fd3a3bc284103a9e','historic H14.13 SHA remains in ledger');
  assert.equal(actual,'676ec4181e42e3b28a4a56ca830f99b207048696','H14.15 intentionally updated shared policy SHA');
 }else assert.equal(actual,item.gitBlobSha,'DRIFT '+item.path);
}
const html=fs.readFileSync('verb-explorer.html','utf8'),script=fs.readFileSync('js/verb-explorer-h14-14-preview.js','utf8'),css=fs.readFileSync('css/verb-explorer-h14-14-preview.css','utf8');
assert.ok(html.includes('id="h14SpecializedPreview" class="h14-specialized-preview" hidden'));
assert.ok(html.indexOf('id="h14SpecializedPreview"')>html.indexOf('class="experience-grid"'));
assert.ok(html.indexOf('id="h14SpecializedPreview"')<html.indexOf('id="learningTrailWordPathModule"'));
assert.equal((html.match(/data-h14-function=/g)||[]).length,5);
assert.ok(html.includes('js/verb-explorer-h14-14-preview.js')&&html.includes('css/verb-explorer-h14-14-preview.css'));
assert.ok(css.includes('@media(max-width:650px)'));
new vm.Script(script);
const {project}=require('../js/verb-explorer-h14-14-preview.js');
const es=read('data/learning/experience-seeds.json').items,matrix=read('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json');
let count=0;
for(const exp of es)for(const cell of matrix.cells.filter(c=>c.experienceId===exp.id))for(const p of ['describing','narrating','debating','concluding'])for(const lang of ['en','es','pt']){
 const x=project(exp,cell,lang,p,'present','affirmative');assert.ok(x);
 assert.deepEqual(x.source,exp.perspectives[p].examples[lang]);
 assert.equal(x.assessmentAuthority,false);assert.equal(x.evidenceProduced,false);assert.equal(x.greenPass,false);
 assert.equal(project(exp,cell,lang,p,'past','negative').example,null);
 count++;
}
assert.equal(count,240);
assert.ok(script.includes("new URLSearchParams(root.location.search).get('h14_14')!=='preview'"));
for(const forbidden of ['localStorage','sessionStorage','submitObservedAttempt','recordOutcome(','createEvidence('])assert.ok(!script.includes(forbidden),'Forbidden '+forbidden);
assert.equal(ext.security.assessmentWrites,false);assert.equal(ext.h1414.defaultOff,true);
console.log('PASS H14.14 25 blobs guarded, 240 source references, opt-in only, 0 evidence');
