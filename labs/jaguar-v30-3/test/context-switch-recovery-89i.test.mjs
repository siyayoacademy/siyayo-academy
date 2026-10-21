// V30.3.89I — cross-navigation offline memory recovery. TEST-ONLY.
// No browser secrets, Cloudflare Access, remote D1, production code or canonical credit.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createLocalObservationGateway86} from './integration/local-observation-gateway.mjs';
import {restoreHistory85D} from './storage-contract/restore-observer.mjs';
import {createExplorerObservationClient87C} from './browser87/explorer-observation-client.mjs';
import {read89D,inspect89D} from '../scripts/check-staging-architecture-89d.mjs';
const migration=readFileSync(new URL('../migrations/0004_v30_85c_occurrences.sql',import.meta.url),'utf8');
const QWS=Object.freeze([
 ['WHICH','which.use.determiner'],
 ['WHAT','what.use.object-question'],
 ['WHERE','where.use.location-question'],
 ['WHY','why.use.contextual-reason']
]);
const LANG=Object.freeze(['en','es','pt']),PURPOSE=Object.freeze(['assessment','exploration']);
const issuer='synthetic-89i-issuer',audience='synthetic-89i-aud';
const uuid=n=>'f7027810-0c12-4b65-ae3e-'+n.toString(16).padStart(12,'0');
const proof=(subject,extra={})=>({ok:true,subject,sessionId:'synthetic-session-'+subject,
 issuer,audience,issuedAt:900,expiresAt:1100,revoked:false,...extra});
const policy=(subject,word='WHICH',language='en',purpose='assessment',origin='shopping-for-dinner',version='0.1.0')=>({
 subject,skillId:QWS.find(q=>q[0]===word)[1],language,originExperienceId:origin,
 contractVersion:version,questionWord:word,purpose,policyId:word+'.'+language+'.'+purpose
});
const submission=(n,experience='shopping-for-dinner')=>({
 eventId:uuid(n),sourceOccurrenceId:'choice-select:'+n,
 currentExperienceId:experience,event:{choice:'synthetic-option-'+n}
});
const req=(word='WHICH',lang='en',n=1,opts={})=>({
 sessionHandle:opts.sessionHandle??'a',nick:opts.nick??'JAGUAR',
 policyId:word+'.'+lang+'.'+(opts.purpose??'assessment'),
 submission:submission(n,opts.experience??'shopping-for-dinner')
});
const view=(sessionHandle='a',nick='JAGUAR')=>({sessionHandle,nick});
const at=(snapshot,word='WHICH',lang='en')=>snapshot.cells.find(c=>c.questionWord===word&&c.language===lang);
const observational=cell=>assert.deepEqual([cell.acceptedProgress,cell.confirmed,cell.greenPass],
 [null,false,false]);

function lab(t){
 const dir=mkdtempSync(join(tmpdir(),'siyayo-89i-'));
 const filename=join(dir,'89i.sqlite');
 let sqlite=new DatabaseSync(filename);
 sqlite.exec(migration);
 const counters={sqlWrites:0,sqlReads:0};
 const db={prepare(sql){
  let args=[];
  return {
   bind(...x){args=x;return this;},
   async run(){counters.sqlWrites++;return {meta:{changes:sqlite.prepare(sql).run(...args).changes}};},
   async first(){counters.sqlReads++;return sqlite.prepare(sql).get(...args)??null;},
   async all(){counters.sqlReads++;return {results:sqlite.prepare(sql).all(...args)};}
  };
 }};
 const config={origin:'shopping-for-dinner',version:'0.1.0'};
 const sessions=new Map([['a',proof('opaque-a')],['b',proof('opaque-b')]]);
 const policiesForSubject=subject=>QWS.flatMap(([word])=>LANG.flatMap(lang=>PURPOSE.map(
   purpose=>policy(subject,word,lang,purpose,config.origin,config.version)
 )));
 const gateway=createLocalObservationGateway86({
  verifySession:async handle=>sessions.get(handle)??null,
  now:()=>1000,issuer,audience,policiesForSubject,db
 });
 const restart=()=>{sqlite.close();sqlite=new DatabaseSync(filename);};
 const countRows=()=>sqlite.prepare('SELECT count(*) as n FROM v30_85c_occurrences').get().n;
 t.after(()=>{sqlite.close();rmSync(dir,{force:true,recursive:true});});
 return {gateway,db,config,sessions,counters,restart,countRows};
}

