#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync('verb-explorer.html','utf8');
const sources=[
'js/adaptive-why-contextual-reason-probe-specification-source.js',
'js/adaptive-why-contextual-reason-probe-result.js',
'js/adaptive-why-contextual-reason-probe-evidence-bridge.js',
'js/adaptive-why-contextual-reason-probe-attempt-boundary.js',
'js/verb-explorer-why-assessment-live.js'];
const positions=sources.map(path=>{
 const needle='<script src="'+path+'"></script>';
 assert.equal(html.split(needle).length-1,1,'missing or duplicate '+path);
 assert.ok(fs.existsSync(path),'missing script: '+path);
 return html.indexOf(needle);
});
assert.ok(positions.every((p,i)=>i===0||p>positions[i-1]),'WHY dependencies must load in order');
assert.ok(positions.at(-1)<html.indexOf('<script src="js/verb-explorer.js"></script>'),'WHY modules must load before Explorer');
const live=fs.readFileSync(sources.at(-1),'utf8');
assert.match(live,/SIYAYOVerbExplorerWhyAssessmentLive/);
assert.match(live,/coordinator\.submitObservedAttempt/);
assert.match(live,/decision\.assessmentScope/);
assert.doesNotMatch(html,/CLOUDFLARE_API_TOKEN|SIYAYO_EVAL08_CF_D1_TOKEN/);
console.log('WHY Explorer wiring GREEN (static): 5 dependencies correctly ordered; no deployment or D1 executed');
