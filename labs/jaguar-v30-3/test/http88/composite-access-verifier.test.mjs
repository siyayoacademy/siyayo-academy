import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {createCompositeAccessVerifier88D} from './composite-access-verifier.mjs';
const issuer='https://ci.cloudflareaccess.com',audience='ci-aud';let now=1000;
const a=generateKeyPairSync('rsa',{modulusLength:2048}),b=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk=(pair,kid)=>({...pair.publicKey.export({format:'jwk'}),kid,alg:'RS256',use:'sig'});
const A=jwk(a,'A'),B=jwk(b,'B');
const encoded=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
const jwt=(opts={})=>{
 const {subject='alice',sid='sess-a1',privateKey=a.privateKey,kid='A',...claims}=opts;
 const str=encoded({alg:'RS256',typ:'JWT',kid})+'.'+encoded({iss:issuer,aud:[audience],type:'app',sub:subject,sid,iat:900,exp:1100,nbf:900,...claims});
 return str+'.'+sign('RSA-SHA256',Buffer.from(str),privateKey).toString('base64url');
};
const request=token=>new Request('https://local.invalid/__lab/v30/observations',{headers:token?{'Cf-Access-Jwt-Assertion':token}:{}});
const records=new Map([
 ['sess-a1',{ok:true,subject:'alice',sessionId:'sess-a1',issuedAt:900,expiresAt:1100}],
 ['sess-a2',{ok:true,subject:'alice',sessionId:'sess-a2',issuedAt:900,expiresAt:1100}],
 ['sess-b1',{ok:true,subject:'bob',sessionId:'sess-b1',issuedAt:900,expiresAt:1100}]
]);const revoked=new Set();
function setup(options={}){
 let keys=[A],failFetch=false,fetches=0;
 const v=createCompositeAccessVerifier88D({issuer,audience,now:()=>now,
  fetchTrustedKeys:async()=>{fetches++;if(failFetch)throw Error('offline');return {issuer,ttl:60,keys}},
  resolveVerifiedSession:async id=>records.get(id),
  isRevoked:async x=>revoked.has(x.sessionId),...options});
 return {v,rotate:x=>keys=x,offline:()=>failFetch=true,fetches:()=>fetches};
}
const reset=()=>{now=1000;revoked.clear()};
test('signed JWT and independent session record authorize only matching subject',async()=>{reset();const {v}=setup();const r=await v.verify(request(jwt()));assert.equal(r.ok,true);assert.equal(r.principal.sessionId,'sess-a1')});
test('absent token never fetches JWKs',async()=>{reset();const s=setup();assert.equal((await s.v.verify(request())).ok,false);assert.equal(s.fetches(),0)});
test('unsigned altered session claim rejected',async()=>{reset();const s=setup(),parts=jwt().split('.');parts[1]=encoded({...JSON.parse(Buffer.from(parts[1],'base64url')),sid:'sess-b1'});assert.equal((await s.v.verify(request(parts.join('.')))).ok,false)});
test('missing signed sid rejected rather than inferred',async()=>{reset();assert.equal((await setup().v.verify(request(jwt({sid:null})))).ok,false)});
test('wrong RSA signature rejected',async()=>{reset();assert.equal((await setup().v.verify(request(jwt({privateKey:b.privateKey})))).ok,false)});
test('signed sid mismatching server session rejected',async()=>{reset();const v=setup({resolveVerifiedSession:async()=>records.get('sess-a2')}).v;assert.equal((await v.verify(request(jwt()))).ok,false)});
test('a signed subject cannot borrow another learner session',async()=>{reset();assert.equal((await setup().v.verify(request(jwt({subject:'bob'})))).ok,false)});
test('one revoked session denies without affecting sibling session',async()=>{reset();revoked.add('sess-a1');const {v}=setup();assert.equal((await v.verify(request(jwt()))).ok,false);assert.equal((await v.verify(request(jwt({sid:'sess-a2'})))).ok,true)});
test('revocation backend outage fails closed',async()=>{reset();const v=setup({isRevoked:async()=>{throw Error('offline')}}).v;assert.equal((await v.verify(request(jwt()))).ok,false)});
test('unknown session fails closed',async()=>{reset();const v=setup({resolveVerifiedSession:async()=>null}).v;assert.equal((await v.verify(request(jwt()))).ok,false)});
test('expired JWT fails even with valid persisted session',async()=>{reset();now=1100;assert.equal((await setup().v.verify(request(jwt()))).ok,false)});
test('trusted cache reused before TTL',async()=>{reset();const s=setup();await s.v.verify(request(jwt()));now=1059;await s.v.verify(request(jwt()));assert.equal(s.fetches(),1)});
test('after trusted key rotation old key is rejected and new key accepted',async()=>{reset();const s=setup();assert.equal((await s.v.verify(request(jwt()))).ok,true);s.rotate([B]);now=1060;assert.equal((await s.v.verify(request(jwt({kid:'B',privateKey:b.privateKey})))).ok,true);assert.equal((await s.v.verify(request(jwt()))).ok,false)});
test('trusted key overlap allows both during rotation',async()=>{reset();const s=setup({fetchTrustedKeys:async()=>({issuer,ttl:60,keys:[A,B]})});assert.equal((await s.v.verify(request(jwt()))).ok,true);assert.equal((await s.v.verify(request(jwt({kid:'B',privateKey:b.privateKey})))).ok,true)});
test('expired key cache and source outage fail closed',async()=>{reset();const s=setup();await s.v.verify(request(jwt()));now=1060;s.offline();assert.equal((await s.v.verify(request(jwt()))).ok,false)});
test('bad JWT issuer and audience are rejected',async()=>{reset();const s=setup();assert.equal((await s.v.verify(request(jwt({iss:'https://evil.cloudflareaccess.com'})))).ok,false);assert.equal((await s.v.verify(request(jwt({aud:['wrong']})))).ok,false)});
test('NICK browser header is irrelevant to signed principal',async()=>{reset();const req=request(jwt());req.headers.set('X-Nick','another-user');assert.equal((await setup().v.verify(req)).principal.subject,'alice')});
test('requires a trusted session resolver and revocation dependency',()=>{assert.throws(()=>createCompositeAccessVerifier88D({issuer,audience,now:()=>1000,fetchTrustedKeys:async()=>({issuer,ttl:60,keys:[A]})}),TypeError)});