class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this._text='';this.dataset={};}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
 replaceChildren(...n){this._text='';this.children=[...n];}
 append(...n){this.children.push(...n);}
 set innerHTML(_){throw Error('HTML_INSERTION_FORBIDDEN');}
}
const document={createElement:tag=>new Element(tag)};
const selection=(patch={})=>({viewerKey:'visual-a',questionWord:'WHICH',
 language:'en',experienceId:'shopping-for-dinner',...patch});

test('EN → ES → PT → EN restores all three independent cells across a SQLite restart',async t=>{
 const {gateway,restart,counters,countRows}=lab(t);
 for(const [n,l] of ['en','es','pt'].entries())
  assert.equal((await gateway.record(req('WHICH',l,n+1))).receipt,'created');
 assert.equal(countRows(),3);restart();
 const writesBefore=counters.sqlWrites;
 for(const selectedLanguage of ['en','es','pt','en']){
  const snap=await gateway.read(view('a','ANY DISPLAY NICK'));
  assert.equal(snap.ok,true);assert.equal(snap.cells.length,12);
  assert.equal(at(snap,'WHICH',selectedLanguage).pendingOccurrences,1);
  assert.equal(at(snap,'WHAT',selectedLanguage).pendingOccurrences,0);
  snap.cells.forEach(observational);
 }
 assert.equal(counters.sqlWrites,writesBefore);
});

test('WHAT → WHERE → WHAT returns to earlier observation without resetting or cross-credit',async t=>{
 const {gateway}=lab(t);
 assert.equal((await gateway.record(req('WHAT','pt',1))).ok,true);
 let snap=await gateway.read(view());
 assert.equal(at(snap,'WHAT','pt').pendingOccurrences,1);
 assert.equal(at(snap,'WHERE','pt').pendingOccurrences,0);
 assert.equal((await gateway.record(req('WHERE','pt',2))).ok,true);
 snap=await gateway.read(view());
 assert.equal(at(snap,'WHAT','pt').pendingOccurrences,1);
 assert.equal(at(snap,'WHERE','pt').pendingOccurrences,1);
 assert.equal(at(snap,'WHY','pt').pendingOccurrences,0);
 observational(at(snap,'WHAT','pt'));observational(at(snap,'WHERE','pt'));
});

test('S1 Shopping → S2 Preparing → S3 Having keeps a single authorized origin',async t=>{
 const {gateway,db,restart}=lab(t);
 for(const [n,currentExperience] of ['shopping-for-dinner','preparing-dinner','having-dinner'].entries())
  assert.equal((await gateway.record(req('WHAT','en',n+1,{experience:currentExperience}))).ok,true);
 restart();
 const snap=await gateway.read(view());assert.equal(at(snap,'WHAT','en').pendingOccurrences,3);
 const history=await restoreHistory85D({
  identity:{ok:true,principal:{subject:'opaque-a',sessionId:'synthetic-session-opaque-a'}},
  policy:policy('opaque-a','WHAT','en'),
  db
 });
 assert.equal(history.ok,true);assert.equal(history.events.length,3);
 assert.deepEqual(history.events.map(e=>e.currentExperienceId),
  ['shopping-for-dinner','preparing-dinner','having-dinner']);
 assert.ok(history.events.every(e=>e.originExperienceId==='shopping-for-dinner'&&e.status==='pending'));
 assert.equal(history.events.some(e=>'credit' in e||'greenPass' in e),false);
});

