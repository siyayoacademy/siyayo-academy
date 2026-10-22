// End-to-end SQLite filesystem -> 85C -> 85D -> 85E, no deployment.
import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createLocalObservationGateway86} from './local-observation-gateway.mjs';
import {createObservationPanel85E} from '../observation-ui/observation-panel.mjs';
const base=resolve(fileURLToPath(new URL('../../',import.meta.url)));
const migration=readFileSync(join(base,'migrations/0004_v30_85c_occurrences.sql'),'utf8');
const issuer='mock-e2e-issuer',audience='mock-e2e-audience';
const words=[['WHICH','which.use.determiner'],['WHAT','what.use.object-question'],
 ['WHERE','where.use.location-question'],['WHY','why.use.contextual-reason']];
const langs=['en','es','pt'];
const id=n=>'f7027810-0c12-4b65-ae3e-'+n.toString(16).padStart(12,'0');
const policy=(subject,q='WHICH',language='en',purpose='assessment')=>{
 const skillId=words.find(x=>x[0]===q)[1];
 return {subject,skillId,language,originExperienceId:'shopping-for-dinner',
  contractVersion:'0.1.0',questionWord:q,purpose,policyId:q+'.'+language+'.'+purpose};
};
const rules=subject=>words.flatMap(([q])=>langs.flatMap(l=>['assessment','exploration'].map(p=>policy(subject,q,l,p))));
const proof=(subject,revoked=false,expiresAt=1100)=>({ok:true,subject,sessionId:'session-'+subject,
 issuer,audience,issuedAt:900,expiresAt,revoked});
const subs=(n=1,exp='shopping-for-dinner',choice='books')=>({eventId:id(n),sourceOccurrenceId:'choice-select:1',
 currentExperienceId:exp,event:{choice}});
const request=(policyId='WHICH.en.assessment',submission=subs(),sessionHandle='a',nick='JAGUAR')=>
 ({sessionHandle,nick,policyId,submission});
