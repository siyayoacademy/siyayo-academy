#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const source=require('./jaguar-h14-36-phase1-source-review.js');
const manifest=require('../data/learning/references/jaguar-h14-36-main-integration-preflight-v0.1.json');
const originals=require('../data/learning/experience-seeds.json');
const study=require('../data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json');
const baseline=require('./jaguar-h14-35-progressive-homologation.js').build();
const report=source.inspect();
assert.equal(report.status,'PHASE1_SOURCES_VERIFIED_HUMAN_REVIEW_PENDING',JSON.stringify(report.issues));
assert.equal(report.sourceIntegrityMatches,6);
assert.equal(report.packets.length,6);
assert.deepEqual(report.gates,['HG-01','HG-02','HG-03']);
assert.equal(report.teacherHomologations,0);
assert.equal(report.issues.length,0);
assert.equal(baseline.packets.length,6);
for(const p of report.packets){
 const prior=baseline.packets.find(x=>x.experienceId===p.origin&&x.language===p.language);
 assert.ok(prior,'H14.35 source not found');
 assert.equal(p.question,prior.question);
 assert.equal(p.teacherOnlyReference,prior.contextReference.teacherOnlyAnswer);
 assert.equal(p.teacherOnlyContrast,prior.contextReference.teacherOnlyContrast);
 assert.equal(p.noWhichPrerequisite,true);assert.equal(p.noHowPrerequisite,true);
 assert.equal(p.headProbeIsFunctionEvidence,false);
 assert.equal(p.teacherQuestionApproval,null);assert.equal(p.teacherReferentApproval,null);
 assert.equal(p.teacherCausalFunctionApproval,null);assert.equal(p.evidence,false);
 assert.equal(p.assessmentAuthority,false);assert.equal(p.reviewStatus,'NOT_HUMAN_HOMOLOGATED');
}
const s1=report.packets.filter(x=>x.origin==='shopping-for-dinner');
const s2=report.packets.filter(x=>x.origin==='preparing-dinner');
assert.deepEqual(s1.map(x=>x.language),['en','es','pt']);
assert.deepEqual(s2.map(x=>x.language),['en','es','pt']);
assert.ok(s1.every(x=>x.question!==x.genericQuestion),'S1 must override ambiguous referent');
assert.ok(s2.every(x=>x.question===x.genericQuestion),'S2 question is already explicit');
// Corrupted source must fail closed; test uses in-memory copies, NEVER overwrites canonical JSON.
const changed=JSON.parse(JSON.stringify(originals.items));
changed[0].thinkingMind.find(x=>x.questionWord==='why').presentationGrounding.questionOverride.en='Why do you prefer an unknown item?';
const bad1=source.inspect(changed,study);
assert.ok(bad1.issues.some(x=>x.includes('H14_5_TRANSLINGUAL_SOURCE_MISMATCH')&&x.includes(':en:')));
const changedAuthority=JSON.parse(JSON.stringify(originals.items));
changedAuthority[0].thinkingMind.find(x=>x.questionWord==='why').assessmentTarget={id:'must-fail'};
const bad2=source.inspect(changedAuthority,study);
assert.ok(bad2.issues.some(x=>x.includes('INVALID_EXPLORATORY_SOURCE:shopping-for-dinner')));
const badReview=JSON.parse(JSON.stringify(study));
badReview.contexts[1].acceptedReasonId='nonexistent-source';
const bad3=source.inspect(originals.items,badReview);
assert.ok(bad3.issues.some(x=>x.includes('INVALID_EXPLORATORY_SOURCE:preparing-dinner')));
assert.equal(manifest.permissions.canMergeMain,false);
assert.equal(manifest.permissions.canDeployProduction,false);
assert.equal(manifest.permissions.canAuthorizeS1S2Why,false);
assert.equal(manifest.auditSnapshot.behind,1);
assert.equal(manifest.auditSnapshot.mustRefreshAtIntegration,true);
assert.equal(manifest.sourcePins.length,14);
assert.equal(new Set(manifest.sourcePins.map(x=>x.path)).size,14);
const sha=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');};
for(const x of manifest.sourcePins){assert.ok(fs.existsSync(x.path),'MISSING '+x.path);assert.equal(sha(x.path),x.blobSha,'SOURCE DRIFT: '+x.path);}
const code=fs.readFileSync('scripts/jaguar-h14-36-phase1-source-review.js','utf8');
for(const token of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','submitObservedAttempt','dispatchEvent('])assert.equal(code.includes(token),false,token);
console.log('PASS H14.36: six tri-language WHY provenance checks, human gates pending, 14 blob pins, fail-closed drift, no new Evidence');
