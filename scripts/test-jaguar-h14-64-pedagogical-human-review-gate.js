'use strict';
const a=require('node:assert/strict');const x=require('./jaguar-h14-64-pedagogical-human-review-gate.js');
const v=x.build();a.equal(v.status,'PEDAGOGICAL_REVIEW_INSTRUMENT_READY_NOT_HOMOLOGATED',JSON.stringify(v.issues));
a.equal(v.tasks.length,18);a.equal(v.trilingualCaseComparisons.length,16);a.equal(v.gates.length,15);
a.ok(v.gates.every(t=>t.closed===false&&t.actualHumanSignoff===null));
a.equal(v.counts.actualHumanReviews,0);a.equal(v.mayHomologate,false);
const t=v.tasks[0];const review=(id,extra={})=>({packetId:t.packetId,dimension:t.dimension,reviewerId:id,role:'PEDAGOGICAL_REVIEWER',causalJudgment:'CAUSALLY_GROUNDED',languageJudgment:'CLEAR',independenceJudgment:'PASS',sourceProvenanceJudgment:'PASS',contextualBand:4,rationale:'Independent contextual judgment requiring real verified teacher review.',observedFacts:['The authored scene grounds the causal referent.'],...extra});
const med={packetId:t.packetId,dimension:t.dimension,mediatorId:'REV_C',role:'PEDAGOGICAL_MEDIATOR',sourceResolution:'GROUNDED_IN_SCENE',proposedCausalJudgment:'PARTIAL_NEEDS_PROBE',rationale:'Independent source-based mediation requiring actual human provenance.',observedFacts:['Both interpretations demand additional contextual inspection.']};
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension}).status,'AWAITING_TWO_REAL_VERIFIED_REVIEWS');
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension,reviews:[review('REV_A'),review('REV_B')]}).status,'TWO_CONSISTENT_CLAIMS_REQUIRES_REAL_IDENTITY_AND_SIGNOFF');
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension,reviews:[review('REV_A'),review('REV_A')]}).status,'INVALID_OR_NONINDEPENDENT_REVIEW');
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension,reviews:[review('REV_A'),review('REV_B',{causalJudgment:'PARTIAL_NEEDS_PROBE'})]}).status,'DIVERGENCE_REQUIRES_INDEPENDENT_MEDIATOR');
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension,reviews:[review('REV_A'),review('REV_B',{causalJudgment:'PARTIAL_NEEDS_PROBE'})],mediation:med}).status,'MEDIATION_CLAIM_REQUIRES_REAL_IDENTITY_AND_SIGNOFF');
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension,reviews:[review('REV_A'),review('REV_B',{causalJudgment:'PARTIAL_NEEDS_PROBE'})],mediation:{...med,mediatorId:'REV_A'}}).status,'INVALID_MEDIATION_PROPOSAL');
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension,reviews:[review('REV_A',{learnerId:'secret'}),review('REV_B')]}).status,'INVALID_OR_NONINDEPENDENT_REVIEW');
a.equal(x.inspect({instrument:v,packetId:t.packetId,dimension:t.dimension,reviews:[review('REV_A'),review('REV_B')],mediation:med}).status,'MEDIATION_NOT_NEEDED_FOR_MATCHING_CLAIMS');
for(const p of v.tasks){a.equal(p.humanHomologation,null);a.equal(p.assessmentAuthority,false);a.equal(p.evidence,false)}
console.log('H14.64 PASS: 18 task review slots; 16 parity comparisons; 15 OPEN HG gates; 0 actual reviews, no Evidence or Green');
