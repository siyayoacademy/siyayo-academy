#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const mod=require('./jaguar-h14-33-homologation-reference-audit.js');
const c=mod.contract;
assert.equal(c.status,'REFERENCE_DRAFT_NOT_HOMOLOGATED');
assert.equal(c.homologationGates.length,15);
assert.equal(c.reviewEvidence.realTeacherReviewsCollected,0);
assert.equal(c.reviewEvidence.realTeacherMediationsCollected,0);
assert.equal(c.authorization.canMintEvidence,false);
assert.equal(c.authorization.canEvaluateLearnerText,false);
assert.equal(c.scope.languages.length,3);
assert.equal(c.scope.dimensions.length,3);
const s=mod.inspectSources();assert.equal(s.status,'ALL_REFERENCES_PINNED',JSON.stringify(s.files.filter(x=>!x.matches)));
assert.equal(mod.summary().openGates,15);
const id='H14.28-preparing-dinner-pt-PLAUSIBLE_UNVERIFIED';
const review=(reviewerId,state)=>({caseId:id,experienceId:'preparing-dinner',language:'pt',
 dimension:'reason-answer(local)',reviewerId,role:'TEACHER_REVIEW',state,
 expressionQuality:'CLEAR',contextualBand:null,rationale:'Análise simulada com indicação contextual suficiente'});
const a=review('REV_A','NEEDS_REVIEW'),b=review('REV_B','PARTIAL');
assert.equal(mod.inspectStudyPacket({caseId:id}).status,'AWAITING_TWO_INDEPENDENT_REVIEWS');
assert.equal(mod.inspectStudyPacket({caseId:'UNKNOWN'}).status,'BLOCKED_UNVERIFIED_STUDY_PACKET');
assert.equal(mod.inspectStudyPacket({caseId:id,reviews:[a,b]}).status,'REQUIRES_PEDAGOGICAL_MEDIATION');
const mediator={mediatorId:'MED_C',role:'PEDAGOGICAL_MEDIATOR',proposedState:'PARTIAL',
 proposedExpression:'CLEAR',proposedBand:2,
 rationale:'Parecer demonstrativo fundamentado em fatos do cenário, sem autoridade avaliativa',
 supportingCaseFacts:['A pergunta refere-se ao jantar compartilhado'],sourceStatus:'GROUNDED_IN_SCENE'};
const r=mod.inspectStudyPacket({caseId:id,reviews:[a,b],mediator,simulation:true});
assert.equal(r.status,'MEDIATION_PROPOSAL_ONLY_HOMOLOGATION_PENDING');
assert.equal(r.canHomologate,false);assert.equal(r.canonicalEvidence,false);
const src=fs.readFileSync('scripts/jaguar-h14-33-homologation-reference-audit.js','utf8');
for(const banned of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','submitObservedAttempt','dispatchEvent('])assert.ok(!src.includes(banned));
console.log('PASS H14.33: 6 pinned sources; 15 open gates; simulation and mediation cannot authorize; no Evidence');