test('new origin Experience uses separate server-issued scope; returning restores previous rows',async t=>{
 const {gateway,config,restart,countRows}=lab(t);
 assert.equal((await gateway.record(req('WHICH','es',1))).ok,true);
 config.origin='having-dinner';
 assert.equal(at(await gateway.read(view()),'WHICH','es').pendingOccurrences,0);
 assert.equal((await gateway.record(req('WHICH','es',2,{experience:'having-dinner'}))).ok,true);
 assert.equal(at(await gateway.read(view()),'WHICH','es').pendingOccurrences,1);
 assert.equal(countRows(),2);restart();
 config.origin='shopping-for-dinner';
 assert.equal(at(await gateway.read(view()),'WHICH','es').pendingOccurrences,1);
 config.origin='having-dinner';
 assert.equal(at(await gateway.read(view()),'WHICH','es').pendingOccurrences,1);
});

test('contract version changes hide older history, but do not erase it',async t=>{
 const {gateway,config,countRows}=lab(t);
 assert.equal((await gateway.record(req('WHY','pt',1))).ok,true);
 config.version='0.2.0';
 assert.equal(at(await gateway.read(view()),'WHY','pt').pendingOccurrences,0);
 assert.equal((await gateway.record(req('WHY','pt',2))).ok,true);
 assert.equal(at(await gateway.read(view()),'WHY','pt').pendingOccurrences,1);
 config.version='0.1.0';
 assert.equal(at(await gateway.read(view()),'WHY','pt').pendingOccurrences,1);
 assert.equal(countRows(),2);
});

test('different students sharing one NICK are isolated; changing NICK leaves own history intact',async t=>{
 const {gateway}=lab(t);
 assert.equal((await gateway.record(req('WHERE','en',1,{nick:'SHARED'}))).ok,true);
 let a=await gateway.read(view('a','SHARED')),b=await gateway.read(view('b','SHARED'));
 assert.equal(at(a,'WHERE','en').pendingOccurrences,1);
 assert.equal(at(b,'WHERE','en').pendingOccurrences,0);
 a=await gateway.read(view('a','RENAMED'));
 assert.equal(at(a,'WHERE','en').pendingOccurrences,1);
 assert.equal(JSON.stringify(a).includes('opaque-a'),false);
 assert.equal(JSON.stringify(a).includes('SHARED'),false);
});

test('synthetic session expiry and revocation deny access; fresh same-subject login can restore',async t=>{
 const {gateway,sessions}=lab(t);
 assert.equal((await gateway.record(req('WHICH','pt',1))).ok,true);
 sessions.set('a',proof('opaque-a',{expiresAt:1000}));
 assert.equal((await gateway.read(view('a','JAGUAR'))).reason,'unauthenticated');
 sessions.set('a',proof('opaque-a',{revoked:true}));
 assert.equal((await gateway.read(view('a','JAGUAR'))).reason,'unauthenticated');
 assert.equal((await gateway.record(req('WHAT','pt',2))).reason,'unauthenticated');
 sessions.delete('a');
 sessions.set('a-new',proof('opaque-a',{sessionId:'synthetic-new-session'}));
 const snap=await gateway.read(view('a-new','AFTER LOGIN'));
 assert.equal(at(snap,'WHICH','pt').pendingOccurrences,1);
 assert.equal(at(await gateway.read(view('b','AFTER LOGIN')),'WHICH','pt').pendingOccurrences,0);
});

test('replayed event ID across QW or language is rejected rather than reattributed',async t=>{
 const {gateway,countRows}=lab(t);
 assert.equal((await gateway.record(req('WHICH','en',1))).receipt,'created');
 assert.equal((await gateway.record(req('WHICH','en',1))).receipt,'duplicate');
 assert.equal((await gateway.record(req('WHAT','en',1))).reason,'occurrence_conflict');
 assert.equal((await gateway.record(req('WHICH','es',1))).reason,'occurrence_conflict');
 assert.equal(countRows(),1);
});

test('exploratory and pending counts remain distinct throughout QW/locale switching',async t=>{
 const {gateway}=lab(t);
 assert.equal((await gateway.record(req('WHY','es',1,{purpose:'exploration'}))).ok,true);
 assert.equal((await gateway.record(req('WHY','es',2))).ok,true);
 assert.equal((await gateway.record(req('WHY','pt',3,{purpose:'exploration'}))).ok,true);
 const s=await gateway.read(view());
 assert.deepEqual([at(s,'WHY','es').exploratoryObservations,at(s,'WHY','es').pendingOccurrences],[1,1]);
 assert.deepEqual([at(s,'WHY','pt').exploratoryObservations,at(s,'WHY','pt').pendingOccurrences],[1,0]);
 assert.deepEqual([at(s,'WHY','en').exploratoryObservations,at(s,'WHY','en').pendingOccurrences],[0,0]);
 s.cells.forEach(observational);
});

