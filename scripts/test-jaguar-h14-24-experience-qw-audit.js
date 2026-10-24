#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {audit,TOROIDAL_QWS,LANGUAGES}=require('./jaguar-h14-24-experience-qw-audit.js');
const contract=require('../js/question-word-assessment-contract.js');
const coherence=require('../js/verb-explorer-contextual-coherence.js');
const source=fs.readFileSync('data/learning/experience-seeds.json');
const experiences=JSON.parse(source).items;
const report=audit({experiences,questionContract:contract,coherence});
assert.ok(report);
assert.deepEqual(report.counts,{experiences:4,questionSlots:21,languageViews:63,
 declaredEntries:5,resumeOnly:2,opportunityOnly:14,unregisteredExperienceQwPairs:35,fullToroidalCandidates:56});
assert.equal(report.anomalies.length,0);
assert.deepEqual(experiences.map(x=>x.thinkingMind.length),[6,7,4,4]);
assert.deepEqual(experiences.map(x=>report.slots.filter(y=>y.experienceId===x.id).length),[6,7,4,4]);
assert.equal(LANGUAGES.length,3);assert.equal(TOROIDAL_QWS.length,14);
const entries=report.slots.filter(x=>x.entryDeclared).map(x=>x.experienceId+':'+x.questionWord);
assert.deepEqual(entries,[
 'shopping-for-dinner:what','shopping-for-dinner:where','shopping-for-dinner:which',
 'preparing-dinner:what','having-dinner:why']);
const resume=report.slots.filter(x=>x.resumeOnly).map(x=>x.experienceId+':'+x.questionWord);
assert.deepEqual(resume,['preparing-dinner:where','preparing-dinner:which']);
for(const s of report.slots){
 const exp=experiences.find(x=>x.id===s.experienceId),q=exp.thinkingMind.find(x=>x.questionWord===s.questionWord),actual=contract.inspect(q,null);
 assert.equal(s.status,actual.status);
 assert.equal(s.declaredAssessmentSkill,actual.assessmentSkill);
 assert.equal(s.approval.newContractAuthorized,false);
 for(const l of LANGUAGES){
  const v=report.views.find(x=>x.experienceId===s.experienceId&&x.questionWord===s.questionWord&&x.language===l);
  assert.ok(v);
  assert.equal(v.questionText,typeof q.question?.[l]==='string'&&q.question[l].trim()?q.question[l].trim():null);
  assert.equal(v.canAwardEvidence,false);
  assert.equal(v.canGrantGreenPass,false);
  if(s.questionWord==='why'){
   const derived=coherence.resolve({question:q,language:l,tense:'present',form:'affirmative'});
   assert.equal(v.contextualAnswer,derived.status==='grounded'?derived.response:null);
   if(v.contextualAnswer)assert.equal(v.contextualAnswerProvenance,derived.source);
  }else{
   assert.equal(v.contextualAnswer,null,'other QWs cannot borrow WHY source');
  }
 }
}
for(const v of report.unregistered){
 assert.ok(!experiences.find(x=>x.id===v.experienceId).thinkingMind.some(q=>q.questionWord===v.questionWord));
 assert.equal(v.assessmentGenerated,false);
 assert.equal(v.questionGenerated,false);
}
assert.equal(report.slots.filter(x=>x.questionWord==='why').length,4);
for(const id of ['shopping-for-dinner','preparing-dinner']){
 const s=report.slots.find(x=>x.experienceId===id&&x.questionWord==='why');
 assert.ok(s.sourceFlags.presentationGrounding);assert.equal(s.entryDeclared,false);
}
assert.equal(report.slots.find(x=>x.experienceId==='having-dinner'&&x.questionWord==='why').entryDeclared,true);
for(const qw of ['how-far','how-often'])assert.equal(report.slots.filter(x=>x.questionWord===qw).length,0);
const gitSha=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
for(const [file,sha] of Object.entries({
 'data/learning/experience-seeds.json':'9a7165df76aed1b3b726c8198311027e024e91c4',
 'js/question-word-assessment-contract.js':'13d361054ca4cdb7a930aabb707b383f5041d733',
 'js/verb-explorer-contextual-coherence.js':'6219a57623c10583b5f0e8ee5f7e2d137a040b19',
 'data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json':'143e8692ac7dd5bdbd2de3d4624b0f264db7370d'
}))assert.equal(gitSha(fs.readFileSync(file)),sha,'SOURCE DRIFT '+file);
assert.equal(gitSha(fs.readFileSync('data/learning/experience-seeds.json')),gitSha(source));
assert.equal(report.assessmentAuthority,false);assert.equal(report.patitaWrite,false);
console.log('PASS H14.24: 21 QW slots, 63 localized views, 5 declared entries, 2 resumptions, 35 unregistered pairs, no new authority; 4 pinned blobs');
