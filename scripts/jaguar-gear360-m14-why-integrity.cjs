#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const source=process.argv[2],integration=process.argv[3];
assert.ok(source&&integration,'Usage: node script <why-source> <integration-tree>');
const read=(root,p)=>fs.readFileSync(path.join(root,p),'utf8');
const files=['js/adaptive-why-contextual-reason-probe-specification-source.js','js/adaptive-why-contextual-reason-probe-result.js','js/adaptive-why-contextual-reason-probe-evidence-bridge.js','js/adaptive-why-contextual-reason-probe-attempt-boundary.js','js/verb-explorer-why-assessment-live.js'];
for(const f of files){assert.equal(read(source,f),read(integration,f),'Source drift in recovered component '+f);}
const scripts=Array.from(read(source,'verb-explorer.html').matchAll(/<script\b[^>]*src=["']([^"']+)/g),m=>m[1]);
const indexes=files.map(f=>scripts.indexOf(f));
assert.ok(indexes.every(n=>n>=0),'WHY components absent from source script loader');
assert.ok(indexes.every((n,i)=>i===0||n>indexes[i-1]),'WHY modules loaded in wrong order');
const driverIndex=scripts.indexOf('js/verb-explorer.js');
assert.ok(driverIndex>indexes[indexes.length-1],'WHY module must load before Explorer driver');
const view=read(integration,'js/verb-explorer-why-assessment-live.js');
assert.match(view,/function mountExploration\(/);
assert.match(view,/!coordinator\|\|!results\|\|!evidenceBridge\|\|!boundary\|\|!events/);
const contract=JSON.parse(read(integration,'data/learning/skills/why.json'));
assert.equal(contract.id,'why.use.contextual-reason');
assert.equal(contract.passContract.requires.length,3);
const targetHtml=read(integration,'verb-explorer.html');
const isWired=files.every(f=>targetHtml.includes(f))&&targetHtml.includes('js/verb-explorer.js');
console.log(JSON.stringify({fiveModulesPreserved:true,orderVerified:true,canonicalContract:true,sourceDriverOrder:driverIndex,integratedDriverWired:isWired,gate:isWired?'REQUIRES_RUNTIME_TEST':'BLOCKED_UNWIRED'},null,2));
if(isWired)console.log('NOTE: wiring alone does not confirm browser rendering or assessment authority');
else console.log('EXPECTED HOLD: integration branch does not yet load these modules; DO NOT promote to main');
