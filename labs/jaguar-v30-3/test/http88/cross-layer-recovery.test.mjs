// SIYAYO 88E — end-to-end lab compatibility. NOT LIVE ACCESS OR DEPLOYABLE.
// The signed sid below is a synthetic fixture; NOT promised by Cloudflare JWTs.
import test from 'node:test';
import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createCompositeAccessVerifier88D} from './composite-access-verifier.mjs';
import {createHttpObservationHandler87B} from '../http87/read-only-http.mjs';
import {writeOccurrence85C} from '../storage-contract/storage-contract.mjs';
import {createExplorerObservationClient87C} from '../browser87/explorer-observation-client.mjs';

const issuer='https://lab.cloudflareaccess.com',audience='siyayo-88e-lab';
const RSA=()=>generateKeyPairSync('rsa',{modulusLength:2048});
const A=RSA(),B=RSA();
const publicJwk=(pair,kid)=>({...pair.publicKey.export({format:'jwk'}),kid,alg:'RS256',use:'sig'});
const JWK_A=publicJwk(A,'A'),JWK_B=publicJwk(B,'B');
const QWS=[['WHICH','which.use.determiner'],['WHAT','what.use.object-question'],
 ['WHERE','where.use.location-question'],['WHY','why.use.contextual-reason']];
const LANG=['en','es','pt'],PURPOSE=['assessment','exploration'];
const policy=(subject,q='WHICH',l='en',p='assessment')=>({subject,policyId:q+'.'+l+'.'+p,
 skillId:QWS.find(x=>x[0]===q)[1],language:l,originExperienceId:'shopping-for-dinner',
 contractVersion:'0.1.0',questionWord:q,purpose:p});
const policies=subject=>QWS.flatMap(([q])=>LANG.flatMap(l=>PURPOSE.map(p=>policy(subject,q,l,p))));
const b64=x=>Buffer.from(JSON.stringify(x)).toString('base64url');
function jwt({subject='learnerA',sid='sessionA1',extra={},pair=A,kid='A'}={}){
 const header={alg:'RS256',typ:'JWT',kid};
 const body={iss:issuer,aud:[audience],type:'app',sub:subject,sid,iat:900,nbf:900,exp:1100,...extra};
 const content=b64(header)+'.'+b64(body);
 return content+'.'+sign('RSA-SHA256',Buffer.from(content),pair.privateKey).toString('base64url');
}
const req=(token=jwt(),path='/__lab/v30/observations',method='GET')=>
 new Request('https://lab.invalid'+path,{method,headers:token?{'Cf-Access-Jwt-Assertion':token}:{}});
const occurrence=n=>({eventId:'f7027810-0c12-4b65-ae3e-'+n.toString(16).padStart(12,'0'),
 sourceOccurrenceId:'choice-select:1',currentExperienceId:'shopping-for-dinner',event:{choice:'books'}});
class Node{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this._text='';this.dataset={};}
 set textContent(x){this._text=String(x);this.children=[];}
 get textContent(){return this._text+this.children.map(c=>c.textContent).join('');}
 append(...items){this.children.push(...items);}
 replaceChildren(...items){this._text='';this.children=items;}
 set innerHTML(_){throw Error('HTML_FORBIDDEN');}
}
const doc={createElement:tag=>new Node(tag)};
const view=(extra={})=>({viewerKey:'nick-display',questionWord:'WHICH',language:'en',experienceId:'shopping-for-dinner',...extra});

