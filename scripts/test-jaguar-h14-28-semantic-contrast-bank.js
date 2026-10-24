#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const bank=require('./jaguar-h14-28-semantic-contrast-bank.js');
const rubric=require('../data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json');
assert.equal(bank.totalCases,48);
assert.equal(bank.cases.length,48);assert.equal(bank.scenarioCount,2);
assert.equal(new Set(bank.cases.map(x=>x.id)).size,48);
const kinds=['GROUNDED_PARAPHRASE','MINOR_LANGUAGE_ERROR','PARTIAL_REASON','OFF_CONTEXT','MANNER_INSTEAD_OF_REASON','PLAUSIBLE_UNVERIFIED','FUNCTION_PARAPHRASE','MODEL_ECHO'];
for(const context of ['shopping-for-dinner','preparing-dinner'])for(const language of ['en','es','pt']){
 const a=bank.cases.filter(x=>x.experienceId===context&&x.language===language);
 assert.deepEqual(a.map(x=>x.caseKind),kinds);
 for(const c of a){assert.ok(c.response&&c.teacherMeaningAnchor);assert.equal(c.proposedBand,null);
 assert.equal(c.canonicalProgress,null);assert.equal(c.notAutomaticallyAccepted,true);
 assert.equal(c.authority.assessment,false);assert.equal(c.authority.evidence,false);
 assert.equal(c.authority.greenPass,false);assert.equal(c.authority.patitaCredit,false);}
 assert.equal(a.find(x=>x.caseKind==='GROUNDED_PARAPHRASE').semanticTag,'HIGH_CONTEXTUAL_FIT');
 assert.equal(a.find(x=>x.caseKind==='MINOR_LANGUAGE_ERROR').expressionQuality,'UNDERSTANDABLE_WITH_LANGUAGE_ERRORS');
 assert.equal(a.find(x=>x.caseKind==='PLAUSIBLE_UNVERIFIED').semanticTag,'NEEDS_CONTEXT_EVIDENCE');
 assert.equal(a.find(x=>x.caseKind==='MODEL_ECHO').semanticTag,'REFERENCE_ECHO_INDEPENDENCE_UNKNOWN');
 assert.equal(a.find(x=>x.caseKind==='FUNCTION_PARAPHRASE').dimension,'question-function');
 assert.notEqual(a[0].response,rubric.tasks.find(x=>x.experienceId===context).localized[language].teacherOnly.illustrativeFunctionalParaphrase);
}
assert.equal(bank.policy.noExactStringMatching,true);
assert.equal(bank.policy.unverifiedPremiseNotAutoAccepted,true);
assert.equal(bank.policy.noNewEvidence,true);
const code=fs.readFileSync('scripts/jaguar-h14-28-semantic-contrast-bank.js','utf8');
for(const s of ['localStorage','sessionStorage','createEvidence(','recordOutcome(','submitObservedAttempt','dispatchEvent('])assert.ok(!code.includes(s));
const hash=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
assert.equal(hash('data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json'),'fd0836b271ad957e1a4e4b9f30eeb65e333c25ab');
assert.equal(hash('data/learning/experience-seeds.json'),'9a7165df76aed1b3b726c8198311027e024e91c4');
console.log('PASS H14.28: 48 trilingual human-review examples in eight contrast kinds, no automatic score or evidence');
