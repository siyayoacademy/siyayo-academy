#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const p=require('./jaguar-h14-31-two-reviewer-consistency.js');
const form=require('./jaguar-h14-31-review-form.js');
assert.equal(p.referenceCaseIds.length,48);
assert.equal(form.cases.length,48);
assert.equal(new Set(form.cases.map(x=>x.caseId)).size,48);
for(const c of form.cases){assert.equal(c.firstReview,null);assert.equal(c.secondReview,null);
 assert.equal(c.adjudication,null);assert.equal(c.canonicalProgress,null);
 assert.equal(c.authorizedEvidence,false);assert.equal(c.authoredDemonstration,true);}
const id=(exp,lang,kind)=>'H14.28-'+exp+'-'+lang+'-'+kind;
const s1='shopping-for-dinner',s2='preparing-dinner';
const sample=(caseId,state,expressionQuality,contextualBand,reviewerId)=>({
 caseId,experienceId:caseId.includes(s1)?s1:s2,
 language:caseId.split('-').slice(-2)[0],dimension:caseId.endsWith('FUNCTION_PARAPHRASE')?'question-function':'reason-answer(local)',
 reviewerId,role:'TEACHER_REVIEW',state,expressionQuality,contextualBand,
 rationale:'Synthetic demonstration rationale; never a real learner rating'
});
const a=id(s1,'en','GROUNDED_PARAPHRASE'),
b=id(s1,'es','MINOR_LANGUAGE_ERROR'),
c=id(s2,'pt','OFF_CONTEXT'),
d=id(s2,'en','PLAUSIBLE_UNVERIFIED'),
e=id(s1,'pt','MODEL_ECHO'),
f=id(s2,'es','PARTIAL_REASON'),
g=id(s2,'en','FUNCTION_PARAPHRASE');
const inputs=[
 {caseId:a,reviews:[sample(a,'COHERENT','CLEAR',4,'SIM_A'),sample(a,'COHERENT','CLEAR',4,'SIM_B')]},
 {caseId:b,reviews:[sample(b,'COHERENT','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS',4,'SIM_A'),sample(b,'COHERENT','CLEAR',4,'SIM_B')]},
 {caseId:c,reviews:[sample(c,'INCOHERENT','CLEAR',0,'SIM_A'),sample(c,'PARTIAL','CLEAR',2,'SIM_B')]},
 {caseId:d,reviews:[sample(d,'NEEDS_REVIEW','CLEAR',null,'SIM_A'),sample(d,'NEEDS_REVIEW','CLEAR',null,'SIM_B')]},
 {caseId:e,reviews:[sample(e,'NEEDS_REVIEW','CLEAR',null,'SIM_A'),sample(e,'NEEDS_REVIEW','CLEAR',null,'SIM_B')]},
 {caseId:f,reviews:[sample(f,'PARTIAL','CLEAR',2,'SIM_A'),sample(f,'PARTIAL','CLEAR',4,'SIM_B')]},
 {caseId:g,reviews:[sample(g,'COHERENT','CLEAR',4,'SIM_A'),sample(g,'COHERENT','CLEAR',4,'SIM_B')]}
];
for(const entry of inputs)assert.ok(entry.reviews.every(r=>p.validReview(r,require('./jaguar-h14-30-supervised-semantic-protocol.js').cases.find(x=>x.id===r.caseId))));
const results=inputs.map(x=>p.inspect(x.caseId,x.reviews));
assert.equal(results[0].status,'CONSISTENT_REVIEWS_PENDING_HOMOLOGATION');
assert.equal(results[1].status,'NEEDS_LANGUAGE_ADJUDICATION');
assert.equal(results[2].status,'NEEDS_SEMANTIC_ADJUDICATION');
assert.equal(results[3].status,'NEEDS_SOURCE_OR_INDEPENDENCE_REVIEW');
assert.equal(results[4].status,'NEEDS_SOURCE_OR_INDEPENDENCE_REVIEW');
assert.equal(results[5].status,'NEEDS_SEMANTIC_ADJUDICATION');
assert.equal(results[6].status,'CONSISTENT_REVIEWS_PENDING_HOMOLOGATION');
for(const x of results){assert.equal(x.assessmentAuthority,false);assert.equal(x.evidence,false);assert.equal(x.finalGrade,null);assert.equal(x.canonicalProgress,null);}
assert.equal(p.inspect(a,[]).status,'AWAITING_SECOND_INDEPENDENT_REVIEW');
assert.equal(p.inspect(a,[inputs[0].reviews[0]]).status,'AWAITING_SECOND_INDEPENDENT_REVIEW');
assert.equal(p.inspect('nonexistent',[]).status,'UNKNOWN_REFERENCE');
assert.equal(p.inspect(a,[inputs[0].reviews[0],{...inputs[0].reviews[1],reviewerId:'SIM_A'}]).status,'INVALID_REVIEW_SET');
assert.equal(p.inspect(a,[{...inputs[0].reviews[0],dimension:'reason-answer(transfer)'},inputs[0].reviews[1]]).status,'INVALID_REVIEW_SET');
assert.equal(p.inspect(a,[{...inputs[0].reviews[0],learnerId:'PRIVATE'},inputs[0].reviews[1]]).status,'INVALID_REVIEW_SET');
assert.equal(p.inspect(a,[{...inputs[0].reviews[0],contextualBand:5},inputs[0].reviews[1]]).status,'INVALID_REVIEW_SET');
const aggregate=p.compareBatch(inputs);
assert.equal(aggregate.cases,7);assert.equal(aggregate.pairedReviews,7);
assert.equal(aggregate.exactSemanticAgreement,6);assert.equal(aggregate.exactExpressionAgreement,6);
assert.equal(aggregate.needsAdjudication,5);
assert.equal(aggregate.scoringAuthority,false);assert.equal(aggregate.evidence,false);
const missing=p.compareBatch([{caseId:a,reviews:[]}]);
assert.equal(missing.pairedReviews,0);assert.equal(missing.exactSemanticAgreement,0);
const sha=f=>{const b=fs.readFileSync(f);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex')};
for(const [f,hash] of Object.entries({
 'scripts/jaguar-h14-30-supervised-semantic-protocol.js':'ea5b602bfe7ae4bd75211d0bb271eec0a0a8e4bf',
 'scripts/jaguar-h14-29-semantic-risk-audit.js':'bcf4c7d9c2aae8872e4c1a33597059160e19bf4c',
 'scripts/jaguar-h14-28-semantic-contrast-bank.js':'d89952862273595870a305e553ab14c025b12d70',
 'data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json':'fd0836b271ad957e1a4e4b9f30eeb65e333c25ab',
 'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4'
}))assert.equal(sha(f),hash,'protected original drift '+f);
for(const file of ['scripts/jaguar-h14-31-review-form.js','scripts/jaguar-h14-31-two-reviewer-consistency.js']){
 const source=fs.readFileSync(file,'utf8');
 for(const x of ['createEvidence(','recordOutcome(','localStorage','sessionStorage','submitObservedAttempt','dispatchEvent('])assert.ok(!source.includes(x),file+' forbidden '+x);
}
console.log('PASS H14.31: 48 blank reviews; 7 explicitly simulated two-reviewer comparisons; disagreements and missing reviews gated; 0 evidence');
