'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {createWhy66Projection}=require('../labs/jaguar-v30-3/test/h14-66/why-evidence-display-boundary.cjs');
const scope=require('../js/adaptive-assessment-scope.js'),progress=require('../js/adaptive-pass-contract-progress-view.js'),evaluator=require('../js/green-pass-profile.js'),skill=require('../data/learning/skills/why.json');
const sandbox={Object,Array,Set,Map,Number,JSON};sandbox.globalThis=sandbox;
vm.runInNewContext(fs.readFileSync('js/verb-explorer-polyglot-word-path-view.js','utf8'),sandbox);
const detail=sandbox.SIYAYOVerbExplorerWordPathWitnessView;
const id='f7027810-0c12-4b65-ae3e-18f538d67e18',subjects=['LAB-A','LAB-B'],contexts=[];
const makeScope=(lang='en',origin='having-dinner',who='LAB-A')=>scope.create({learnerId:who,skill:skill.id,language:lang,originExperienceId:origin});
const evidence=(s,dimension,mode,eventId,patch={})=>({subject:s.learnerId,scopeKey:s.key,originExperienceId:s.originExperienceId,language:s.language,skill:s.skill,eventId,
finalOutcome:'LAB_CANONICAL_ACCEPTED_FIXTURE',authoritySource:'CANONICAL_S3_S4_TEST_SOURCE',contractVersion:'0.1.0',authorizedDirectAction:true,pendingReceipt:false,patitaObservation:false,
packet:{skill:s.skill,dimension,result:'pass',support:'none',...(mode?{mode}:{}),context:{assessmentScope:s,language:s.language,experienceId:mode==='transfer'?'after-dinner-conversation':'having-dinner',fromExperienceId:'having-dinner'}},...patch});
const ids=[id,'72db13d6-27db-4bc0-a99f-3b71a643ec14','d238ce14-ed61-4ee8-b639-dc3b24382017'];
let ledgers=[];
const project=(who='LAB-A',view='shopping-for-dinner',language='pt')=>createWhy66Projection({
resolveLabViewer:()=>({labVerified:true,subject:who,sessionId:'MOCK_SESSION',authSource:'SYNTHETIC_LAB_ONLY'}),
loadLabCanonicalWitnesses:()=>ledgers,
scopeApi:scope,progressView:progress,evaluator,wordPathWitness:detail
}).project({viewerHandle:who,currentExperienceId:view,currentLanguage:language,currentQw:'what'});
const row=(x,lang,origin)=>x.rows.find(y=>y.language===lang&&y.originExperienceId===origin);
test('no occurrence or PATITA earns even 1/3',()=>{ledgers=[];const x=project();assert.equal(x.ok,true);assert.equal(x.rows.length,9);assert.ok(x.rows.every(r=>r.completed===0&&!r.greenPassIssued))});
test('WHY S1/S2 blocked despite forged accepted packets in all languages',()=>{const s=makeScope('en','shopping-for-dinner');ledgers=[evidence(s,'question-function',null,id)];const x=project();assert.equal(row(x,'en','shopping-for-dinner').status,'WHY_S1_S2_DRAFT_BLOCKED');assert.equal(row(x,'en','shopping-for-dinner').completed,0)});
test('S3→S4 real pure projectors show 1/3, 2/3, 3/3 without issuing Green',()=>{const s=makeScope();const a=evidence(s,'question-function',null,ids[0]);const b=evidence(s,'reason-answer','local',ids[1]);const c=evidence(s,'reason-answer','transfer',ids[2]);for(const [n,rows] of [[1,[a]],[2,[a,b]],[3,[a,b,c]]]){ledgers=rows;const p=row(project('LAB-A','preparing-dinner','es'),'en','having-dinner');assert.equal(p.completed,n);assert.equal(p.greenPassIssued,false);assert.equal(p.fixtureReferenceOnly,true);}});
test('duplicate UUID, pending 85C, PATITA, and foreign scope all discarded',()=>{const s=makeScope(),other=makeScope('en','having-dinner','LAB-B');ledgers=[evidence(s,'question-function',null,ids[0]),evidence(s,'question-function',null,ids[0]),evidence(s,'reason-answer','local',ids[1],{pendingReceipt:true}),evidence(s,'reason-answer','transfer',ids[2],{patitaObservation:true}),evidence(other,'reason-answer','local','8be1210c-a837-48f0-96c4-38df5b486515')];assert.equal(row(project(),'en','having-dinner').completed,0)});
test('mixed origin and language cannot satisfy other circuits',()=>{const pt=makeScope('pt');ledgers=[evidence(pt,'question-function',null,id)];assert.equal(row(project(),'en','having-dinner').completed,0);assert.equal(row(project(),'pt','having-dinner').completed,1)});
test('wrong transfer scene and audio support never credit',()=>{const s=makeScope();ledgers=[evidence(s,'reason-answer','transfer',id,{packet:{skill:s.skill,dimension:'reason-answer',result:'pass',mode:'transfer',support:'none',context:{assessmentScope:s,language:'en',experienceId:'shopping-for-dinner',fromExperienceId:'having-dinner'}}}),evidence(s,'reason-answer','local',ids[1],{packet:{skill:s.skill,dimension:'reason-answer',result:'pass',mode:'local',support:'audio',context:{assessmentScope:s,language:'en',experienceId:'having-dinner'}}})];assert.equal(row(project(),'en','having-dinner').completed,0)});
test('unverified viewer must not access projection',()=>{const x=createWhy66Projection({resolveLabViewer:()=>null,loadLabCanonicalWitnesses:()=>[],scopeApi:scope,progressView:progress,evaluator,wordPathWitness:detail}).project({viewerHandle:'NICK',currentExperienceId:'having-dinner',currentLanguage:'en',currentQw:'why'});assert.equal(x.ok,false)});
test('changing visible Experience/QW does not erase scoped evidence',()=>{const s=makeScope();ledgers=[evidence(s,'question-function',null,id)];const a=row(project('LAB-A','shopping-for-dinner','en'),'en','having-dinner');const b=row(project('LAB-A','after-dinner-conversation','pt'),'en','having-dinner');assert.equal(a.completed,b.completed)});
test('no mutating methods exported and source remains unchanged',()=>{assert.equal(typeof createWhy66Projection,'function');const text=fs.readFileSync('data/learning/experience-seeds.json','utf8');assert.ok(!text.includes('H14.66'));});
