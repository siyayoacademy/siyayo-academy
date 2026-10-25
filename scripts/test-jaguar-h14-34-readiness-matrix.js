#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {project}=require('./jaguar-h14-34-readiness-matrix.js');
const j=project();assert.ok(j);
assert.equal(j.status,'REFERENCE_MATRIX_READY_FOR_STUDY_ONLY');
assert.equal(j.sourceProvenance,'ALL_REFERENCES_PINNED');
assert.deepEqual(j.counts,{capabilities:13,gates:15,openGates:15,realTeacherReviews:0,authorizedNewContracts:0,evidenceFromThisMatrix:0});
assert.equal(j.rows.length,13);assert.deepEqual(j.issues,[]);
assert.equal(new Set(j.rows.map(x=>x.id)).size,13);
assert.equal(new Set(j.rows.flatMap(x=>x.gates.map(g=>g.id))).size,15);
assert.deepEqual(j.languages,['en','es','pt']);
assert.deepEqual(j.experiences,['shopping-for-dinner','preparing-dinner']);
assert.equal(j.existingCanonicalS3S4,'PRESERVED_NOT_REEVALUATED');
for(const x of j.rows){
 assert.equal(x.readyForLiveIntegration,false);assert.equal(x.readyForNewAssessment,false);
 assert.equal(x.ownershipAuthority,'ADVISORY_ONLY');assert.equal(x.evidence,false);
 assert.equal(x.patitaCredit,false);assert.equal(x.greenPass,false);
 for(const gate of x.gates){assert.equal(gate.status!=='HOMOLOGATED',true);assert.ok(gate.requirement);}
}
for(const expected of [
 ['WHY_QUESTION_FUNCTION','HG-03','TASK_AUTHORING_PENDING'],
 ['WHY_LOCAL_REASON','HG-04','TASK_AUTHORING_PENDING'],
 ['WHY_TRANSFER_REASON','HG-05','TASK_AUTHORING_PENDING'],
 ['TWO_REVIEWER','HG-09','REAL_TEACHER_REVIEWS_PENDING'],
 ['MEDIATION','HG-10','REAL_MEDIATION_PENDING'],
 ['PROGRESS_BOUNDARY','HG-11','DESIGN_VERIFIED_NOT_AUTHORITY'],
 ['AUTHORIZED_CONTRACT','HG-13','NOT_AUTHORIZED'],
 ['EXPLORER_RUNTIME','HG-14','NOT_STARTED'],
 ['GEAR_PERIOD','HG-15','GEAR_GAP_OPEN']
]){const x=j.rows.find(x=>x.id===expected[0]);assert.ok(x);assert.equal(x.gates.find(g=>g.id===expected[1]).status,expected[2]);}
assert.equal(j.integrationReady,false);assert.equal(j.canEvaluateFreeText,false);
assert.equal(j.evidenceAuthority,false);assert.equal(j.func13Hidden,true);assert.equal(j.patitaObservationalOnly,true);
const sha=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');};
for(const [p,expected] of Object.entries({
 'data/learning/references/jaguar-h14-33-why-semantic-homologation-reference-v0.1.json':'122599c7e06ed92ccbb877318ec95a3a55b694ad',
 'scripts/jaguar-h14-33-homologation-reference-audit.js':'b54fbb5e0ae1e9a6d41c9593e360aa8ae0388f17',
 'data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json':'143e8692ac7dd5bdbd2de3d4624b0f264db7370d',
 'data/learning/skills/why.json':'cf16e1e879bd236e5199240e350c0c623a2bc3ed',
 'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4'
}))assert.equal(sha(p),expected,'PROTECTED ORIGINAL CHANGED '+p);
const code=fs.readFileSync('scripts/jaguar-h14-34-readiness-matrix.js','utf8');
for(const s of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','submitObservedAttempt','dispatchEvent(','fetch('])assert.ok(!code.includes(s),'unapproved runtime action '+s);
console.log('PASS H14.34: 13 capabilities, 15 mapped gates/open, 2 draft origins; all new assessments & live integration blocked');
