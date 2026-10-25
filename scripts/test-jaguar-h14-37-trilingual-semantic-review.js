#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {inspect,LANGUAGES,KINDS}=require('./jaguar-h14-37-trilingual-semantic-review.js');
const source=require('./jaguar-h14-28-semantic-contrast-bank.js');
const report=inspect();
assert.equal(report.status,'TRILINGUAL_REVIEW_READY_NOT_HOMOLOGATED',JSON.stringify(report.issues));
assert.deepEqual(report.counts,{experiences:2,languages:3,reviewPackets:6,syntheticCases:48,semanticTriplets:16,realHumanReviews:0,gatesHomologated:0,integrationsAuthorized:0});
assert.deepEqual(report.gates,['HG-06','HG-07','HG-08']);assert.equal(report.issues.length,0);
assert.equal(new Set(report.packets.map(p=>p.id)).size,6);
for(const p of report.packets){
 assert.ok(p.question&&p.teacherOnlyReference&&p.teacherOnlyContrast);
 assert.equal(p.humanSemanticHomologation,false);
 assert.equal(p.hg06,null);assert.equal(p.hg07,null);assert.equal(p.hg08,null);
 assert.equal(p.cases.length,8);assert.deepEqual(p.cases.map(x=>x.kind),KINDS);
 for(const c of p.cases){
  assert.ok(c.text&&c.teacherGuidanceDraft);
  assert.equal(c.reviewStatus,'AWAITING_HUMAN_REVIEW');
  assert.equal(c.semanticEquivalenceApproval,null);
  assert.equal(c.languageQualityApproval,null);
  assert.equal(c.contextualGroundingApproval,null);
  assert.equal(c.evidence,false);assert.equal(c.automaticAcceptance,false);
 }
 const echo=p.cases.find(x=>x.kind==='MODEL_ECHO');
 assert.equal(echo.text,p.teacherOnlyReference);
 const paraphrase=p.cases.find(x=>x.kind==='GROUNDED_PARAPHRASE');
 assert.notEqual(paraphrase.text,p.teacherOnlyReference);
}
for(const t of report.triplets){
 assert.equal(t.caseIds.length,3);assert.deepEqual(t.languageOrder,LANGUAGES);
 assert.equal(t.humanReviewRequired,true);
 assert.equal(t.teacherCrossLanguageMeaningApproval,null);
 assert.equal(t.teacherGroundingApproval,null);
 assert.equal(t.canonicalEvidence,false);
}
assert.equal(report.integration.approvalForSelectiveMerge,false);
assert.equal(report.integration.mainUntouched,true);
const corrupted=source.cases.map(c=>c.experienceId==='preparing-dinner'&&c.language==='es'&&c.caseKind==='MODEL_ECHO'?{...c,response:'Una respuesta inventada'}:c);
const negative=inspect({bankCases:corrupted});
assert.ok(negative.issues.some(e=>e.includes('MODEL_ECHO_NOT_SOURCE_REFERENCE')));
const missing=inspect({bankCases:source.cases.filter(c=>!(c.experienceId==='shopping-for-dinner'&&c.language==='pt'&&c.caseKind==='PARTIAL_REASON'))});
assert.ok(missing.issues.some(e=>e.includes('CASE_KIND_COVERAGE')));
const sha=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
for(const [p,expected] of Object.entries({
 'scripts/jaguar-h14-28-semantic-contrast-bank.js':'d89952862273595870a305e553ab14c025b12d70',
 'scripts/jaguar-h14-29-semantic-risk-audit.js':'bcf4c7d9c2aae8872e4c1a33597059160e19bf4c',
 'scripts/jaguar-h14-30-supervised-semantic-protocol.js':'ea5b602bfe7ae4bd75211d0bb271eec0a0a8e4bf',
 'scripts/jaguar-h14-36-phase1-source-review.js':'fe9c9816b056cddefc97733f7676a93f191cd656',
 'data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json':'fd0836b271ad957e1a4e4b9f30eeb65e333c25ab'
}))assert.equal(sha(p),expected,'PROTECTED SOURCE DRIFT '+p);
const own=fs.readFileSync('scripts/jaguar-h14-37-trilingual-semantic-review.js','utf8');
for(const bad of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','dispatchEvent(','submitObservedAttempt'])assert.ok(!own.includes(bad));
console.log('PASS H14.37: 6 packets, 48 synthetic cases, 16 trilingual triplets; human approval fields null; fail-closed drift, no Evidence');
