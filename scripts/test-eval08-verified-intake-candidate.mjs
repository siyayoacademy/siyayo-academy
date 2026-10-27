import test from 'node:test';
import assert from 'node:assert/strict';
import {createVerifiedAssessmentIntakeCandidate} from '../server/assessment/eval08-verified-intake-candidate.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const corpus=require('../data/learning/experience-seeds.json').items;
const skill=require('../data/learning/skills/why.json');
const now=1800000000;
const id='f7027810-0c12-4b65-ae3e-18f538d67e18';
const session={verified:true,issuerVerified:true,subject:'SUBJECT_A',sessionId:'SESSION_A',revoked:false,expiresAt:now+600};
const originalAction={source:'DIRECT_LEARNER_ACTION',observed:true,actor:'learner',subject:'SUBJECT_A',sessionId:'SESSION_A',
 eventId:id,actionKey:'A-68',consumed:false,recordedAt:now-5,language:'en',questionWord:'why',skill:skill.id,
 originExperienceId:'having-dinner',currentExperienceId:'having-dinner',
 phase:'local',dimension:'reason-answer',mode:'local',support:'none'};
const contract={authorized:true,revoked:false,subject:'SUBJECT_A',sessionId:'SESSION_A',
 id:'CONTRACT_WHY_S3',version:'0.1.0',revision:1,expiresAt:now+500,
 skill:skill.id,language:'en',originExperienceId:'having-dinner',currentExperienceId:'having-dinner',
 definitionPath:'data/learning/skills/why.json',phase:'local',passContract:skill.passContract};
const verifiedVerdict={result:'pass',skill:skill.id,language:'en',dimension:'reason-answer',mode:'local',
 experienceId:'having-dinner',support:'none',provenanceId:'LAB-JUDGE-1'};
