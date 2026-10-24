#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),vm=require('node:vm');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const ledger=read('data/learning/references/jaguar-h14-12-integration-ledger-v0.1.json');
const time=read('data/learning/references/jaguar-h14-12-temporal-context-gate-v0.1.json');
const scenes=read('data/learning/experience-seeds.json').items;
const modeStudy=read('data/learning/references/jaguar-h14-11-mode-contextual-coherence-v0.1.json');
const source=read('data/learning/references/jaguar-h14-10-first-two-practice-pilots-v0.1.json');
function blobSha(buffer){const header=Buffer.from('blob '+buffer.length+'\0');return crypto.createHash('sha1').update(header).update(buffer).digest('hex');}
assert.equal(ledger.assets.length,14);
assert.equal(new Set(ledger.assets.map(x=>x.id)).size,14);
assert.equal(ledger.historicalSequence.length,11);
assert.equal(ledger.requiresAllStagesBeforeProduction,true);
assert.equal(ledger.plannedIntegration.length,6);
for(const a of ledger.assets){
 const bytes=fs.readFileSync(a.path);
 assert.equal(blobSha(bytes),a.gitBlobSha,a.id+' source content changed; manually review ledger before changing baseline');
 assert.equal(a.integratedIntoFinalExplorer,false);
}
assert.equal(time.rows.length,10);assert.equal(time.controlledAxes.pilots,2);
assert.deepEqual(time.controlledAxes.targetTimeFamilies,['PRESENT','PAST','FUTURE','PRESENT_PERIOD','PAST_PERIOD']);
assert.deepEqual(time.controlledAxes.modesAuthoredHere,['AFFIRMATIVE']);
assert.equal(modeStudy.tasks.length,2);assert.equal(source.tasks.length,2);
const actual=Object.fromEntries([...new Set(time.rows.map(x=>x.classification))].map(k=>[k,time.rows.filter(x=>x.classification===k).length]));
assert.deepEqual(actual,{SOURCE_SUPPORTED_REFERENCE:2,CONTEXTUAL_RECONSTRUCTION:1,PREDICTION_ONLY:2,BLOCKED_MISSING_PREMISE:4,SOURCE_SUPPORTED_NON_TARGET_FUNCTION:1});
for(const pilot of source.tasks){
 const subset=time.rows.filter(x=>x.pilot===pilot.id);
 assert.equal(subset.length,5);
 assert.deepEqual(subset.map(x=>x.target),time.controlledAxes.targetTimeFamilies);
 for(const row of subset){
  assert.equal(row.mode,'AFFIRMATIVE');
  if(row.classification==='BLOCKED_MISSING_PREMISE')assert.equal(row.utterance,null);
  else for(const lang of ['en','es','pt'])assert.ok(row.utterance[lang],row.id+' '+lang);
 }
 assert.deepEqual(subset[0].utterance,pilot.contextualPrompt.referenceAnswer);
}
const s2=scenes.find(s=>s.id==='preparing-dinner');
const past=time.rows.find(r=>r.id==='S2-MOVEMENT-PAST');
assert.deepEqual(past.utterance,Object.fromEntries(['en','es','pt'].map(l=>[l,s2.perspectives.narrating.examples[l][0]])));
assert.equal(past.classification,'SOURCE_SUPPORTED_NON_TARGET_FUNCTION');
assert.equal(time.roles.assessmentContractAuthority,false);
assert.equal(time.roles.canonicalEvidence,false);assert.equal(time.roles.greenPass,false);
assert.equal(time.authoritativeChanges.experiences,false);
assert.equal(ledger.assets.some(x=>x.id==='CANONICAL-EXPLORER'),true);
const html=fs.readFileSync('labs/master-vip-time-gate-h14-12/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/);assert.ok(script);new vm.Script(script[1]);
for(const c of time.rows)if(c.utterance)for(const lang of ['en','es','pt'])assert.ok(html.includes(JSON.stringify(c.utterance[lang])),c.id+' '+lang);
for(const label of ['data-time="PRESENT"','data-time="PAST"','data-time="FUTURE"','data-time="PRESENT_PERIOD"','data-time="PAST_PERIOD"','data-lang="en"','data-lang="es"','data-lang="pt"'])assert.ok(html.includes(label),label);
for(const bad of [/fetch\s*\(/,/localStorage/,/sessionStorage/,/indexedDB/,/XMLHttpRequest/,/WebSocket/,/sendBeacon/,/\bsubmitObservedAttempt\b/])assert.doesNotMatch(html,bad);
console.log('PASS H14.12 14 preserved files SHA1 Git blobs, 11 historical stages, 10 temporal gates, EN/ES/PT, blocked periods, zero authority');