test('client cannot assign subject, evaluator progress or unauthorized language',async t=>{
 const {gateway,countRows}=lab(t);
 for(const extra of [{subject:'opaque-b'},{greenPass:true},{status:'confirmed'},{language:'es'}]){
  const result=await gateway.record({...req(),...extra});
  assert.equal(result.reason,'invalid_request');
 }
 assert.equal((await gateway.record({...req(),policyId:'WHAT.fr.assessment'})).reason,'forbidden');
 assert.equal(countRows(),0);
});

test('browser can switch language/QW/Experience without mutating D1 or using JWT headers',async t=>{
 const {gateway,counters}=lab(t);
 assert.equal((await gateway.record(req('WHICH','en',1))).ok,true);
 assert.equal((await gateway.record(req('WHAT','pt',2))).ok,true);
 const writesBefore=counters.sqlWrites;
 const element=new Element(),calls=[];
 const client=createExplorerObservationClient87C({
  document,element,fetchSameOrigin:async(url,opts)=>{
   calls.push({url,method:opts.method,credentials:opts.credentials,cache:opts.cache,
    headers:Object.keys(opts.headers)});
   const snap=await gateway.read(view());
   return new Response(JSON.stringify(snap),{status:200,headers:{'content-type':'application/json'}});
  }
 });
 for(const [q,l,exp] of [
  ['WHICH','en','shopping-for-dinner'],['WHAT','pt','preparing-dinner'],
  ['WHY','es','having-dinner'],['WHICH','en','shopping-for-dinner']
 ]){
  assert.equal(client.selectContext(selection({questionWord:q,language:l,experienceId:exp})),true);
  assert.equal(client.state().language,l);
  assert.equal(await client.refresh(),true);
  assert.equal(client.state().outcome,'shown');
  assert.doesNotMatch(element.textContent,/1\/3|2\/3|3\/3|Green Pass awarded/i);
  assert.match(element.textContent,/not accepted evidence or Green Pass|no son evidencias aceptadas ni Green Pass|não são evidências aceitas nem Green Pass/i);
  assert.ok(!element.textContent.includes('opaque-a'));
 }
 assert.equal(counters.sqlWrites,writesBefore);
 assert.equal(calls.length,4);
 assert.ok(calls.every(x=>x.url==='/__lab/v30/observations'&&x.method==='GET'&&
   x.credentials==='same-origin'&&x.cache==='no-store'&&
   x.headers.join(',')==='Accept'));
 client.logout();assert.equal(client.state().active,false);assert.equal(element.children.length,0);
});

test('a browser viewer key does not change the authenticated subject',async t=>{
 const {gateway}=lab(t);
 assert.equal((await gateway.record(req('WHERE','es',1))).ok,true);
 let realSession='a';
 const element=new Element();
 const client=createExplorerObservationClient87C({document,element,
  fetchSameOrigin:async()=>{
   const snapshot=await gateway.read(view(realSession,'ANY NICK'));
   return new Response(JSON.stringify(snapshot),{status:200,headers:{'content-type':'application/json'}});
  }
 });
 assert.equal(client.selectContext(selection({viewerKey:'opaque-b',language:'es'})),true);
 assert.equal(await client.refresh(),true);
 assert.match(element.textContent,/◐ 0 exploratorias · 1 pendientes/);
 realSession='b';
 assert.equal(await client.refresh(),true);
 assert.doesNotMatch(element.textContent,/◐ 0 exploratorias · 1 pendientes/);
 assert.ok(!JSON.stringify(client.state()).includes('opaque-b'));
});

test('the 89D remote deployment gate is still BLOCKED after all offline cases',()=>{
 const out=inspect89D(read89D());
 assert.equal(out.valid,true);assert.equal(out.verdict,'BLOCKED');assert.equal(out.blockedExternalGates,12);
});
