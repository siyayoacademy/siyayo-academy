'use strict';
// An isolated WHY integration must NOT be mistaken for the immutable production handoff.
const assert=require('node:assert/strict');
const {audit}=require('./jaguar-why-production-safety-gate.cjs');
const state=audit();
assert.deepEqual(Array.from(state.problems),['SOURCE_BLOB_DRIFT:verb-explorer.html']);
assert.equal(state.status,'STOP_UNSAFE_RELEASE_PACKAGE');
for(const key of ['readyForProduction','canDeploy','canMerge','canActivateAssessment','mayIssueEvidence'])assert.equal(state[key],false,key);
assert.equal(state.hgOpen,15);assert.equal(state.dgOpen,7);
console.log('WHY isolated integration PASS: expected HTML drift detected; production gate remains STOP; no evidence/deploy/merge');
