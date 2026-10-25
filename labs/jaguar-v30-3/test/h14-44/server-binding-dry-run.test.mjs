import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createBindingDryRun} from './server-binding-dry-run.mjs';
const require=createRequire(import.meta.url);
const drafts=require('../../../../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const request={sessionHandle:'MOCK_SESSION',eventId:'f7027810-0c12-4b65-ae3e-18f538d67e18',targetId:'MOCK_TARGET',actionReference:'MOCK_ACTION',intent:'start'};
function fixture(){
 const target={id:'MOCK_TARGET',status:'AUTHORIZED',revoked:false,expiresAt:200,subject:'mock-a',skillId:'why.use.contextual-reason',questionWord:'WHY',language:'en',dimension:'reason-answer(local)',contractId:'MOCK_CONTRACT',contractVersion:'0.1.0',originExperienceId:'shopping-for-dinner',currentExperienceId:'shopping-for-dinner',allowedIntents:['start','resume','transfer']};
 const action={reference:'MOCK_ACTION',subject:'mock-a',targetId:'MOCK_TARGET',source:'DIRECT_LEARNER_ACTION',verified:true,exposureReference:'MOCK_EXPOSURE',modelExposure:'not_exposed',sourceOccurrenceId:'mock:1',language:'en',originExperienceId:target.originExperienceId,currentExperienceId:target.currentExperienceId,dimension:target.dimension};
 const ctx={target,action,exists:false,identity:{ok:true,principal:{subject:'mock-a',sessionId:'mock-session',expiresAt:200}}};
 ctx.dependencies={now:()=>100,resolveIdentity:async()=>ctx.identity,resolveTarget:async()=>ctx.target,resolveAction:async()=>ctx.action,resolveScope:async key=>({...key,exists:ctx.exists})};
 ctx.run=(r=request)=>createBindingDryRun(ctx.dependencies).prepare(r);return ctx;
}
test('server-resolved metadata prepares immutable 85C envelope without evaluation',async()=>{
 const f=fixture(),v=await f.run();assert.equal(v.ok,true);assert.equal(v.status,'PREPARED_ONLY_NOT_STORED');assert.equal(v.evaluationAllowed,false);assert.equal(v.evidenceAllowed,false);assert.equal(v.policy.subject,'mock-a');assert.equal(v.submission.event.contractId,'MOCK_CONTRACT');assert.ok(Object.isFrozen(v.submission.event));assert.equal(JSON.stringify(v).includes('MOCK_SESSION'),false);
});
test('current real S1/S2 drafts remain blocked',async()=>{
 for(const draft of drafts.contractRegistry.filter(t=>t.status==='DRAFT_NOT_AUTHORIZED')){const f=fixture();Object.assign(f.target,draft,{id:'MOCK_TARGET'});assert.equal((await f.run()).reason,'target_not_authorized');}
});
test('reject client-supplied authority, subject, dimension and origin',async()=>{
 for(const key of ['subject','nick','dimension','originExperienceId','authorized','event','score','greenPass'])assert.equal((await fixture().run({...request,[key]:'forged'})).reason,'invalid_request');
});
test('invalid UUID and intention rejected',async()=>{
 for(const patch of [{eventId:'counter:1'},{intent:'NEXT'},{actionReference:''}])assert.equal((await fixture().run({...request,...patch})).reason,'invalid_request');
});
test('expired identity and missing principal fail closed',async()=>{
 for(const identity of [null,{ok:false},{ok:true,principal:{subject:'mock-a',sessionId:'mock-session',expiresAt:99}}]){const f=fixture();f.identity=identity;assert.equal((await f.run()).reason,'unauthenticated');}
});
test('revoked, expired or missing target rejected',async()=>{
 for(const patch of [{revoked:true},{expiresAt:100},{status:'DRAFT_NOT_AUTHORIZED'}]){const f=fixture();Object.assign(f.target,patch);assert.equal((await f.run()).reason,'target_not_authorized');}
});
test('subject, skill, language and QW must match server target',async()=>{
 for(const patch of [{subject:'mock-b'},{skillId:'which.use.determiner'},{language:'fr'},{questionWord:'HOW'}]){const f=fixture();Object.assign(f.target,patch);assert.equal((await f.run()).reason,'invalid_target_binding');}
});
test('start cannot reset retained scope; resume requires existing scope',async()=>{
 const f=fixture();f.exists=true;assert.equal((await f.run()).reason,'scope_already_exists');assert.equal((await f.run({...request,intent:'resume'})).ok,true);f.exists=false;assert.equal((await f.run({...request,intent:'resume'})).reason,'scope_not_found');
});
test('transfer keeps S1 origin and is allowed before any local proof',async()=>{
 const f=fixture();f.exists=true;Object.assign(f.target,{dimension:'reason-answer(transfer)',currentExperienceId:'preparing-dinner'});Object.assign(f.action,{dimension:f.target.dimension,currentExperienceId:f.target.currentExperienceId});const v=await f.run({...request,intent:'transfer'});assert.equal(v.ok,true);assert.equal(v.policy.originExperienceId,'shopping-for-dinner');assert.equal(v.submission.currentExperienceId,'preparing-dinner');
});
test('local S2 origin and S1 to S2 transfer remain distinct',async()=>{
 const f=fixture();f.target.originExperienceId=f.target.currentExperienceId='preparing-dinner';f.action.originExperienceId=f.action.currentExperienceId='preparing-dinner';assert.equal((await f.run()).policy.originExperienceId,'preparing-dinner');assert.equal((await f.run({...request,intent:'transfer'})).reason,'dimension_origin_mismatch');
});
test('PATITA, unverified action, unknown exposure and binding mismatch blocked',async()=>{
 for(const patch of [{source:'PATITA_OBSERVATION'},{verified:false},{modelExposure:'unknown'},{subject:'mock-b'}]){const f=fixture();Object.assign(f.action,patch);assert.equal((await f.run()).reason,'unverified_action');}
 const f=fixture();f.action.language='es';assert.equal((await f.run()).reason,'action_binding_mismatch');
});
test('model exposure is captured without certifying independence',async()=>{
 const f=fixture();f.action.modelExposure='exposed';const v=await f.run();assert.equal(v.ok,true);assert.equal(v.submission.event.modelExposure,'exposed');assert.equal(v.evaluationAllowed,false);
});
test('scope from other origin rejected and resolver failure closed',async()=>{
 const f=fixture();f.dependencies.resolveScope=async key=>({...key,exists:false,originExperienceId:'other'});assert.equal((await f.run()).reason,'scope_mismatch');f.dependencies.resolveTarget=async()=>{throw Error('offline');};assert.equal((await f.run()).reason,'server_resolution_failed');
});
test('all EN ES PT contexts resolve independently; repeated prepare is stable',async()=>{
 for(const language of ['en','es','pt']){const f=fixture();f.target.language=f.action.language=language;const a=await f.run(),b=await f.run();assert.deepEqual(a,b);assert.equal(a.policy.language,language);}
});
