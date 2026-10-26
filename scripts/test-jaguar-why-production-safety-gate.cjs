'use strict';
const assert=require('node:assert/strict');
const {audit}=require('./jaguar-why-production-safety-gate.cjs');
const input=require('../data/learning/references/siyayo-why-production-release-candidate-v0.1.json');
const dup=()=>structuredClone(input);
const base=audit();
assert.equal(base.status,'PRE_PRODUCTION_SAFETY_GATE_VERIFIED__LIVE_NO_GO',JSON.stringify(base.problems));
assert.equal(base.problems.length,0);
assert.equal(base.canDeploy,false);
assert.equal(base.canMerge,false);
assert.equal(base.canActivateAssessment,false);
assert.equal(base.mayIssueEvidence,false);
assert.equal(base.hgOpen,15);
assert.equal(base.dgOpen,7);
for(const [key,value,expected] of [
 ['allow_cloudflare_deploy',true,'DEPLOY_UNBLOCKED'],
 ['allow_main_merge',true,'MAIN_MERGE_UNBLOCKED'],
 ['evidence_authorized',true,'EVIDENCE_UNBLOCKED'],
 ['production_ready',true,'PRODUCTION_READY_CLAIMED'],
 ['release_mode','DEPLOY','UNSAFE_RELEASE_MODE']
]){const j=dup();j[key]=value;assert.ok(audit(j).problems.includes(expected),expected);}
let t=dup();t.blockers.pedagogy[0].status='CLOSED';assert.ok(audit(t).problems.includes('GATE_UNEXPECTED_CLOSURE:HG-01'));
t=dup();t.blockers.technical[2].verified_technical_attestation='forged';assert.ok(audit(t).problems.includes('GATE_UNEXPECTED_CLOSURE:DG-03'));
t=dup();t.executable_changes.push('js/verb-explorer.js');assert.ok(audit(t).problems.includes('EXECUTABLE_CHANGES_PRESENT'));
t=dup();t.comparison_snapshot.diff_complete=true;assert.ok(audit(t).problems.includes('DIFF_COMPLETENESS_CLAIMED'));
t=dup();t.source_head='0'.repeat(40);assert.ok(audit(t).problems.includes('SOURCE_HEAD_DRIFT'));
t=dup();t.hard_rules.patita_observation_cannot_credit=false;assert.ok(audit(t).problems.includes('PROTECTION_DRIFT:patita_observation_cannot_credit'));
console.log('SIYAYO WHY RELEASE CHECK PASS — source integrity preserved; 15 HG and 7 DG remain OPEN; deployment is blocked safely.');
