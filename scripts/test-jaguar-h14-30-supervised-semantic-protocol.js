#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const p=require('./jaguar-h14-30-supervised-semantic-protocol.js');
assert.equal(p.cases.length,48);assert.equal(p.counts.feedbackDrafts,48);
assert.deepEqual(p.counts.states,{COHERENT:18,PARTIAL:6,NEEDS_REVIEW:12,INCOHERENT:12});
for(const c of p.cases){assert.ok(c.feedbackDraft);assert.equal(c.decisionAuthority,'HUMAN_REVIEW_REQUIRED');
 assert.equal(c.semanticBand,null);assert.equal(c.canonicalProgress,null);assert.equal(c.evidence,false);
 assert.equal(c.assessment,false);assert.equal(c.greenPass,false);}
for(const lang of ['en','es','pt'])for(const exp of ['shopping-for-dinner','preparing-dinner']){
 const group=p.cases.filter(c=>c.language===lang&&c.experienceId===exp);
 assert.equal(group.length,8);assert.deepEqual(group.map(c=>c.hypothesis),['COHERENT','COHERENT','PARTIAL','INCOHERENT','INCOHERENT','NEEDS_REVIEW','COHERENT','NEEDS_REVIEW']);
}
assert.equal(p.requirements.contextualZeroToFourSeparate,true);
assert.equal(p.requirements.contractZeroToThreeSeparate,true);
assert.equal(p.requirements.teacherMayOverrideAllHypotheses,true);
const hash=f=>{const b=fs.readFileSync(f);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
assert.equal(hash('scripts/jaguar-h14-29-semantic-risk-audit.js'),'bcf4c7d9c2aae8872e4c1a33597059160e19bf4c');
assert.equal(hash('scripts/jaguar-h14-28-semantic-contrast-bank.js'),'d89952862273595870a305e553ab14c025b12d70');
for(const s of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','submitObservedAttempt','dispatchEvent('])assert.ok(!fs.readFileSync('scripts/jaguar-h14-30-supervised-semantic-protocol.js','utf8').includes(s));
console.log('PASS H14.30: 48 teacher-facing feedback drafts, four supervised states, 0 Evidence and 0 automatic learner grades');
