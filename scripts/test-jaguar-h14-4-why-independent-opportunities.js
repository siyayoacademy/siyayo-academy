#!/usr/bin/env node
// Regression: original WHY remains green; candidate circuits are diagnosed but never scored.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict');
const get=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const seeds=get('data/learning/experience-seeds.json').items;
const original=JSON.stringify(seeds);
const study=get('data/learning/references/jaguar-h14-4-why-independent-opportunity-readiness-v0.1.json');
const map=get('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json');
const skill=get('data/learning/skills/why.json');
const scope=require('../js/adaptive-assessment-scope.js');
const {inspect}=require('./jaguar-h14-4-why-readiness.js');
assert.equal(study.skill,skill.id);
assert.equal(map.audit.questionSlots,21);
assert.equal(study.candidates.length,3);
assert.deepEqual(study.languageSet,['en','es','pt']);
for(const c of study.candidates){
 const got=inspect({seeds,skill,originExperienceId:c.originExperienceId,transferExperienceId:c.potentialTransferExperienceId});
 assert.ok(got,c.id);
 assert.deepEqual([...got.blockers],c.expectedBlockers,c.id+' blockers');
 assert.equal(got.sourceReasons.local,c.localReasonId,c.id+' local');
 assert.equal(got.sourceReasons.transfer,c.transferReasonId,c.id+' transfer');
 assert.equal(got.producesEvidence,false);
 assert.equal(got.actualLegacyReady,c.classification==='CURRENT_AUTHORIZED');
 for(const lang of study.languageSet)assert.equal(got.languageStatus[lang],c.classification==='CURRENT_AUTHORIZED',c.id+'/'+lang);
 const slot=map.slots.find(s=>s.experienceId===c.originExperienceId&&s.questionWord==='why');
 assert.ok(slot);
 assert.equal(got.currentAssessmentAuthority,slot.assessment.authorizedNewContract);
}
assert.deepEqual(study.candidates.map(c=>c.classification),['CANDIDATE_NOT_AUTHORIZED','CANDIDATE_NOT_AUTHORIZED','CURRENT_AUTHORIZED']);
// Merely adding an assessmentTarget cannot unlock S1/S2 through the current resolver.
for(const c of study.candidates.slice(0,2)){
 const cloned=structuredClone(seeds);
 const origin=cloned.find(e=>e.id===c.originExperienceId);
 const why=origin.thinkingMind.find(q=>q.questionWord==='why');
 why.assessmentTarget={skill:skill.id,definitionPath:'data/learning/skills/why.json'};
 const got=inspect({seeds:cloned,skill,originExperienceId:c.originExperienceId,transferExperienceId:c.potentialTransferExperienceId});
 assert.equal(got.currentAssessmentAuthority,true);
 assert.equal(got.actualLegacyReady,false,'No automatic promotion by assessmentTarget alone');
 assert.ok(got.blockers.length>0);
}
// AssessmentScope is isolated by NICK × skill × language × origin, not by visit order.
const one=scope.create({learnerId:'learner-A',skill:skill.id,language:'en',originExperienceId:'shopping-for-dinner'});
const two=scope.create({learnerId:'learner-A',skill:skill.id,language:'en',originExperienceId:'preparing-dinner'});
const three=scope.create({learnerId:'learner-A',skill:skill.id,language:'en',originExperienceId:'having-dinner'});
const pt=scope.create({learnerId:'learner-A',skill:skill.id,language:'pt',originExperienceId:'shopping-for-dinner'});
const other=scope.create({learnerId:'learner-B',skill:skill.id,language:'en',originExperienceId:'shopping-for-dinner'});
for(const a of [one,two,three,pt,other])assert.ok(scope.valid(a));
assert.equal(new Set([one.key,two.key,three.key,pt.key,other.key]).size,5);
assert.equal(scope.same(one,two),false);assert.equal(scope.same(one,pt),false);
assert.equal(scope.same(one,other),false);
assert.deepEqual(study.authorization,{
 assessmentAuthority:false,assessmentEvidence:false,greenPass:false,
 experiencesExecutableModified:false,activeContractModified:false,patitaModified:false,workerD1Modified:false
});
assert.equal(JSON.stringify(seeds),original,'Audit must not mutate corpus');
console.log('PASS H14.4 WHY opportunities: S1/S2 blocked explicitly, S3→S4 3-language GREEN-compatible, independent scopes and zero inferred evidence');
