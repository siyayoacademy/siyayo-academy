import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {verifyFixtureIdentityAssertion} from '../h14-54/fixture-identity-verifier.mjs';
import {createLabReferralPreflight} from './referral-preflight.mjs';
const now=1800000000,key='H14.61 local unit test signing fixture key only';
const eventId='f7027810-0c12-4b65-ae3e-18f538d67e18';
const proposal={experienceId:'having-dinner',questionWord:'why',language:'en',skill:'why.use.contextual-reason',
definitionPath:'data/learning/skills/why.json',proposedOriginExperienceId:'having-dinner',
proposalKind:'START_PROPOSAL_UNVERIFIED',authorized:false,serverVerified:false,actionVerified:false,
maySubmitAttempt:false,mayStartSession:false,mayIssueEvidence:false,mayGrantGreenPass:false,automaticForward:false};
const claims={issuer:'SIYAYO_TEST_ISSUER',audience:'SIYAYO_H1454_LAB',subject:'subject-A',
sessionHandle:'synthetic-session',sessionId:'SYNTHETIC_SERVER_SESSION',actionKey:'ACT-61',eventId,intent:'start',
issuedAt:now-10,notBefore:now-10,expiresAt:now+100};
function sign(c=claims,k=key){let p=Buffer.from(JSON.stringify(c)).toString('base64url');return p+'.'+createHmac('sha256',k).update(p).digest('base64url')}
const session={subject:'subject-A',sessionId:claims.sessionId,revoked:false,expiresAt:now+1000};
const action={source:'DIRECT_LEARNER_ACTION',subject:'subject-A',sessionId:claims.sessionId,eventId,actionKey:'ACT-61',intent:'start',
consumed:false,recordedAt:now-5,experienceId:'having-dinner',questionWord:'why',language:'en',skill:proposal.skill,originExperienceId:'having-dinner'};
const target={skill:proposal.skill,definitionPath:proposal.definitionPath,mode:'start',originExperienceId:'having-dinner'};
const contract={authorized:true,revoked:false,subject:'subject-A',skill:proposal.skill,language:'en',originExperienceId:'having-dinner',
currentExperienceId:'having-dinner',intent:'start',definitionPath:proposal.definitionPath,contractId:'LAB-CONTRACT',contractVersion:'0.1',revision:1,expiresAt:now+1000};
function setup(over={}){let calls=0;const adapters={
now:()=>now,
verifyAssertion:(proof,time)=>verifyFixtureIdentityAssertion({proof,key,issuer:claims.issuer,audience:claims.audience,now:time}),
resolveSession:async()=>({...session,...over.session}),
resolveAction:async()=>({...action,...over.action}),
resolveCanonicalTarget:async()=>({...target,...over.target}),
resolveContract:async()=>({...contract,...over.contract}),
resolveOrigin:async()=>({valid:true,subject:'subject-A',skill:proposal.skill,language:'en',originExperienceId:'having-dinner',
destinationExperienceId:'having-dinner',contractId:'LAB-CONTRACT',revision:1,...over.origin})
};return createLabReferralPreflight(adapters)}
const input={proposal,proof:sign(),actionKey:'ACT-61',eventId,intent:'start'};
test('valid LAB referral stays non-executable',async()=>{let x=await setup().inspect(input);assert.equal(x.ok,true);assert.equal(x.status,'LAB_PREFLIGHT_REVIEWABLE_NOT_EXECUTABLE');assert.equal(x.canIssueEvidence,false);assert.equal(x.canStartSession,false)});
test('PATITA-only referral cannot pass a missing signed direct action',async()=>assert.equal((await setup({action:{source:'PATITA_OBSERVATION'}}).inspect(input)).reason,'action_not_verified'));
test('subject/session mismatch fails',async()=>assert.equal((await setup({session:{subject:'another'}}).inspect(input)).reason,'session_not_verified'));
test('revoked session fails',async()=>assert.equal((await setup({session:{revoked:true}}).inspect(input)).reason,'session_not_verified'));
test('revoked or missing authorized contract fails',async()=>assert.equal((await setup({contract:{revoked:true}}).inspect(input)).reason,'contract_not_authorized'));
test('unapproved contract fails',async()=>assert.equal((await setup({contract:{authorized:false}}).inspect(input)).reason,'contract_not_authorized'));
test('wrong language/action binding fails',async()=>assert.equal((await setup({action:{language:'pt'}}).inspect(input)).reason,'context_not_bound_to_action'));
test('wrong canonical skill fails',async()=>assert.equal((await setup({target:{skill:'other'}}).inspect(input)).reason,'canonical_target_mismatch'));
test('tampered proof fails cryptographically',async()=>assert.equal((await setup().inspect({...input,proof:sign({...claims,subject:'B'},'incorrect local secret')})).reason,'untrusted_assertion'));
test('expired proof fails',async()=>assert.equal((await setup().inspect({...input,proof:sign({...claims,expiresAt:now-1})})).reason,'untrusted_assertion'));
test('caller cannot inject identity or contract',async()=>assert.equal((await setup().inspect({...input,subject:'subject-A'})).reason,'invalid_request'));
test('no contract for S1 WHY proposal',async()=>assert.equal((await setup().inspect({...input,proposal:{...proposal,proposalKind:'NO_CONTRACT'}})).reason,'invalid_request'));
test('action consumption blocked',async()=>assert.equal((await setup({action:{consumed:true}}).inspect(input)).reason,'action_not_verified'));
test('different event UUID blocked',async()=>assert.equal((await setup().inspect({...input,eventId:'00000000-0000-4000-8000-000000000001'})).reason,'proof_action_mismatch'));
test('resume requires origin validation',async()=>{const origin='shopping-for-dinner',destination='preparing-dinner';const p={...proposal,experienceId:destination,questionWord:'where',skill:'where.use.location-question',definitionPath:'data/learning/skills/where.json',proposedOriginExperienceId:origin,proposalKind:'RESUME_PROPOSAL_UNVERIFIED'};const c={...claims,intent:'resume'};const i={...input,proposal:p,intent:'resume',proof:sign(c)};let a=setup({action:{intent:'resume',experienceId:destination,questionWord:'where',skill:p.skill,originExperienceId:origin},target:{skill:p.skill,definitionPath:p.definitionPath,mode:'resume',originExperienceId:origin},contract:{skill:p.skill,language:'en',originExperienceId:origin,currentExperienceId:destination,intent:'resume',definitionPath:p.definitionPath},origin:{valid:false,skill:p.skill,originExperienceId:origin,destinationExperienceId:destination}});assert.equal((await a.inspect(i)).reason,'origin_not_authorized')});
