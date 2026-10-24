#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const data=require('./jaguar-h14-29-semantic-risk-audit.js');
assert.equal(data.status,'STUDY_ONLY_NOT_A_GRADER');
assert.deepEqual(data.counts,{cases:48,comparisonPairs:24,falseNegativeRisks:12,falsePositiveRisks:18,ambiguities:12,dimensionConfusions:6});
const counts=Object.fromEntries([...new Set(data.cases.map(c=>c.riskClass))].map(k=>[k,data.cases.filter(x=>x.riskClass===k).length]));
assert.deepEqual(counts,{FALSE_NEGATIVE:12,AMBIGUITY:12,FALSE_POSITIVE:18,DIMENSION_CONFUSION:6});
for(const c of data.cases){
 assert.equal(c.proposedBand,null);assert.equal(c.acceptanceDecision,'DEFER_TO_HUMAN_REVIEW');
 assert.equal(c.assessmentAuthority,false);assert.equal(c.evidence,false);assert.equal(c.greenPass,false);assert.equal(c.learnerObserved,false);
 if(c.caseKind==='MINOR_LANGUAGE_ERROR')assert.equal(c.protectiveRule,'SEPARATE_LANGUAGE_FROM_SEMANTICS');
 if(c.caseKind==='PLAUSIBLE_UNVERIFIED')assert.equal(c.protectiveRule,'NO_NEW_FACTS_WITHOUT_GROUNDING');
 if(c.caseKind==='MODEL_ECHO')assert.equal(c.protectiveRule,'EXACT_MATCH_NOT_INDEPENDENCE_PROOF');
}
for(const p of data.comparisonPairs){assert.ok(data.cases.some(x=>x.id===p.firstCaseId));assert.ok(data.cases.some(x=>x.id===p.secondCaseId));assert.equal(p.canonicalScore,null);}
const hash=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
assert.equal(hash('scripts/jaguar-h14-28-semantic-contrast-bank.js'),'d89952862273595870a305e553ab14c025b12d70');
assert.equal(hash('data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json'),'fd0836b271ad957e1a4e4b9f30eeb65e333c25ab');
const source=fs.readFileSync('scripts/jaguar-h14-29-semantic-risk-audit.js','utf8');
for(const token of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','submitObservedAttempt','dispatchEvent('])assert.ok(!source.includes(token));
assert.equal(data.policy.noAutomaticScores,true);assert.equal(data.policy.noEvidence,true);
console.log('PASS H14.29: 48 cases, 24 contextual comparisons, no automatic grades or Evidence; sources intact');