const request={sessionHandle:'HANDLE_A',actionKey:'A-68',eventId:id};
function mock({sessionPatch={},actionPatch={},contractPatch={},verdictPatch={},writerPatch={}}={}){
 let writerCalls=0,evalCalls=0,contractCalls=0;
 const adapter=createVerifiedAssessmentIntakeCandidate({
  now:()=>now,
  resolveVerifiedSession:async()=>({...session,...sessionPatch}),
  resolveDirectAction:async()=>({...originalAction,...actionPatch}),
  resolveAuthorizedContract:async context=>{contractCalls++;return {...contract,...contractPatch};},
  assessAuthorizedAction:async context=>{evalCalls++;return {...verifiedVerdict,...verdictPatch};},
  commitAtomicAssessment:async context=>{writerCalls++;
   const expected=context.packet.result==='pass'?'accepted':'rejected';
   return {atomic:true,eventId:id,outcome:expected,attemptRecorded:true,
     evidenceCreated:context.packet.result==='pass',...writerPatch};
  }
 });
 return {adapter,counters:()=>({writerCalls,evalCalls,contractCalls})};
}
test('authorized WHY S3 local stores one accepted packet, never self-issues Green',async()=>{
 const x=mock(),out=await x.adapter.submit(request);
 assert.equal(out.status,'COMMITTED_INJECTED_WRITER');
 assert.equal(out.ok,true);assert.equal(out.outcome,'accepted');
 assert.equal(out.greenPassIssued,false);
 assert.equal(x.counters().writerCalls,1);
});
test('transfer WHY S3→S4 holds S3 origin while accepting only next scene',async()=>{
 const m=mock({actionPatch:{currentExperienceId:'after-dinner-conversation',phase:'transfer',mode:'transfer'},
  contractPatch:{currentExperienceId:'after-dinner-conversation',phase:'transfer'},
  verdictPatch:{experienceId:'after-dinner-conversation',mode:'transfer'}});
 const x=await m.adapter.submit(request);
 assert.equal(x.ok,true);assert.match(x.scopeKey,/having-dinner/);
});
test('WHY S1 and S2 are blocked before reaching evaluator or writer',async()=>{
 for(const origin of ['shopping-for-dinner','preparing-dinner']){
  const m=mock({actionPatch:{originExperienceId:origin,currentExperienceId:origin}});
  const x=await m.adapter.submit(request);
  assert.equal(x.reason,'no_authorized_authored_target');
  assert.equal(m.counters().writerCalls,0);assert.equal(m.counters().evalCalls,0);
 }
});
test('WHAT S1 declared start uses a separately approved contract (all QW gated)',async()=>{
 const actionPatch={originExperienceId:'shopping-for-dinner',currentExperienceId:'shopping-for-dinner',
    skill:'what.use.object-question',questionWord:'what',dimension:'question-function',mode:'local'};
 const item=corpus.find(e=>e.id==='shopping-for-dinner').thinkingMind.find(q=>q.questionWord==='what');
 const m=mock({actionPatch,contractPatch:{id:'CONTRACT_WHAT_S1',skill:actionPatch.skill,
   originExperienceId:'shopping-for-dinner',currentExperienceId:'shopping-for-dinner',
   definitionPath:item.assessmentTarget.definitionPath,passContract:{requires:[{dimension:'question-function',result:'pass'}]}},
   verdictPatch:{skill:actionPatch.skill,dimension:'question-function',experienceId:'shopping-for-dinner'}});
 assert.equal((await m.adapter.submit(request)).ok,true);
});
test('WHERE transfer S1→S2 respects authored resume only and independent EN/ES/PT',async()=>{
 const target=corpus[0].thinkingMind.find(q=>q.questionWord==='where');
 for(const lang of ['en','es','pt']){
 const a=mock({actionPatch:{originExperienceId:'shopping-for-dinner',currentExperienceId:'preparing-dinner',phase:'transfer',language:lang,skill:target.assessmentTarget.skill,questionWord:'where',dimension:'location-answer',mode:'transfer'},
  contractPatch:{id:'CONTRACT_WHERE',skill:target.assessmentTarget.skill,language:lang,
    originExperienceId:'shopping-for-dinner',currentExperienceId:'preparing-dinner',phase:'transfer',
    definitionPath:target.assessmentTarget.definitionPath,passContract:{requires:[{dimension:'location-answer',result:'pass'}]}},
  verdictPatch:{skill:target.assessmentTarget.skill,language:lang,dimension:'location-answer',mode:'transfer',experienceId:'preparing-dinner'}});
 assert.equal((await a.adapter.submit(request)).ok,true,'WHERE '+lang);
 }
});
test('foreign identity/session, revoked and expired fail closed',async()=>{
 const patches=[{sessionPatch:{verified:false}},{sessionPatch:{issuerVerified:false}},
 {sessionPatch:{subject:'SUBJECT_B'}},{sessionPatch:{sessionId:'SESSION_B'}},
 {sessionPatch:{revoked:true}},{sessionPatch:{expiresAt:now}}];
 for(const patch of patches){const m=mock(patch);const r=await m.adapter.submit(request);
 assert.equal(r.ok,false);assert.equal(m.counters().writerCalls,0);}
});
test('PATITA, indirect audio, replay and wrong event never count as direct action',async()=>{
 const patches=[{source:'PATITA_OBSERVATION'},{actor:'patita'},{observed:false},
 {consumed:true},{support:'audio'},{eventId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'}];
 for(const patch of patches){const m=mock({actionPatch:patch});
 const r=await m.adapter.submit(request);
 assert.equal(r.ok,false);assert.equal(m.counters().writerCalls,0);}
});
test('contract absent/revoked/mismatched origin, version or authorization blocked',async()=>{
 const patches=[{authorized:false},{revoked:true},{subject:'SUBJECT_B'},{sessionId:'OTHER'},
 {language:'es'},{originExperienceId:'shopping-for-dinner'},{currentExperienceId:'preparing-dinner'},
 {definitionPath:'data/learning/skills/wrong.json'},{revision:0},{expiresAt:now},{passContract:{requires:[]}}];
 for(const contractPatch of patches){const m=mock({contractPatch});
 const r=await m.adapter.submit(request);assert.equal(r.reason,'contract_not_authorized');assert.equal(m.counters().writerCalls,0);}
});
test('untrusted request cannot submit subject, answer, score, evaluator or pass',async()=>{
 for(const field of [{subject:'SUBJECT_A'},{nick:'NICK'},{correct:true},{greenPass:true},
  {assessmentTarget:'why'},{answerText:'because ...'}]){
 const m=mock();const r=await m.adapter.submit({...request,...field});
 assert.equal(r.reason,'invalid_request');assert.equal(m.counters().writerCalls,0);
 }
});
test('evaluator unable to meet authorized contract is denied before writer',async()=>{
 const a=mock({verdictPatch:{dimension:'invented'}});
 assert.equal((await a.adapter.submit(request)).reason,'evaluator_invalid_result');
 assert.equal(a.counters().writerCalls,0);
 const b=mock({verdictPatch:{mode:'bogus'}});assert.equal((await b.adapter.submit(request)).ok,false);
});
test('failed answer may be recorded atomically but creates no Evidence or Green',async()=>{
 const m=mock({verdictPatch:{result:'fail'}});
 const r=await m.adapter.submit(request);assert.equal(r.ok,true);assert.equal(r.outcome,'rejected');
 assert.equal(r.evidenceCreated,false);assert.equal(r.greenPassIssued,false);
});
test('pending receipts or non-atomic writing cannot become canonical success',async()=>{
 for(const writerPatch of [{atomic:false},{outcome:'pending'},{evidenceCreated:false},{attemptRecorded:false}]){
 const m=mock({writerPatch});const r=await m.adapter.submit(request);
 assert.equal(r.reason,'no_confirmed_atomic_commit');
 assert.equal(r.evidenceCreated,false);
 }
});
test('no adapter calls after malformed request and missing adapters rejected',async()=>{
 const m=mock();
 assert.equal((await m.adapter.submit({...request,eventId:'invalid'})).reason,'invalid_request');
 assert.deepEqual(m.counters(),{writerCalls:0,evalCalls:0,contractCalls:0});
 assert.throws(()=>createVerifiedAssessmentIntakeCandidate({}),TypeError);
});
test('read-only protected deployment: neither S1/S2 WHY nor production changes',()=>{
 const seeds=corpus;
 for(const e of seeds.filter(e=>['shopping-for-dinner','preparing-dinner'].includes(e.id))){
  const why=e.thinkingMind.find(q=>q.questionWord==='why');
  assert.equal(why.assessmentTarget,undefined);
 }
 const release=require('../data/learning/references/siyayo-why-production-release-candidate-v0.1.json');
 assert.equal(release.allow_cloudflare_deploy,false);
 assert.equal(release.evidence_authorized,false);
});
console.log('EVAL-08 intake candidate: direct action, scoped contract, synthetic atomic writer; no deployment, no unauthorized S1/S2 WHY.');
