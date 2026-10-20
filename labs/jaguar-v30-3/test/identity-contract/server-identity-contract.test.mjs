import test from 'node:test';
import assert from 'node:assert/strict';
import {createServerIdentityContract} from './server-identity-contract.mjs';

const issuer='mock-issuer.local',audience='siyayo-identity-contract-lab',moment=1000;
const proof={ok:true,subject:'opaque-a',sessionId:'sess-a',issuer,audience,issuedAt:900,expiresAt:1100,revoked:false};
const other={...proof,subject:'opaque-b',sessionId:'sess-b'};
const registry=new Map([['mock-a',proof],['mock-b',other]]);
const create=(options={})=>createServerIdentityContract({
  issuer,audience,now:()=>moment,verifySession:async ticket=>registry.get(ticket)||null,...options
});
const input=(sessionHandle='mock-a',nick='ALUNO')=>({sessionHandle,nick});

test('verified opaque subject differs from the user-entered NICK',async()=>{
  const r=await create().resolve(input());
  assert.equal(r.ok,true);assert.equal(r.principal.subject,'opaque-a');
  assert.equal(r.display.nick,'ALUNO');assert.notEqual(r.principal.subject,r.display.nick);
});
test('changing NICK preserves the verified subject',async()=>{
  const api=create();const a=await api.resolve(input('mock-a','ANA'));
  const b=await api.resolve(input('mock-a','CARLOS'));
  assert.equal(a.principal.subject,b.principal.subject);
  assert.equal(b.display.nick,'CARLOS');
});
test('two learners may have the same NICK without sharing ownership',async()=>{
  const api=create();const a=await api.resolve(input('mock-a','PATI'));
  const b=await api.resolve(input('mock-b','PATI'));
  assert.equal(a.display.nick,b.display.nick);assert.notEqual(a.principal.subject,b.principal.subject);
});
test('unknown session is not authenticated',async()=>{
  assert.deepEqual(await create().resolve(input('unknown')),{ok:false,reason:'unauthenticated'});
});
test('missing session handle is denied',async()=>{
  assert.equal((await create().resolve({nick:'ALUNO'})).reason,'unauthenticated');
});
test('forged opaque subject supplied by client is rejected',async()=>{
  assert.equal((await create().resolve({...input(),subject:'opaque-b'})).reason,'invalid_input');
});
test('forged learnerId supplied by client is rejected',async()=>{
  assert.equal((await create().resolve({...input(),learnerId:'another'})).reason,'invalid_input');
});
test('client credit/Green Pass/status claims are rejected',async()=>{
  for(const key of ['greenPass','credits','status','assessmentAuthority']){
    assert.equal((await create().resolve({...input(),[key]:true})).reason,'invalid_input');
  }
});
test('client cannot provide clock or expiry',async()=>{
  assert.equal((await create().resolve({...input(),now:42})).reason,'invalid_input');
  assert.equal((await create().resolve({...input(),expiresAt:999999})).reason,'invalid_input');
});
test('expired session is rejected',async()=>{
  assert.equal((await create({verifySession:async()=>({...proof,expiresAt:1000})}).resolve(input())).reason,'unauthenticated');
});
test('revoked session is rejected',async()=>{
  assert.equal((await create({verifySession:async()=>({...proof,revoked:true})}).resolve(input())).reason,'unauthenticated');
});
test('wrong issuer is rejected',async()=>{
  assert.equal((await create({verifySession:async()=>({...proof,issuer:'evil-issuer'})}).resolve(input())).reason,'unauthenticated');
});
test('wrong audience is rejected',async()=>{
  assert.equal((await create({verifySession:async()=>({...proof,audience:'other-app'})}).resolve(input())).reason,'unauthenticated');
});
test('future issued-at timestamp is rejected',async()=>{
  assert.equal((await create({verifySession:async()=>({...proof,issuedAt:1001})}).resolve(input())).reason,'unauthenticated');
});
test('invalid timestamp or reversed lifetime is rejected',async()=>{
  for(const claim of [{issuedAt:NaN},{expiresAt:'1100'},{issuedAt:1200,expiresAt:1100}]){
    assert.equal((await create({verifySession:async()=>({...proof,...claim})}).resolve(input())).reason,'unauthenticated');
  }
});
test('provider error is fail closed',async()=>{
  assert.equal((await create({verifySession:async()=>{throw Error('offline')}}).resolve(input())).reason,'unauthenticated');
});
test('invalid server clock is fail closed',async()=>{
  assert.equal((await create({now:()=>NaN}).resolve(input())).reason,'server_clock_unavailable');
});
test('unconfigured verifier fails before accepting a request',()=>{
  assert.throws(()=>createServerIdentityContract({issuer,audience,now:()=>1000}),TypeError);
});
test('missing, blank, oversized and control-character NICK rejected',async()=>{
  const api=create();
  for(const nick of ['', ' '.repeat(2),'x'.repeat(81),'ANA\nFORGED']){
    assert.equal((await api.resolve(input('mock-a',nick))).reason,'invalid_nick');
  }
});
test('NICK is normalized only for display',async()=>{
  const r=await create().resolve(input('mock-a','  ANA  '));
  assert.equal(r.display.nick,'ANA');assert.equal(r.principal.subject,'opaque-a');
});
test('invalid verified subject or session ID rejects the server proof',async()=>{
  for(const variation of [{subject:''},{sessionId:''},{subject:'x'.repeat(129)},{sessionId:null}]){
    assert.equal((await create({verifySession:async()=>({...proof,...variation})}).resolve(input())).reason,'unauthenticated');
  }
});
test('missing explicit revocation verdict rejects verifier response',async()=>{
  const {revoked,...p}=proof;
  assert.equal((await create({verifySession:async()=>p}).resolve(input())).reason,'unauthenticated');
});
test('principal and display are immutable and never include credit',async()=>{
  const r=await create().resolve(input());
  assert.equal(Object.isFrozen(r.principal),true);
  assert.equal(Object.isFrozen(r.display),true);
  assert.equal(Object.hasOwn(r.principal,'greenPass'),false);
  assert.equal(Object.hasOwn(r.principal,'credits'),false);
  assert.equal(Object.hasOwn(r.principal,'nick'),false);
});
