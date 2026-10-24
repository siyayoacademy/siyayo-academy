#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const {audit,LANGUAGES,ORIGINS}=require('./jaguar-h14-25-why-s1-s2-fine-review.js');
const experiments=read('data/learning/experience-seeds.json').items,study=read('data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json'),
 draft=read('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json'),
 map=read('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json'),
 coherence=require('../js/verb-explorer-contextual-coherence.js');
const priorInventory={slots:map.slots.map(x=>({experienceId:x.experienceId,questionWord:x.questionWord,
 status:x.assessment.entryTarget?'ASSESSMENT_DECLARED':x.assessment.resumeTarget?'ASSESSMENT_RESUME_ONLY':'OPPORTUNITY_ONLY'}))};
const r=audit({experiences:experiments,coherence,study,draft,priorInventory});
assert.ok(r);assert.deepEqual(r.counts,{origins:2,languages:3,referenceViews:6,issues:0,newAuthorizedAssessments:0});
assert.equal(ORIGINS.length,2);assert.deepEqual(LANGUAGES,['en','es','pt']);
const sourceHash=buffer=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+buffer.length+'\0'),buffer])).digest('hex');
for(const [p,expected] of Object.entries({
 'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4',
 'data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json':'143e8692ac7dd5bdbd2de3d4624b0f264db7370d',
 'js/verb-explorer-contextual-coherence.js':'6219a57623c10583b5f0e8ee5f7e2d137a040b19'
}))assert.equal(sourceHash(fs.readFileSync(p)),expected,'PRIOR SOURCE MODIFIED: '+p);
for(const c of r.cases){
 const exp=experiments.find(e=>e.id===c.experienceId),q=exp.thinkingMind.find(x=>x.questionWord==='why'),p=q.presentationGrounding;
 assert.equal(c.referenceAnswer,p.alternatives.find(x=>x.id===p.referenceReasonId).response[c.language]);
 assert.equal(c.contrastText,p.alternatives.find(x=>x.id===c.contrastReasonId).response[c.language]);
 assert.equal(c.authority.assessment,false);assert.equal(c.authority.evidence,false);
 assert.equal(c.authority.greenPass,false);assert.equal(c.authority.patitaWrite,false);
 assert.equal(c.transfer.status,'DRAFT_NOT_AUTHORIZED');
 assert.equal(c.transfer.explicitOriginAndIntentRequired,true);
 assert.equal(c.transfer.noForcedVisitSequence,true);
 assert.equal(c.grammar.resolverStatuses['present::affirmative'],'grounded');
 for(const tense of ['present','past','future'])for(const mode of ['affirmative','negative','interrogative']){
  if(tense==='present'&&mode==='affirmative')continue;
  assert.equal(c.grammar.resolverStatuses[tense+'::'+mode],'not-authored',
    'dialogueForms must not silently grant causal assessment: '+c.experienceId+' '+tense+'/'+mode);
 }
 assert.equal(c.grammar.independentLearnerReasonAnswerAuthored,false);
 assert.equal(c.review.masterVipRole,'WHY_ASKS_REASON_NOT_HOW_MANNER');
}
const s1=r.cases.filter(x=>x.experienceId==='shopping-for-dinner'),s2=r.cases.filter(x=>x.experienceId==='preparing-dinner');
assert.deepEqual(s1.map(x=>x.language),['en','es','pt']);
assert.deepEqual(s2.map(x=>x.language),['en','es','pt']);
assert.ok(s1.every(x=>x.genericQuestion!==x.displayReferenceQuestion),'S1 must explicitly resolve "this one"');
assert.ok(s1.every(x=>x.referent.status==='EXPLICIT_IN_PRESENTATION_OVERRIDE'&&!x.referent.priorWhichAssessmentRequired));
assert.ok(s2.every(x=>x.genericQuestion===x.displayReferenceQuestion));
assert.ok(s1.every(x=>x.grammar.s1DialogueFormsSeparateFromCausalAnswer));
assert.ok(s2.every(x=>!x.grammar.s1DialogueFormsSeparateFromCausalAnswer));
assert.equal(s2.find(x=>x.language==='es').referenceAnswer,'Porque prepararla juntos nos permite compartir la experiencia.');
assert.equal(s2.find(x=>x.language==='pt').referenceAnswer,'Porque prepará-lo juntos nos permite compartilhar essa experiência.');
assert.equal(s1.find(x=>x.language==='pt').referenceAnswer,'Porque o queijo fresco e suave combina bem com o salmão.');
assert.equal(draft.contractRegistry.find(x=>x.id==='WHY-S3-S4-CANONICAL').status,'EXISTING_CANONICAL_UNCHANGED');
assert.equal(r.canonicalS3S4Untouched,true);
const bad=JSON.parse(JSON.stringify(experiments));bad[0].thinkingMind.find(x=>x.questionWord==='why').assessmentTarget={skill:'why.use.contextual-reason',definitionPath:'data/learning/skills/why.json'};
const reject=audit({experiences:bad,coherence,study,draft,priorInventory});
assert.equal(reject.cases.length,3);assert.ok(reject.issues.some(x=>x.id==='shopping-for-dinner'));
console.log('PASS H14.25: 6 tri-language S1/S2 WHY references, explicit referents, mode/tense fail-closed, dual-origin draft separate, S3-S4 unchanged, no authority');