function lab(t,{policiesForSubject=policies}={}){
 let clock=1000,keys=[JWK_A,JWK_B],keyFailure=false,sessionFailure=false;
 const revoked=new Set(),sessions=new Map([
 ['sessionA1',{ok:true,subject:'learnerA',sessionId:'sessionA1',issuedAt:900,expiresAt:1100}],
 ['sessionA2',{ok:true,subject:'learnerA',sessionId:'sessionA2',issuedAt:900,expiresAt:1100}],
 ['sessionB1',{ok:true,subject:'learnerB',sessionId:'sessionB1',issuedAt:900,expiresAt:1100}]
 ]);
 const sqlite=new DatabaseSync(':memory:');
 sqlite.exec(readFileSync(new URL('../../migrations/0004_v30_85c_occurrences.sql',import.meta.url),'utf8'));
 t.after(()=>sqlite.close());
 const metrics={reads:0,writes:0};
 const db={prepare(sql){const prepared=sqlite.prepare(sql);let args=[];
  return {bind(...x){args=x;return this;},
   async run(){metrics.writes++;const z=prepared.run(...args);return {meta:{changes:z.changes}};},
   async first(){return prepared.get(...args)??null;},
   async all(){metrics.reads++;return {results:prepared.all(...args)};}};
 }};
 const verifier=createCompositeAccessVerifier88D({issuer,audience,now:()=>clock,
  fetchTrustedKeys:async()=>{if(keyFailure)throw Error('JWKS_DOWN');return {issuer,ttl:60,keys};},
  resolveVerifiedSession:async s=>{if(sessionFailure)throw Error('SESSION_DOWN');return sessions.get(s)||null;},
  isRevoked:async x=>{if(sessionFailure)throw Error('REVOCATION_DOWN');return revoked.has(x.sessionId);}
 });
 const http=createHttpObservationHandler87B({verifier,policiesForSubject,db});
 const seed=async({subject='learnerA',q='WHICH',lang='en',purpose='assessment',n=1}={})=>{
  const result=await writeOccurrence85C({db,
   identity:{ok:true,principal:{subject,sessionId:'lab-insert'}},
   policy:policy(subject,q,lang,purpose),submission:occurrence(n)});
  assert.equal(result.ok,true,JSON.stringify(result));
 };
 const fetch=async(token=jwt(),path='/__lab/v30/observations',method='GET')=>
  http.fetch(req(token,path,method));
 const client=(token=jwt())=>{
  const element=new Node();
  const ui=createExplorerObservationClient87C({document:doc,element,
   fetchSameOrigin:async(path,opts)=>{
    assert.equal(path,'/__lab/v30/observations');
    assert.equal(opts.credentials,'same-origin');
    assert.deepEqual(Object.keys(opts.headers),['Accept']);
    return fetch(token,path,opts.method);
   }});
  return {ui,element};
 };
 return {sqlite,metrics,seed,fetch,client,revoked,
  expire:()=>clock=1100,advance:x=>clock=x,rotate:x=>keys=x,
  keysDown:()=>keyFailure=true,sessionsDown:()=>sessionFailure=true};
}
const cell=(d,q='WHICH',l='en')=>d.cells.find(c=>c.questionWord===q&&c.language===l);
test('RS256 -> session -> policy -> SQLite -> HTTP -> HOW TO SHOW',async t=>{
 const l=lab(t);await l.seed();const {ui,element}=l.client();
 ui.selectContext(view({language:'pt'}));const before=l.metrics.writes;
 assert.equal(await ui.refresh(),true);assert.match(element.textContent,/REGISTROS OBSERVADOS/);
 assert.match(element.textContent,/◐ 0 exploratórias · 1 pendentes/);
 assert.equal(l.metrics.writes,before);
 assert.doesNotMatch(element.textContent,/3\/3|GREEN PASS/);
});
test('12 presentation cells for four QWs and EN/ES/PT',async t=>{
 const l=lab(t);let n=0;
 for(const [q] of QWS)for(const lang of LANG)for(const purpose of PURPOSE)
  await l.seed({q,lang,purpose,n:++n});
 const r=await l.fetch(),d=await r.json();assert.equal(r.status,200);assert.equal(d.cells.length,12);
 assert.ok(d.cells.every(c=>c.pendingOccurrences===1&&c.exploratoryObservations===1));
 assert.ok(d.cells.every(c=>c.acceptedProgress===null&&!c.confirmed&&!c.greenPass));
});
test('language and QW switching does not create evaluator credit',async t=>{
 const l=lab(t);await l.seed();const {ui,element}=l.client();
 for(const [q] of QWS)for(const lang of LANG){
  ui.selectContext(view({questionWord:q,language:lang,experienceId:'preparing-dinner'}));
  assert.equal(await ui.refresh(),true);assert.equal(ui.state().language,lang);
  assert.doesNotMatch(element.textContent,/1\/3|2\/3|3\/3/);
 }
});
test('another learner using same NICK receives no record',async t=>{
 const l=lab(t);await l.seed();
 assert.equal((await l.fetch(jwt({subject:'learnerB',sid:'sessionB1'}))).status,404);
});
test('two independently stored learners never exchange observations',async t=>{
 const l=lab(t);await l.seed();await l.seed({subject:'learnerB',n:2});
 const r=await l.fetch(jwt({subject:'learnerB',sid:'sessionB1'}));const d=await r.json();
 assert.equal(r.status,200);assert.equal(cell(d).pendingOccurrences,1);
 assert.equal(JSON.stringify(d).includes('learnerA'),false);
});
test('signed JWT subject cannot borrow a different learner session',async t=>{
 const l=lab(t);await l.seed();assert.equal((await l.fetch(jwt({subject:'learnerB',sid:'sessionA1'}))).status,401);
});
test('revoked individual session is 401 but sibling session works',async t=>{
 const l=lab(t);await l.seed();l.revoked.add('sessionA1');
 assert.equal((await l.fetch()).status,401);
 assert.equal((await l.fetch(jwt({sid:'sessionA2'}))).status,200);
});
test('logout clears panel and revoked re-login fails closed',async t=>{
 const l=lab(t);await l.seed();const {ui,element}=l.client();
 ui.selectContext(view());assert.equal(await ui.refresh(),true);
 ui.logout();assert.equal(element.children.length,0);assert.equal(await ui.refresh(),false);
 l.revoked.add('sessionA1');ui.selectContext(view());
 assert.equal(await ui.refresh(),false);assert.equal(ui.state().outcome,'authentication_required');
});
test('revocation storage outage denies without SQLite read',async t=>{
 const l=lab(t);await l.seed();const reads=l.metrics.reads;
 l.sessionsDown();assert.equal((await l.fetch()).status,401);assert.equal(l.metrics.reads,reads);
});
test('expired token denied without SQLite read',async t=>{
 const l=lab(t);await l.seed();l.expire();assert.equal((await l.fetch()).status,401);
});
test('wrong Access audience fails before reading SQLite',async t=>{
 const l=lab(t);await l.seed();const before=l.metrics.reads;
 assert.equal((await l.fetch(jwt({extra:{aud:['foreign']}}))).status,401);
 assert.equal(l.metrics.reads,before);
});
test('tampering signed payload fails before reading SQLite',async t=>{
 const l=lab(t);await l.seed();const sections=jwt().split('.');
 sections[1]=b64({...JSON.parse(Buffer.from(sections[1],'base64url')),sub:'learnerB'});
 const before=l.metrics.reads;
 assert.equal((await l.fetch(sections.join('.'))).status,401);assert.equal(l.metrics.reads,before);
});
test('trusted signing key overlap is accepted',async t=>{
 const l=lab(t);await l.seed();
 assert.equal((await l.fetch(jwt({pair:B,kid:'B'}))).status,200);
});
test('expired JWKS with backend outage fails closed',async t=>{
 const l=lab(t);await l.seed();await l.fetch();l.advance(1060);l.keysDown();
 const before=l.metrics.reads;
 assert.equal((await l.fetch()).status,401);assert.equal(l.metrics.reads,before);
});
test('rotated-out key rejected; newly allowed signer succeeds',async t=>{
 const l=lab(t);await l.seed();await l.fetch();l.advance(1060);l.rotate([JWK_B]);
 assert.equal((await l.fetch()).status,401);assert.equal((await l.fetch(jwt({pair:B,kid:'B'}))).status,200);
});
test('server policy mismatch denied 403 before SQLite',async t=>{
 const l=lab(t,{policiesForSubject:s=>[{...policy(s),subject:'wrong'}]});
 assert.equal((await l.fetch()).status,403);assert.equal(l.metrics.reads,0);
});
test('absence of authorized history returns 404',async t=>{
 const l=lab(t);assert.equal((await l.fetch()).status,404);
});
test('tampered SQLite SHA fails 503 and clears shown observation',async t=>{
 const l=lab(t);await l.seed();const {ui,element}=l.client();
 ui.selectContext(view());assert.equal(await ui.refresh(),true);
 l.sqlite.prepare('UPDATE v30_85c_occurrences SET payload_sha256=?').run('0'.repeat(64));
 assert.equal(await ui.refresh(),false);assert.equal(ui.state().outcome,'unavailable');
 assert.doesNotMatch(element.textContent,/◐/);
});
test('GET cannot mutate D1 or create accepted evidence',async t=>{
 const l=lab(t);await l.seed();const writes=l.metrics.writes;
 const r=await l.fetch(),d=await r.json();assert.equal(r.status,200);assert.equal(l.metrics.writes,writes);
 assert.ok(d.cells.every(c=>c.acceptedProgress===null&&!c.confirmed&&!c.greenPass));
});
test('closed write/read diagnostic endpoints and POST remain blocked',async t=>{
 const l=lab(t);for(const p of ['read-once','read-other','write-once'])
  assert.equal((await l.fetch(jwt(),'/__lab/v30/'+p)).status,404);
 assert.equal((await l.fetch(jwt(),'/__lab/v30/observations','POST')).status,405);
});
test('query-supplied nickname or principal is refused',async t=>{
 const l=lab(t);
 for(const q of ['nick=ANY','subject=learnerB','questionWord=WHY'])
  assert.equal((await l.fetch(jwt(),'/__lab/v30/observations?'+q)).status,400);
});
test('only sanitized no-store snapshot is exposed',async t=>{
 const l=lab(t);await l.seed();const r=await l.fetch(),s=await r.text();
 assert.equal(r.status,200);assert.match(r.headers.get('cache-control'),/no-store/);
 assert.equal(r.headers.get('access-control-allow-origin'),null);
 for(const forbidden of ['learnerA','sessionA1','lab-insert','choice-select:1','"books"','scopeKey'])
  assert.equal(s.includes(forbidden),false,forbidden);
});
