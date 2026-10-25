#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {mediate}=require('./jaguar-h14-32-pedagogical-mediation.js');
const id='H14.28-preparing-dinner-pt-PLAUSIBLE_UNVERIFIED';
const review=(reviewerId,state)=>({caseId:id,experienceId:'preparing-dinner',language:'pt',
 dimension:'reason-answer(local)',reviewerId,role:'TEACHER_REVIEW',state,
 expressionQuality:'CLEAR',contextualBand:null,rationale:'Revisão simulada com análise do cenário e do referente'});
const reviews=[review('TEACHER_A','NEEDS_REVIEW'),review('TEACHER_B','PARTIAL')];
const base={mediatorId:'MEDIATOR_C',role:'PEDAGOGICAL_MEDIATOR',proposedState:'PARTIAL',
 proposedExpression:'CLEAR',proposedBand:2,
 rationale:'O cenário não comprova a premissa apresentada, sendo necessária verificação contextual',
 supportingCaseFacts:['A pergunta se refere à preparação compartilhada do jantar'],
 sourceStatus:'GROUNDED_IN_SCENE'};
assert.equal(mediate({caseId:id,reviews}).status,'AWAITING_MEDIATOR');
assert.equal(mediate({caseId:id,reviews,mediator:{...base,sourceStatus:'UNVERIFIED'}}).status,'UNRESOLVED_SOURCE_PREMISE');
assert.equal(mediate({caseId:id,reviews,mediator:{...base,mediatorId:'TEACHER_A'}}).status,'INVALID_MEDIATION');
assert.equal(mediate({caseId:id,reviews:[reviews[0]],mediator:base}).status,'BLOCKED_REVIEW_SET');
assert.equal(mediate({caseId:id,reviews,mediator:{...base,proposedState:'COHERENT',sourceStatus:'CONTRADICTED'}}).status,'UNRESOLVED_SOURCE_PREMISE');
const outcome=mediate({caseId:id,reviews,mediator:base});
assert.equal(outcome.status,'MEDIATION_PROPOSAL_RECORDED');assert.equal(outcome.decision.status,'PEDAGOGICAL_PROPOSAL_ONLY');
assert.equal(outcome.evidence,false);assert.equal(outcome.assessmentAuthority,false);assert.equal(outcome.greenPass,false);assert.equal(outcome.canonicalProgress,null);
const hash=p=>{const b=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
assert.equal(hash('scripts/jaguar-h14-31-two-reviewer-consistency.js'),'1a7254c5df8169c36b41161ab6136dea3bbeb067');
assert.equal(hash('data/learning/experience-seeds.json'),'9a7165df76aed1b3b726c8198311027e024e91c4');
console.log('PASS H14.32: third-party mediated decision, source guard, invalid-set guard, no Evidence or score');
