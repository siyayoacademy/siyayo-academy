'use strict';
const assert=require('node:assert/strict');
const {audit}=require('./jaguar-h14-43-integration-readiness.js');
const spec=require('../data/learning/references/jaguar-h14-43-selective-integration-manifest-v0.1.json');
assert.equal(audit().status,'HANDOFF_VERIFIED_RUNTIME_NO_GO');
for(const key of ['runtimeIntegration','stagingDeployment','production']){
 const s=structuredClone(spec);s.decision[key]='GO';assert.ok(audit(s).problems.includes('UNSUPPORTED_GO:'+key));
}
for(let i=0;i<7;i++){const s=structuredClone(spec);s.gates[i].status='CLOSED';assert.ok(audit(s).problems.includes('GATE_DRIFT'));}
const changed=structuredClone(spec);changed.inventory[0].gitBlobSha='0'.repeat(40);assert.ok(audit(changed).problems.some(x=>x.startsWith('SOURCE_DRIFT:')));
const allowed=structuredClone(spec);allowed.runtimeApplyAllowlist.push('js/verb-explorer.js');assert.ok(audit(allowed).problems.includes('UNAUTHORIZED_RUNTIME_ALLOWLIST'));
const auth=structuredClone(spec);auth.preservation.mayIssueEvidence=true;assert.ok(audit(auth).problems.includes('PRESERVATION_DRIFT'));
const missing=structuredClone(spec);missing.snapshot.main=null;assert.ok(audit(missing).problems.includes('MISSING_HEAD:main'));
console.log('PASS H14.43 frozen sources, protected paths, seven open gates, no unsupported GO');
