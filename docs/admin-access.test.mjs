import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { authorize, page } from '../functions/admin/[[path]].js';
if (!globalThis.crypto) Object.defineProperty(globalThis, 'crypto', {value:webcrypto});
const pair = await crypto.subtle.generateKey({name:'RSASSA-PKCS1-v1_5',modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:'SHA-256'},true,['sign','verify']);
const jwk = await crypto.subtle.exportKey('jwk',pair.publicKey);
jwk.kid='test-key';
const env={ACCESS_TEAM_DOMAIN:'https://test.cloudflareaccess.com',ACCESS_AUD:'test-audience',ADMIN_ALLOWED_EMAIL:'owner@example.test'};
globalThis.fetch=async()=>Response.json({keys:[jwk]});
const base={iss:env.ACCESS_TEAM_DOMAIN,aud:[env.ACCESS_AUD],exp:Math.floor(Date.now()/1000)+300,email:env.ADMIN_ALLOWED_EMAIL};
const encode=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
async function token(claims){const unsigned=encode({alg:'RS256',kid:jwk.kid})+'.'+encode(claims);const sig=await crypto.subtle.sign('RSASSA-PKCS1-v1_5',pair.privateKey,new TextEncoder().encode(unsigned));return unsigned+'.'+Buffer.from(sig).toString('base64url');}
async function check(claims,expected,customEnv=env,raw){const jwt=raw??(claims?await token(claims):null);const context={env:customEnv,data:{},functionPath:'/admin',waitUntil(){},passThroughOnException(){},request:new Request('https://example.test/admin/',{headers:jwt?{'Cf-Access-Jwt-Assertion':jwt}:{}})};context.next=()=>page(context);const result=await authorize(context);assert.equal(result.status,expected);const text=await result.text();if(expected!==200)assert.ok(!text.includes('Mapas e ambientes'));else{assert.ok(text.includes('SIYAYO Academy'));assert.equal(result.headers.get('cache-control'),'private, no-store');}}
await check(base,200);
await check(null,302);
await check(base,503,{});
await check({...base,email:'other@example.test'},403);
await check({...base,exp:1},302);
await check({...base,aud:['wrong-app']},302);
await check({...base,iss:'https://other.cloudflareaccess.com'},302);
const missing={...base};delete missing.exp;await check(missing,403);
await check(base,302,env,'bad.token.signature');
await check({...base,nbf:Math.floor(Date.now()/1000)+300},302);
console.log('PASS: 10 authentication cases; no dashboard in denied responses.');
