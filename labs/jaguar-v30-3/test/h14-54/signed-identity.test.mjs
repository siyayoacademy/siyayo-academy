import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
import {verifyFixtureIdentityAssertion} from './fixture-identity-verifier.mjs';
const now=1800000000,key='only-for-local-tests-not-a-production-secret-key-000';
const claims={issuer:'SIYAYO_TEST_ISSUER',audience:'SIYAYO_H1454_LAB',subject:'mock-a',sessionHandle:'MOCK_SESSION',sessionId:'SYNTHETIC_SERVER_SESSION',actionKey:'ACT-1',eventId:'f7027810-0c12-4b65-ae3e-18f538d67e18',intent:'start',issuedAt:now-10,notBefore:now-10,expiresAt:now+100};
function sign(c=claims,k=key){const p=Buffer.from(JSON.stringify(c)).toString('base64url');return p+'.'+createHmac('sha256',k).update(p).digest('base64url')}
const verify=(proof,opts={})=>verifyFixtureIdentityAssertion({proof,key,issuer:'SIYAYO_TEST_ISSUER',audience:'SIYAYO_H1454_LAB',now,...opts});
test('fixture proof verifies exact issuer, audience, subject, action, event and validity',()=>{const r=verify(sign());assert.equal(r.ok,true);assert.equal(r.claims.subject,'mock-a');assert.equal(r.claims.actionKey,'ACT-1');assert.equal(Object.isFrozen(r.claims),true)});
test('modified claims without new signature are rejected',()=>{const p=sign().split('.');p[0]=Buffer.from(JSON.stringify({...claims,subject:'mock-b'})).toString('base64url');assert.equal(verify(p.join('.')).reason,'untrusted_assertion')});
test('wrong key fails cryptographic validation',()=>assert.equal(verify(sign(claims,'wrong-key-but-valid-length-for-local-testing-000')).reason,'untrusted_assertion'));
test('wrong issuer or audience fail closed',()=>{assert.equal(verify(sign(),{issuer:'OTHER'}).reason,'invalid_claims');assert.equal(verify(sign(),{audience:'OTHER'}).reason,'invalid_claims')});
test('expired, future, and overly long proofs fail',()=>{for(const x of [{expiresAt:now},{issuedAt:now+100,notBefore:now+100},{expiresAt:now+900}])assert.equal(verify(sign({...claims,...x})).reason,'proof_expired_or_not_yet_valid')});
test('invalid claim schema and authority extras fail',()=>{assert.equal(verify(sign({...claims,role:'admin'})).reason,'invalid_claims');assert.equal(verify(sign({...claims,eventId:'not-uuid'})).reason,'invalid_claims')});
test('invalid proof structure and signature lengths fail',()=>{for(const p of ['bad','a.b.c','a.b','.'.repeat(3),'x'.repeat(2100)])assert.equal(verify(p).ok,false)});
test('unconfigured verifier key fails closed',()=>assert.equal(verify(sign(),{key:'short'}).reason,'verifier_unavailable'));
test('Worker H14.54 bundle imports inherited H14.50, H14.53 gateway and verified assertion',async()=>{const buildResult=await build({entryPoints:[fileURLToPath(new URL('./worker-entry.mjs',import.meta.url))],bundle:true,write:false,metafile:true,format:'esm',platform:'browser',target:'es2022',external:['node:crypto','cloudflare:workers']});const files=Object.keys(buildResult.metafile.inputs);for(const name of ['h14-50/guarded-batch-candidate.mjs','h14-53/trusted-action-gateway.mjs','h14-54/fixture-identity-verifier.mjs'])assert.ok(files.some(x=>x.endsWith(name)),name)});
