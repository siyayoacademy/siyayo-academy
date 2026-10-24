#!/usr/bin/env node
const fs=require('node:fs'),assert=require('node:assert/strict');
const src=fs.readFileSync('labs/master-vip-existence/index.html','utf8');
const refs=JSON.parse(fs.readFileSync('data/learning/references/master-vip-existence-v0.1.json'));
const candidates=JSON.parse(fs.readFileSync('data/learning/references/master-vip-existence-experience-candidates-v0.1.json')).experienceCandidates;
const cells=JSON.parse(fs.readFileSync('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json')).cells;
assert.match(src,/EXISTENCE · THERE \+ TO BE/);
assert.match(src,/não um exemplo original/);
assert.match(src,/Sem login, sem gravação/);
assert.match(src,/PENDING_HOMOLOGATION/);
assert.match(src,/const state=\{lang:"pt",scene:1,tense:"present",mode:"affirmative"\}/);
assert.match(src,/const paradigms=/);
assert.equal(candidates.length,4);
assert.equal(cells.filter(x=>x.functionId==='existence').length,4);
for(const c of candidates){
 for(const lang of ['en','es','pt'])assert.ok(src.includes(JSON.stringify(c.examples[lang])),c.experienceId+'/'+lang);
}
for(const [tense,modes] of Object.entries(refs.paradigm)){
 if(!['present','past','future','presentPerfect','pastPerfect'].includes(tense))continue;
 for(const mode of ['affirmative','negative','interrogative'])
  for(const part of modes[mode])assert.ok(src.toLowerCase().includes(JSON.stringify(part).toLowerCase()),tense+'/'+mode+'/'+part);
}
assert.doesNotMatch(src,/fetch\(|localStorage|sessionStorage|\bsubmitObservedAttempt\b|indexedDB|\/api\//);
assert.doesNotMatch(src,/navigator\.sendBeacon|WebSocket|EventSource/);
console.log('PASS independent EXISTENCE module: 4 trilingual scenes; Master tense-mode paradigms; no scoring, API, storage or session');
