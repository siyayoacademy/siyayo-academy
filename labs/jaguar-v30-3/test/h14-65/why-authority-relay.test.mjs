import test from 'node:test';import assert from 'node:assert/strict';
import {createWhyLabAuthorityRelay} from './why-authority-relay.mjs';
const id='f7027810-0c12-4b65-ae3e-18f538d67e18';
const info={packetId:'H14.63-WHY-S1-S2-DRAFT-en',intent:'start',proof:'LAB_PROOF',actionKey:'ACT-65',eventId:id};
const trusted={ok:true,status:'LAB_PREFLIGHT_REVIEWABLE_NOT_EXECUTABLE',verifiedUsing:'SYNTHETIC_LAB_AUTHORITIES_ONLY',
subject:'SUBJECT_A',skill:'why.use.contextual-reason',language:'en',originExperienceId:'shopping-for-dinner',
currentExperienceId:'shopping-for-dinner',eventId:id,contractId:'LAB_ONLY',contractVersion:'0.1',revision:1,
canStartSession:false,canSubmitAttempt:false,canIssueEvidence:false,canGrantGreenPass:false};
const make=(fn=()=>trusted)=>createWhyLabAuthorityRelay({preflight:{inspect:fn}});
test('6 drafts and zero homologated tasks',()=>{const x=make().describe();assert.equal(x.plans.length,6);assert.equal(x.realTeacherReviews,0);assert.equal(x.canIssueEvidence,false)});
test('synthetic successful preflight still blocks activation',async()=>{const x=await make().inspect(info);assert.equal(x.status,'HUMAN_HOMOLOGATION_AND_RUNTIME_AUTHORITY_BLOCKED');assert.equal(x.canStartSession,false);assert.equal(x.canGrantGreenPass,false);assert.equal(x.transferDimensionCredited,false)});
test('S2-origin start independent of S1 origin',async()=>{const p={...info,packetId:'H14.63-WHY-S2-S1-DRAFT-pt'};const a=await make(request=>({...trusted,language:'pt',originExperienceId:'preparing-dinner',currentExperienceId:'preparing-dinner'})).inspect(p);assert.equal(a.originExperienceId,'preparing-dinner');assert.equal(a.language,'pt')});
test('explicit resume maps S1 origin to S2 without awarding transfer',async()=>{let received;const p={...info,intent:'resume'};const x=await make(req=>{received=req;return {...trusted,currentExperienceId:'preparing-dinner'};}).inspect(p);assert.equal(received.proposal.proposedOriginExperienceId,'shopping-for-dinner');assert.equal(received.proposal.experienceId,'preparing-dinner');assert.equal(x.transferDimensionCredited,false)});
test('cannot inject fabricated human approval',async()=>{const x=await make().inspect({...info,humanApproved:true});assert.equal(x.status,'STOP_INVALID_REQUEST')});
test('cannot inject NICK, contract or identity',async()=>{assert.equal((await make().inspect({...info,nick:'A'})).status,'STOP_INVALID_REQUEST');assert.equal((await make().inspect({...info,subject:'SUBJECT_A'})).status,'STOP_INVALID_REQUEST')});
test('invalid packet and missing proof rejected',async()=>{assert.equal((await make().inspect({...info,packetId:'UNKNOWN'})).status,'STOP_UNKNOWN_OR_UNAPPROVED_PACKET');assert.equal((await make().inspect({...info,proof:null})).status,'STOP_INVALID_REQUEST')});
test('preflight forged success cannot bypass expected context',async()=>{assert.equal((await make(()=>({...trusted,language:'es'})).inspect(info)).status,'STOP_PREFLIGHT_NOT_REVIEWABLE');assert.equal((await make(()=>({...trusted,canIssueEvidence:true})).inspect(info)).status,'STOP_PREFLIGHT_NOT_REVIEWABLE')});
test('failed, throwing, or absent preflight blocked',async()=>{assert.equal((await make(()=>({ok:false})).inspect(info)).status,'STOP_PREFLIGHT_NOT_REVIEWABLE');assert.equal((await make(()=>{throw Error('bad')}).inspect(info)).status,'STOP_LAB_PREFLIGHT_EXCEPTION');assert.throws(()=>createWhyLabAuthorityRelay({}),TypeError)});
test('no proof or subject echoed to consumer',async()=>{const r=await make().inspect(info);assert.equal('subject'in r,false);assert.equal('proof'in r,false);assert.equal('contractId'in r,false)});
console.log('H14.65 isolated WHY referral: no contract activation; zero Evidence');
