// V30.3.87B: real RS256-signed request -> mock verifier -> server authorization
// -> real local SQLite -> 85D read -> 85E observation-only snapshot -> HTTP.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {createAccessVerifier87} from './access-verifier.mjs';
import {createHttpObservationHandler87B} from './read-only-http.mjs';
import {writeOccurrence85C} from '../storage-contract/storage-contract.mjs';
import {createObservationPanel85E} from '../observation-ui/observation-panel.mjs';
const migration=readFileSync(resolve('migrations/0004_v30_85c_occurrences.sql'),'utf8');
const issuer='https://siyayo-lab.cloudflareaccess.com';
const audience='siyayo-lab-audience';const time=1000;
const pair=generateKeyPairSync('rsa',{modulusLength:2048,publicExponent:65537});
const pub={...pair.publicKey.export({format:'jwk'}),kid:'ci-key'};
const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
const claims=(subject='opaque-a',patch={})=>({iss:issuer,aud:[audience],type:'app',sub:subject,
 iat:900,nbf:900,exp:1100,...patch});
function token(subject='opaque-a',patch={},header={alg:'RS256',kid:'ci-key',typ:'JWT'}){
 const p=b64(header)+'.'+b64(claims(subject,patch));
 return p+'.'+sign('RSA-SHA256',Buffer.from(p),pair.privateKey).toString('base64url');
}
function request(jwt=token(),path='/__lab/v30/observations',method='GET'){
 const headers=jwt?{'Cf-Access-Jwt-Assertion':jwt}:{};
 return new Request('https://lab.example.invalid'+path,{method,headers});
}
const qwMap=[['WHICH','which.use.determiner'],['WHAT','what.use.object-question'],['WHERE','where.use.location-question'],['WHY','why.use.contextual-reason']];
function policy(subject,q='WHICH',lang='en',purpose='assessment',suffix=''){
 const skillId=qwMap.find(x=>x[0]===q)[1];
 return {subject,policyId:q+'.'+lang+'.'+purpose+suffix,skillId,language:lang,
  originExperienceId:'shopping-for-dinner',contractVersion:'0.1.0',questionWord:q,purpose};
}
const policies=subject=>qwMap.flatMap(([q])=>['en','es','pt'].flatMap(lang=>
 ['assessment','exploration'].map(purpose=>policy(subject,q,lang,purpose))));
const id='f7027810-0c12-4b65-ae3e-18f538d67e18';
const event={eventId:id,sourceOccurrenceId:'choice-select:1',
 currentExperienceId:'shopping-for-dinner',event:{choice:'books'}};
