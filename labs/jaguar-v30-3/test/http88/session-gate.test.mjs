import test from 'node:test';
import assert from 'node:assert/strict';
import {createSessionGate88} from './session-gate.mjs';
const sessions=new Map([
 ['a',{ok:true,subject:'opaque-a',sessionId:'session-1',issuedAt:900,expiresAt:1100}],
 ['b',{ok:true,subject:'opaque-a',sessionId:'session-2',issuedAt:900,expiresAt:1100}],
 ['c',{ok:true,subject:'opaque-b',sessionId:'session-3',issuedAt:900,expiresAt:1100}]
]);
const revoked=new Set();
let now=1000;
const make=(opts={})=>createSessionGate88({now:()=>now,resolveVerifiedSession:async id=>sessions.get(id),
 isRevoked:async({sessionId})=>revoked.has(sessionId),...opts});
test('trusted session resolves principal',async()=>{now=1000;revoked.clear();assert.equal((await make().check('a')).principal.subject,'opaque-a');});
test('one revoked session does not revoke sibling session',async()=>{revoked.clear();revoked.add('session-1');const g=make();assert.equal((await g.check('a')).ok,false);assert.equal((await g.check('b')).ok,true);});
test('same browser NICK cannot establish session',async()=>{assert.equal((await make().check('NICK-ONLY')).ok,false);});
test('repeated revoke remains blocked',async()=>{revoked.clear();revoked.add('session-2');const g=make();assert.equal((await g.check('b')).ok,false);assert.equal((await g.check('b')).ok,false);});
test('expired session rejected even if not revoked',async()=>{revoked.clear();now=1100;assert.equal((await make().check('a')).ok,false);now=1000;});
test('unknown session denied',async()=>{assert.equal((await make().check('x')).ok,false);});
test('revocation lookup outage fails closed',async()=>{const g=make({isRevoked:async()=>{throw Error('offline')}});assert.equal((await g.check('c')).ok,false);});
test('revocation must explicitly answer false',async()=>{const g=make({isRevoked:async()=>undefined});assert.equal((await g.check('c')).ok,false);});
test('missing trusted resolver fails construction',()=>assert.throws(()=>createSessionGate88({now:()=>1000}),TypeError));
test('malformed trusted session rejected',async()=>{const g=make({resolveVerifiedSession:async()=>({ok:true,subject:'opaque-a',sessionId:'',issuedAt:900,expiresAt:1100})});assert.equal((await g.check('a')).ok,false);});
test('clock inconsistency fails closed',async()=>{const g=make({now:()=>NaN});assert.equal((await g.check('a')).reason,'clock_unavailable');});
test('principal contains no nickname or raw ticket',async()=>{const r=await make().check('c');assert.deepEqual(Object.keys(r.principal).sort(),['expiresAt','sessionId','subject']);});