const view=(sessionHandle='a',nick='JAGUAR')=>({sessionHandle,nick});
class Node {
 constructor(tag){this.tagName=tag.toUpperCase();this.children=[];this._text='';this.dataset={};}
 set textContent(v){this._text=String(v);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 replaceChildren(...nodes){this._text='';this.children=[...nodes];}
 append(...nodes){this.children.push(...nodes);}
 set innerHTML(_){throw Error('HTML_INJECTION_BLOCKED');}
}
const document={createElement:tag=>new Node(tag)};
function lab(t,{policiesForSubject=rules,verifySession=null}={}){
 const folder=mkdtempSync(join(tmpdir(),'siyayo-86-')),filename=join(folder,'85c.db');
 let database=new DatabaseSync(filename);database.exec(migration);
 const metrics={write:0,read:0};
 const adapter={prepare(sql){
  const stmt=database.prepare(sql);let args=[];
  return {bind(...values){args=values;return this;},
   async run(){metrics.write++;const r=stmt.run(...args);return {meta:{changes:r.changes}};},
   async first(){return stmt.get(...args)??null;},
   async all(){metrics.read++;return {results:stmt.all(...args)};}};
 }};
 const registry=new Map([['a',proof('opaque-a')],['b',proof('opaque-b')]]);
 const sessions=verifySession??(async h=>registry.get(h)||null);
 const gateway=createLocalObservationGateway86({verifySession:sessions,now:()=>1000,
  issuer,audience,policiesForSubject,db:adapter});
 const restart=()=>{database.close();database=new DatabaseSync(filename);};
 const tamper=(sql,...args)=>database.prepare(sql).run(...args);
 t.after(()=>{database.close();rmSync(folder,{recursive:true,force:true});});
 return {gateway,registry,metrics,restart,tamper};
}
function panel(gateway,sessionHandle='a',nick='JAGUAR'){
 const element=new Node('div');
 const ui=createObservationPanel85E({document,element,
  loadSnapshot:()=>gateway.read(view(sessionHandle,nick))});
 return {element,ui};
}
const cell=(p,q='WHICH',l='en')=>p.cells.find(x=>x.questionWord===q&&x.language===l);

test('full path: SQLite write -> authz restore -> observable EN/ES/PT panel',async t=>{
 const {gateway,metrics}=lab(t);
 assert.equal((await gateway.record(request())).receipt,'created');
 const observation=await gateway.read(view());
 assert.equal(observation.ok,true);assert.equal(observation.cells.length,12);
 assert.equal(cell(observation).pendingOccurrences,1);
 const {element,ui}=panel(gateway);
 const before=metrics.write;
 assert.equal(await ui.refresh({viewKey:'authenticated-a',displayLanguage:'pt'}),true);
 assert.match(element.textContent,/REGISTROS OBSERVADOS/);
 assert.match(element.textContent,/◐ 0 exploratórias · 1 pendentes/);
 assert.equal(metrics.write,before);
 assert.doesNotMatch(element.textContent,/3\/3|GREEN PASS|CONFIRMADO/);
});
test('SQLite close/reopen preserves event observation and renders it',async t=>{
 const {gateway,restart}=lab(t);await gateway.record(request());
 restart();
 const p=await gateway.read(view());
 assert.equal(cell(p).pendingOccurrences,1);
 const {ui,element}=panel(gateway);await ui.refresh({viewKey:'a',displayLanguage:'es'});
 assert.match(element.textContent,/REGISTROS OBSERVADOS/);
});
test('transfer across S1/S2/S3 retains one origin with distinct IDs',async t=>{
 const {gateway}=lab(t);
 for(const [n,exp] of [[1,'shopping-for-dinner'],[2,'preparing-dinner'],[3,'having-dinner']])
  assert.equal((await gateway.record(request('WHICH.en.assessment',subs(n,exp)))).ok,true);
 assert.equal(cell(await gateway.read(view())).pendingOccurrences,3);
});
test('two distinct students can use one NICK without sharing records',async t=>{
 const {gateway}=lab(t);await gateway.record(request());
 assert.equal(cell(await gateway.read(view('b','JAGUAR'))).pendingOccurrences,0);
 assert.equal(cell(await gateway.read(view('a','JAGUAR'))).pendingOccurrences,1);
});
test('changing NICK does not change verified owner history',async t=>{
 const {gateway}=lab(t);await gateway.record(request());
 assert.equal(cell(await gateway.read(view('a','OUTRO NICK'))).pendingOccurrences,1);
});
test('all 12 QW × language cells are independently persisted',async t=>{
 const {gateway}=lab(t);let seq=0;
 for(const [q] of words)for(const language of langs){
  const p=q+'.'+language+'.assessment';
  assert.equal((await gateway.record(request(p,subs(++seq)))).ok,true);
 }
 const out=await gateway.read(view());
 assert.equal(out.ok,true);assert.equal(out.cells.length,12);
 assert.ok(out.cells.every(c=>c.pendingOccurrences===1&&c.acceptedProgress===null));
});
test('exploration and pending have independent counts',async t=>{
 const {gateway}=lab(t);
 await gateway.record(request('WHAT.es.assessment',subs(1)));
 await gateway.record(request('WHAT.es.exploration',subs(2)));
 const c=cell(await gateway.read(view()),'WHAT','es');
 assert.equal(c.pendingOccurrences,1);assert.equal(c.exploratoryObservations,1);
});
test('write replay is idempotent and altered replay is conflict',async t=>{
 const {gateway}=lab(t);
 assert.equal((await gateway.record(request())).receipt,'created');
 assert.equal((await gateway.record(request())).receipt,'duplicate');
 assert.equal((await gateway.record(request('WHICH.en.assessment',subs(1,'shopping-for-dinner','forged')))).reason,'occurrence_conflict');
 assert.equal(cell(await gateway.read(view())).pendingOccurrences,1);
});
test('policy ID selected by client cannot forge an unissued skill or evaluation',async t=>{
 const {gateway}=lab(t);
 assert.equal((await gateway.record(request('WHY.fr.assessment'))).reason,'forbidden');
 assert.equal((await gateway.record({...request(),subject:'opaque-b'})).reason,'invalid_request');
 assert.equal((await gateway.record({...request(),greenPass:true})).reason,'invalid_request');
 assert.equal((await gateway.record({...request(),status:'confirmed'})).reason,'invalid_request');
});
test('unverified/expired/revoked session fails closed on read and write',async t=>{
 const {gateway,registry}=lab(t);
 for(const bad of ['unknown']){
  assert.equal((await gateway.read(view(bad))).ok,false);
  assert.equal((await gateway.record(request('WHICH.en.assessment',subs(1),bad))).ok,false);
 }
 registry.set('a',proof('opaque-a',false,1000));
 assert.equal((await gateway.read(view())).reason,'unauthenticated');
 registry.set('a',proof('opaque-a',true));
 assert.equal((await gateway.record(request())).reason,'unauthenticated');
});
test('server policy denied or malformed causes no read or write',async t=>{
 const {gateway,metrics}=lab(t,{policiesForSubject:()=>[]});
 assert.equal((await gateway.read(view())).reason,'forbidden');
 assert.equal((await gateway.record(request())).reason,'forbidden');
 assert.equal(metrics.read,0);assert.equal(metrics.write,0);
});
test('server policy mismatched subject rejects future forged owner',async t=>{
 const {gateway}=lab(t,{policiesForSubject:()=>rules('opaque-b')});
 assert.equal((await gateway.read(view())).reason,'forbidden');
});
test('tampered SQL payload causes all-or-nothing observer and blank UI',async t=>{
 const {gateway,tamper}=lab(t);await gateway.record(request());
 tamper("UPDATE v30_85c_occurrences SET payload_json='{\"choice\":\"tampered\"}' WHERE learner_subject=?",'opaque-a');
 assert.equal((await gateway.read(view())).reason,'history_unavailable');
 const {ui,element}=panel(gateway);
 assert.equal(await ui.refresh({viewKey:'a'}),false);
 assert.equal(element.dataset.state,'unavailable');
 assert.doesNotMatch(element.textContent,/◐/);
});
test('UI read never exposes server subject, token or raw answers',async t=>{
 const {gateway}=lab(t);await gateway.record(request());
 const {ui,element}=panel(gateway);await ui.refresh({viewKey:'a'});
 for(const forbidden of ['opaque-a','session-opaque-a','choice-select:1','"books"','Green Pass awarded'])
  assert.equal(element.textContent.includes(forbidden),false);
});
test('no score or Green Pass can be inferred from pending observations',async t=>{
 const {gateway}=lab(t);await gateway.record(request());
 const p=await gateway.read(view());const c=cell(p);
 assert.equal(c.confirmed,false);assert.equal(c.greenPass,false);assert.equal(c.acceptedProgress,null);
 assert.equal(JSON.stringify(p).includes('scopeKey'),false);
});
test('nonnumeric attempts, malformed origin, forged nested authority rejected',async t=>{
 const {gateway}=lab(t);
 for(const s of [
  {...subs(),event:{nested:{credit:3}}},
  {...subs(),currentExperienceId:'../../admin'},
  {...subs(),event:{greenPass:true}}
 ]){
  assert.equal((await gateway.record(request('WHICH.en.assessment',s))).reason,'invalid_submission');
 }
});
test('read failure in one authorized QW does not create partial snapshot',async t=>{
 const {gateway,tamper}=lab(t);
 await gateway.record(request('WHICH.en.assessment',subs(1)));
 await gateway.record(request('WHAT.es.assessment',subs(2)));
 // The database MUST reject forged confirmation before the observer runs.
 assert.throws(()=>tamper("UPDATE v30_85c_occurrences SET status='confirmed' WHERE question_word='WHAT'"),/CHECK constraint failed/);
 // Then mutate a hash field that has valid SQL shape but violates content integrity.
 tamper("UPDATE v30_85c_occurrences SET payload_sha256=? WHERE question_word='WHAT'",'0'.repeat(64));
 assert.equal((await gateway.read(view())).reason,'history_unavailable');
});
test('no SQL mutation occurs during repeated restoration and display',async t=>{
 const {gateway,metrics}=lab(t);
 await gateway.record(request('WHY.pt.exploration'));
 const writes=metrics.write;
 for(let i=0;i<3;i++)assert.equal((await gateway.read(view())).ok,true);
 assert.equal(metrics.write,writes);
});
