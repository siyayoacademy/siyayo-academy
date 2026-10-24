#!/usr/bin/env node
const fs=require('node:fs'),assert=require('node:assert/strict');
const get=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const seeds=get('data/learning/experience-seeds.json').items;
const study=get('data/learning/references/jaguar-h14-3-why-s1-eligibility-v0.1.json');
const map=get('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json');
const skill=get('data/learning/skills/why.json');
const fidelity=get('data/learning/references/master-vip-source-fidelity-v0.1.json');
const existence=get('data/learning/references/master-vip-existence-v0.1.json');
const s1=seeds.find(e=>e.id===study.focus.experienceId);
const s2=seeds.find(e=>e.id===study.s2Comparator.experienceId);
const s3=seeds.find(e=>e.id===study.existingContract.authorizedOriginExperienceId);
const s4=seeds.find(e=>e.id===study.existingContract.authorizedTransferExperienceId);
assert.ok(s1&&s2&&s3&&s4);
const q=e=>e.thinkingMind.find(x=>x.questionWord==='why');
const s1why=q(s1),s2why=q(s2),s3why=q(s3),s4why=q(s4);
assert.ok(s1why&&s2why&&s3why&&s4why);
assert.equal(s1why.assessmentTarget,undefined);
assert.equal(s2why.assessmentTarget,undefined);
assert.equal(s3why.assessmentTarget.skill,skill.id);
assert.equal(skill.id,study.existingContract.skill);
assert.deepEqual(skill.passContract.requires.map(x=>x.dimension+ (x.mode?'('+x.mode+')':'')),study.existingContract.requires);
assert.equal(s3.toroidalNext.nextExperience,s4.id);
assert.equal(study.s2Comparator.hasStructuredDialogueForms,false);
assert.equal(s2why.dialogueForms,undefined);
assert.equal(s1why.presentationGrounding.referenceReasonId,study.sourceInventory.presentationReasonId);
assert.equal(s2why.presentationGrounding.referenceReasonId,study.s2Comparator.presentationReasonId);
assert.equal(s1why.presentationGrounding.alternatives.length,study.sourceInventory.presentationAlternativeCount);
assert.equal(study.sourceInventory.dialogueFormCount,study.sourceInventory.tenses.length*study.sourceInventory.modes.length);
for(const tense of study.sourceInventory.tenses)for(const mode of study.sourceInventory.modes){
 const form=s1why.dialogueForms[tense][mode];
 assert.ok(form,tense+'/'+mode);
 for(const lang of study.sourceInventory.languages){
  assert.ok(form.question[lang]&&form.response[lang]);
  assert.ok(form.question[lang].includes('?')||form.question[lang].includes('¿'));
  if(mode==='interrogative')assert.ok(form.response[lang].includes('?'),tense+'/'+lang+' interrogative response is question not causal answer');
  else assert.ok(!form.response[lang].includes('?'),tense+'/'+lang+' response must be statement');
 }
}
for(const lang of study.sourceInventory.languages)assert.ok(s1why.presentationGrounding.questionOverride[lang]&&s1why.presentationGrounding.alternatives.every(a=>a.response[lang]));
assert.ok(s1why.dependencyFocus&&s1why.dependencyHeadProbe);
assert.equal(existence.englishPattern,study.masterVip.existencePattern);
assert.ok(fidelity.comparativeAnchors.some(a=>a.function==='existence'&&a.masterOriginal.construction==='THERE + TO BE'));
assert.equal(map.slots.find(x=>x.experienceId===s1.id&&x.questionWord==='why').assessment.entryTarget,null);
assert.equal(map.slots.find(x=>x.experienceId===s2.id&&x.questionWord==='why').assessment.entryTarget,null);
for(const f of ['assessmentAuthority','assessmentEvidence','greenPass','executableChanges'])assert.equal(study[f],false);
assert.equal(study.nextGate,'HUMAN_CONTEXT_AND_CONTRACT_REVIEW');
console.log('PASS H14.3 S1 WHY 9 dialogues/3 languages, S2 exploratory, S3→S4 contract, Master VIP and zero inferred authority');
