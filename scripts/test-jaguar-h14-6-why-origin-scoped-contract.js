#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const seeds=read('data/learning/experience-seeds.json').items;
const registry=read('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const previous=read('data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json');
const skill=read('data/learning/skills/why.json');
const scope=require('../js/adaptive-assessment-scope.js');
const assessmentContract=require('../js/question-word-assessment-contract.js');
const {inspect}=require('./jaguar-h14-6-contract-inspector.js');
const before=JSON.stringify(seeds);
const s1='shopping-for-dinner',s2='preparing-dinner',s3='having-dinner',s4='after-dinner-conversation';
const base={registry,seeds,learnerId:'TEST-LEARNER',language:'en'};
const a=inspect({...base,intent:'start',experienceId:s1});
const b=inspect({...base,intent:'start',experienceId:s2});
const canonical=inspect({...base,intent:'start',experienceId:s3});
assert.ok(a&&b&&canonical);
assert.equal(a.decision,'DRAFT_PENDING_HOMOLOGATION');
assert.equal(b.decision,'DRAFT_PENDING_HOMOLOGATION');
assert.equal(canonical.decision,'EXISTING_CANONICAL_REFERENCE');
assert.equal(a.originExperienceId,s1);assert.equal(b.originExperienceId,s2);
assert.notEqual(a.scopeKey,b.scopeKey);
for(const p of [a,b,canonical]){
 assert.equal(p.canSubmitAttempt,false);assert.equal(p.canCreateEvidence,false);assert.equal(p.canGrantGreenPass,false);assert.equal(p.runtimeDispatch,false);
}
assert.equal(registry.skill,skill.id);
assert.deepEqual(skill.passContract.requires.map(x=>x.dimension+(x.mode?'('+x.mode+')':'')),registry.passRequirements);
assert.equal(registry.contractRegistry.length,3);
assert.equal(registry.contractRegistry[0].localReasonId,previous.contexts[0].acceptedReasonId);
assert.equal(registry.contractRegistry[0].transferReasonId,previous.contexts[1].acceptedReasonId);
const one=scope.create({learnerId:'TEST-LEARNER',skill:registry.skill,language:'en',originExperienceId:s1});
const two=scope.create({learnerId:'TEST-LEARNER',skill:registry.skill,language:'en',originExperienceId:s2});
const three=scope.create({learnerId:'TEST-LEARNER',skill:registry.skill,language:'en',originExperienceId:s3});
const get=(intent,experienceId,originExperienceId,retainedScopes)=>inspect({...base,intent,experienceId,originExperienceId,retainedScopes});
const transfer=get('transfer',s2,s1,[one,two]);
const resumeLocal=get('resume',s2,s2,[one,two]);
const resumeTransfer=get('resume',s2,s1,[one,two]);
const reverse=get('transfer',s1,s2,[one,two]);
const legacy=get('transfer',s4,s3,[three]);
for(const value of [transfer,resumeLocal,resumeTransfer,reverse,legacy])assert.ok(value);
assert.equal(transfer.proposalId,'WHY-S1-S2-DRAFT');
assert.equal(resumeLocal.proposalId,'WHY-S2-S1-DRAFT');
assert.equal(resumeTransfer.proposalId,'WHY-S1-S2-DRAFT');
assert.equal(reverse.proposalId,'WHY-S2-S1-DRAFT');
assert.equal(legacy.proposalId,'WHY-S3-S4-CANONICAL');
assert.notEqual(transfer.scopeKey,resumeLocal.scopeKey);
assert.equal(transfer.scopeKey,resumeTransfer.scopeKey);
assert.equal(legacy.originExperienceId,s3);
// Do not infer either active contract from visiting the same Experience.
assert.equal(get('',s2,s1,[one,two]),null);
assert.equal(get('transfer',s2,'',[one,two]),null);
assert.equal(get('resume',s2,'',[one,two]),null);
assert.equal(get('transfer',s2,s1,[]),null);
assert.equal(get('transfer',s2,s1,[two]),null);
assert.equal(get('resume',s2,s1,[two]),null);
assert.equal(get('start',s2,s1),null);
assert.equal(get('transfer',s3,s2,[two]),null);
assert.equal(get('transfer',s1,s3,[three]),null);
assert.equal(inspect({...base,intent:'start',experienceId:s2,language:'fr'}),null);
assert.equal(inspect({...base,intent:'start',experienceId:s2,learnerId:''}),null);
assert.equal(inspect({...base,intent:'transfer',experienceId:s2,originExperienceId:s1,language:'pt',retainedScopes:[one]}),null);
assert.equal(inspect({...base,intent:'transfer',experienceId:s2,originExperienceId:s1,learnerId:'OTHER-LEARNER',retainedScopes:[one]}),null);
for(const locale of ['en','es','pt']){
 const out=inspect({...base,language:locale,intent:'start',experienceId:s1});
 assert.ok(out,locale);
 assert.notEqual(out.scopeKey,a.scopeKey===out.scopeKey&&locale==='en'?'not-equal':(locale==='en'?'unused':a.scopeKey));
 // Every response is still read-only and cannot score.
 assert.equal(out.canCreateEvidence,false);
}
// Invalid corpus must fail closed; no promotion from just assessmentTarget.
const mutated=structuredClone(seeds);
mutated.find(e=>e.id===s1).thinkingMind.find(q=>q.questionWord==='why').assessmentTarget={skill:registry.skill,definitionPath:'data/learning/skills/why.json'};
assert.equal(inspect({...base,seeds:mutated,intent:'start',experienceId:s1}),null);
const lostSpanish=structuredClone(seeds);
lostSpanish.find(e=>e.id===s2).thinkingMind.find(q=>q.questionWord==='why').presentationGrounding.alternatives[0].response.es='';
assert.equal(inspect({...base,seeds:lostSpanish,intent:'start',experienceId:s1}),null);
const wrongRegistry=structuredClone(registry);
wrongRegistry.contractRegistry[0].transferReasonId='pairs-with-salmon';
assert.equal(inspect({...base,registry:wrongRegistry,intent:'start',experienceId:s1}),null);
for(const name of ['newAssessmentAuthority','newAssessmentEvidence','newGreenPass','runtimeChanges','mainChanges','pr3Changes','cloudflareProductionChanges','workerD1RemoteChanges'])assert.equal(registry[name],false);
assert.equal(registry.requiresHumanHomologation,true);
for(const id of [s1,s2,s3,s4]){
 const q=seeds.find(e=>e.id===id).thinkingMind.find(v=>v.questionWord==='why');
 const target=assessmentContract.targetForSelection(q);
 if(id===s3)assert.equal(target.skill,registry.skill);
 else assert.equal(target,null,'H14.6 study cannot make new WHY targets active');
}
assert.equal(JSON.stringify(seeds),before);
console.log('PASS H14.6 origin-scoped WHY contract study: independent S1/S2 dual-role S2, canonical S3→S4, EN/ES/PT, no auto-credit, fail closed');