function lab(t,{policyProvider=policies,active=async()=>true,storageBroken=false}={}){
 const folder=mkdtempSync(join(tmpdir(),'siyayo87b-'));
 const sqlite=new DatabaseSync(join(folder,'store.sqlite'));sqlite.exec(migration);
 const metrics={reads:0,writes:0};
 const db={prepare(sql){
  if(storageBroken)throw Error('storage_offline');
  const stmt=sqlite.prepare(sql);let args=[];
  return {bind(...v){args=v;return this;},
   async run(){metrics.writes++;const z=stmt.run(...args);return {meta:{changes:z.changes}};},
   async first(){return stmt.get(...args)??null;},
   async all(){metrics.reads++;return {results:stmt.all(...args)};}};
 }};
 const verifier=createAccessVerifier87({issuer,audience,publicKeys:[pub],now:()=>time,
  isSessionActive:active});
 const handler=createHttpObservationHandler87B({verifier,policiesForSubject:policyProvider,db});
 t.after(()=>{sqlite.close();rmSync(folder,{recursive:true,force:true});});
 return {handler,db,sqlite,metrics,verifier};
}
async function seed(l,subject='opaque-a',p=policy('opaque-a'),e=event){
 const identity={ok:true,principal:{subject,sessionId:'local_seed_session'}};
 const result=await writeOccurrence85C({identity,policy:p,submission:e,db:l.db});
 assert.equal(result.ok,true,JSON.stringify(result));
}
async function call(l,jwt=token(),path='/__lab/v30/observations',method='GET'){
 const res=await l.handler.fetch(request(jwt,path,method));
 return {res,data:await res.json()};
}
const cell=(x,q='WHICH',language='en')=>x.cells.find(c=>c.questionWord===q&&c.language===language);
class Node{
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this._text='';this.dataset={};}
 set textContent(v){this._text=String(v);this.children=[];}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 append(...v){this.children.push(...v);}
 replaceChildren(...v){this._text='';this.children=[...v];}
 set innerHTML(_){throw Error('dangerous html');}
}
test('401 no JWT; database untouched',async t=>{
 const l=lab(t),{res,data}=await call(l,null);
 assert.equal(res.status,401);assert.equal(data.error,'unauthenticated');assert.equal(l.metrics.reads,0);
});
test('401 unsigned/forged JWT; database untouched',async t=>{
 const l=lab(t);const signed=token(),parts=signed.split('.');
 parts[1]=b64({...claims(),sub:'opaque-b'});
 const {res}=await call(l,parts.join('.'));assert.equal(res.status,401);assert.equal(l.metrics.reads,0);
});
test('401 expired, future, incorrect issuer or audience JWT',async t=>{
 const l=lab(t);for(const patch of [{exp:1000},{iat:2000},{iss:'https://other.cloudflareaccess.com'},{aud:['other']}])
  assert.equal((await call(l,token('opaque-a',patch))).res.status,401);
 assert.equal(l.metrics.reads,0);
});
test('401 revocation/revalidation denial, even with signed token',async t=>{
 const l=lab(t,{active:async()=>false});assert.equal((await call(l)).res.status,401);
});
test('401 on revocation-check outage, fail closed',async t=>{
 const l=lab(t,{active:async()=>{throw Error('offline')}});
 assert.equal((await call(l)).res.status,401);
});
test('403 signed learner has no issued read policies',async t=>{
 const l=lab(t,{policyProvider:()=>[]});assert.equal((await call(l)).res.status,403);
 assert.equal(l.metrics.reads,0);
});
test('403 server policy returns a different subject',async t=>{
 const l=lab(t,{policyProvider:()=>policies('opaque-b')});
 assert.equal((await call(l)).res.status,403);assert.equal(l.metrics.reads,0);
});
test('403 duplicate or forged server policy cannot duplicate progress',async t=>{
 const l=lab(t,{policyProvider:s=>[policy(s),policy(s,'WHICH','en','assessment','-second')]});
 assert.equal((await call(l)).res.status,403);
});
test('403 unexpected policy scope/skill/questionWord',async t=>{
 const l=lab(t,{policyProvider:s=>[{...policy(s),skillId:'what.use.object-question'}]});
 assert.equal((await call(l)).res.status,403);
});
test('404 unknown route never authenticates or queries storage',async t=>{
 const l=lab(t);
 assert.equal((await call(l,token(),'/__lab/v30/read-once')).res.status,404);
 assert.equal((await call(l,token(),'/__lab/v30/write-once')).res.status,404);
 assert.equal((await call(l,token(),'/__lab/v30/read-other')).res.status,404);
 assert.equal(l.metrics.reads,0);
});
test('405 POST/PUT/DELETE/OPTIONS refused before authentication',async t=>{
 const l=lab(t);
 for(const m of ['POST','PUT','DELETE','OPTIONS'])
  assert.equal((await call(l,null,'/__lab/v30/observations',m)).res.status,405);
 assert.equal(l.metrics.reads,0);assert.equal(l.metrics.writes,0);
});
test('400 query selectors including NICK, subject and QW blocked',async t=>{
 const l=lab(t);
 for(const q of ['?nick=A','?subject=opaque-a','?questionWord=WHICH','?eventId=abc'])
  assert.equal((await call(l,null,'/__lab/v30/observations'+q)).res.status,400);
 assert.equal(l.metrics.reads,0);
});
test('404 valid learner with no history, without leaking another learner record',async t=>{
 const l=lab(t);await seed(l);
 const {res,data}=await call(l,token('opaque-b'));
 assert.equal(res.status,404);assert.deepEqual(data,{error:'not_found'});
});
test('200 authorized user receives 12 sanitised observation cells',async t=>{
 const l=lab(t);await seed(l);
 const {res,data}=await call(l);
 assert.equal(res.status,200);assert.equal(data.kind,'OBSERVATION_PREVIEW_ONLY');
 assert.equal(data.cells.length,12);assert.equal(cell(data).pendingOccurrences,1);
 assert.equal(cell(data).acceptedProgress,null);
 assert.equal(cell(data).confirmed,false);assert.equal(cell(data).greenPass,false);
});
test('200 no cache, no CORS and no accidental identity or payload in response',async t=>{
 const l=lab(t);await seed(l);
 const {res,data}=await call(l);
 assert.match(res.headers.get('cache-control'),/no-store/);
 assert.equal(res.headers.get('access-control-allow-origin'),null);
 assert.equal(res.headers.get('x-content-type-options'),'nosniff');
 const dump=JSON.stringify(data);
 for(const word of ['opaque-a','local_seed_session','"books"','choice-select:1','scopeKey'])
  assert.equal(dump.includes(word),false,word);
});
test('real HTTP 200 snapshot feeds existing 85E observation-only DOM adapter',async t=>{
 const l=lab(t);await seed(l);
 const container=new Node('div'),doc={createElement:tag=>new Node(tag)};
 const panel=createObservationPanel85E({document:doc,element:container,loadSnapshot:async()=>{
  const response=await l.handler.fetch(request());return response.status===200?response.json():null;
 }});
 const before=l.metrics.writes;
 assert.equal(await panel.refresh({viewKey:'signed-session',displayLanguage:'pt'}),true);
 assert.match(container.textContent,/REGISTROS OBSERVADOS/);
 assert.match(container.textContent,/◐ 0 exploratórias · 1 pendentes/);
 assert.doesNotMatch(container.textContent,/3\/3|GREEN PASS/);
 assert.equal(l.metrics.writes,before);
});
test('503 corrupt SQLite checksum prevents partial observations',async t=>{
 const l=lab(t);await seed(l);
 l.sqlite.prepare("UPDATE v30_85c_occurrences SET payload_sha256=?").run('0'.repeat(64));
 const {res,data}=await call(l);
 assert.equal(res.status,503);assert.deepEqual(data,{error:'history_unavailable'});
});
test('503 database read outage does not reveal private rows',async t=>{
 const l=lab(t,{storageBroken:true});
 const {res,data}=await call(l);assert.equal(res.status,503);
 assert.deepEqual(data,{error:'history_unavailable'});
});
test('401/403/404/405/503 all return no-store and no user data',async t=>{
 const l=lab(t);
 const results=[await call(l,null),await call(l,token(),'/not-found'),
  await call(l,null,'/__lab/v30/observations','POST')];
 for(const x of results){
  assert.match(x.res.headers.get('cache-control'),/no-store/);
  assert.equal(JSON.stringify(x.data).includes('opaque-a'),false);
 }
});
test('cannot produce score, accepted Witness, Green Pass, or mutate D1 by GET',async t=>{
 const l=lab(t);await seed(l);
 const before=l.metrics.writes;const {data}=await call(l);
 assert.equal(l.metrics.writes,before);
 assert.equal(Object.hasOwn(data,'greenPass'),false);
 assert.ok(data.cells.every(x=>x.acceptedProgress===null&&!x.confirmed&&!x.greenPass));
});
