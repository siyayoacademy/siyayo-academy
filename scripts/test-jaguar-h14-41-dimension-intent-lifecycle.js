'use strict';
// Specification model checks only. No runtime evaluator or storage adapter.
const assert=require('node:assert/strict');
const s=require('../data/learning/references/jaguar-h14-41-dimension-intent-lifecycle-v0.1.json');
const old=require('../data/learning/references/jaguar-h14-40-durable-idempotency-reconciliation-v0.1.json');
const draft=require('../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
assert.deepEqual(s.storage.primaryKey,old.keyReconciliation.canonical85CPrimaryKey);
assert.equal(s.storage.schemaMigration,false);
assert.ok(Object.values(s.authority).every(x=>x===false));
assert.deepEqual(s.dimensions,draft.passRequirements);
assert.deepEqual(s.intents,draft.intentModel.selectionIntents);
const edges=s.lifecycle.edges;
function reachable(from,to,visited=new Set()){
 if(from===to)return true;
 if(visited.has(from))return false;
 visited.add(from);
 return edges.filter(e=>e[0]===from).some(e=>reachable(e[1],to,visited));
}
// Exploration, rejection and legacy rows cannot reach Evidence, even through intermediate states.
for(const state of ['observed_exploratory','legacy_unbound','decision_rejected'])
 assert.equal(reachable(state,'evidence_committed'),false,state);
assert.deepEqual(edges.filter(e=>e[1]==='evidence_committed'),[['decision_accepted','evidence_committed']]);
assert.deepEqual(edges.filter(e=>e[1]==='decision_accepted'),[['eligible_for_evaluator','decision_accepted']]);
assert.deepEqual(edges.filter(e=>e[1]==='eligible_for_evaluator'),[['awaiting_authority','eligible_for_evaluator']]);
assert.equal(edges.some(e=>e[0]==='pending'&&e[1]==='evidence_committed'),false);
assert.ok(s.lifecycle.guards.eligible_for_evaluator.includes('authorized non-revoked target'));
assert.ok(s.lifecycle.guards.evidence_committed.includes('atomic decision plus Evidence/outbox transaction'));
assert.equal(s.lifecycle.storageReceiptIsEvaluation,false);
for(const field of ['dimension','intent','originExperienceId','currentExperienceId','contractId','contractVersion','assessmentTargetId','actionReference','exposureReference'])
 assert.ok(s.eventBinding.required.includes(field),field);
assert.equal(Object.keys(s.gapDisposition).length,7);
assert.ok(Object.values(s.gapDisposition).every(x=>x.includes('OPEN')));
console.log('PASS H14.41 specification: scope, intent, no implicit credit, guarded lifecycle; no runtime authority');
