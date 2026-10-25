#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const r=require('./jaguar-h14-35-progressive-homologation.js').build();
assert.equal(r.status,'PROGRESSIVE_TEACHER_REVIEW_PACKETS_ONLY');
assert.equal(r.issues.length,0);assert.equal(r.phases.length,4);assert.equal(r.packets.length,6);
assert.equal(new Set(r.phases.flatMap(p=>p.gates.map(g=>g.id))).size,15);
for(const p of r.phases){assert.equal(p.canAutoAdvance,false);assert.equal(p.status,'PENDING_HUMAN_AND_CONTRACT_GATES');}
for(const p of r.packets){assert.ok(p.question&&p.contextReference.teacherOnlyAnswer);assert.equal(p.reviewerDecision,null);assert.equal(p.secondReviewer,null);assert.equal(p.evidence,null);assert.equal(p.assessmentAuthority,false);}
assert.equal(r.integrationProtection.integrationMethod,'SELECTIVE_APPLY_NOT_WHOLE_BRANCH_MERGE');
assert.equal(r.integrationProtection.mainUnchanged,true);assert.equal(r.integrationProtection.func13Hidden,true);
assert.equal(r.newAssessmentAuthority,false);assert.equal(r.evidence,false);
const sha=p=>{let b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');};
for(const [p,expected] of Object.entries({
'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4',
'data/learning/references/jaguar-h14-33-why-semantic-homologation-reference-v0.1.json':'122599c7e06ed92ccbb877318ec95a3a55b694ad',
'scripts/jaguar-h14-34-readiness-matrix.js':'177a97b65bd0ee58a87e943523ab8db3cb535ad0'
}))assert.equal(sha(p),expected,p);
console.log('PASS H14.35: six empty teacher packets; 4 phases; 15 source gates; selective integration protection; zero Evidence');
