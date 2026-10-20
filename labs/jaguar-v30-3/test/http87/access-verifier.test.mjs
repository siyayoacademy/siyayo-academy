import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign,randomBytes} from 'node:crypto';
import {createAccessVerifier87} from './access-verifier.mjs';
const issuer='https://siyayo-test.cloudflareaccess.com',audience='siyayo-test-app-aud',now=1000;
const pair=generateKeyPairSync('rsa',{modulusLength:2048,publicExponent:0x10001});
const pub={...pair.publicKey.export({format:'jwk'}),kid:'test-kid-1'};
const enc=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const base={iss:issuer,aud:[audience],type:'app',sub:'opaque-a',iat:900,nbf:900,exp:1100};
const jwt=(claims=base,header={alg:'RS256',typ:'JWT',kid:'test-kid-1'},key=pair.privateKey)=>{
 const first=enc(header)+'.'+enc(claims);
 return first+'.'+sign('RSA-SHA256',Buffer.from(first),key).toString('base64url');
};
const request=(token,headerName='Cf-Access-Jwt-Assertion')=>new Request('https://lab.invalid/test',
 {headers:token?{[headerName]:token}:{}});
const verifier=(opts={})=>createAccessVerifier87({issuer,audience,publicKeys:[pub],now:()=>now,
 isSessionActive:async()=>true,...opts});
const denied=async token=>assert.equal((await verifier().verify(request(token))).ok,false);
test('valid RS256 Access application token resolves opaque subject',async()=>{
 const r=await verifier().verify(request(jwt()));
 assert.equal(r.ok,true);assert.equal(r.principal.subject,'opaque-a');
 assert.match(r.principal.sessionId,/^jwt_[0-9a-f]{32}$/);
 assert.equal(Object.hasOwn(r.principal,'email'),false);
});
test('JWT requires assertion header, not browser nickname or CF cookie',async()=>{
 assert.equal((await verifier().verify(new Request('https://lab.invalid',{headers:{Cookie:'CF_Authorization='+jwt()}}))).ok,false);
});
test('missing JWT fails closed',async()=>{assert.equal((await verifier().verify(request())).reason,'unauthenticated');});
test('tampered claims after signing rejected',async()=>{
 const parts=jwt().split('.');parts[1]=enc({...base,sub:'opaque-b'});
 await denied(parts.join('.'));
});
test('invalid signature and wrong key rejected',async()=>{
 const other=generateKeyPairSync('rsa',{modulusLength:2048});
 await denied(jwt(base,undefined,other.privateKey));
});
test('wrong issuer denied',async()=>denied(jwt({...base,iss:'https://other.cloudflareaccess.com'})));
test('wrong audience and malformed audience denied',async()=>{
 await denied(jwt({...base,aud:['other']}));await denied(jwt({...base,aud:'siyayo-test-app-aud'}));
});
test('expired token denied',async()=>denied(jwt({...base,exp:1000})));
test('future issued-at and not-before denied',async()=>{
 await denied(jwt({...base,iat:2000,exp:2100}));
 await denied(jwt({...base,nbf:1200}));
});
test('invalid time types rejected',async()=>{
 await denied(jwt({...base,exp:'1100'}));await denied(jwt({...base,iat:null}));
});
test('service tokens with empty subject denied',async()=>denied(jwt({...base,sub:''})));
test('global session token type denied',async()=>denied(jwt({...base,type:'org'})));
test('none algorithm denied',async()=>denied(jwt(base,{alg:'none',typ:'JWT',kid:'test-kid-1'})));
test('algorithm confusion and critical header denied',async()=>{
 await denied(jwt(base,{alg:'HS256',typ:'JWT',kid:'test-kid-1'}));
 await denied(jwt(base,{alg:'RS256',typ:'JWT',kid:'test-kid-1',jku:'https://attacker.invalid'}));
});
test('unknown kid rejected even if validly signed',async()=>denied(jwt(base,{alg:'RS256',typ:'JWT',kid:'unknown'})));
test('malformed or oversized JWT rejected',async()=>{
 await denied('not.jwt');await denied('a.b.c');await denied('a'.repeat(9000));
});
test('revoked/session policy fails closed',async()=>{
 const v=verifier({isSessionActive:async()=>false});
 assert.equal((await v.verify(request(jwt()))).ok,false);
});
test('revocation service outage fails closed',async()=>{
 const v=verifier({isSessionActive:async()=>{throw Error('offline')}});
 assert.equal((await v.verify(request(jwt()))).ok,false);
});
test('no active verifier cannot be configured',()=>{
 assert.throws(()=>createAccessVerifier87({issuer,audience,publicKeys:[pub],now:()=>1000}),TypeError);
});
test('invalid keys, duplicate kid and private key never allowed in config',()=>{
 assert.throws(()=>verifier({publicKeys:[pub,pub]}),TypeError);
 assert.throws(()=>verifier({publicKeys:[{...pub,d:'secret'}]}),TypeError);
 assert.throws(()=>verifier({publicKeys:[{...pub,n:'short'}]}),TypeError);
});
test('missing/mismatched issuer config cannot be accepted',()=>{
 assert.throws(()=>verifier({issuer:'http://localhost'}),TypeError);
});
test('valid multiple AUD tags includes pinned application audience',async()=>{
 const v=verifier(),r=await v.verify(request(jwt({...base,aud:['other',audience]})));
 assert.equal(r.ok,true);
});
