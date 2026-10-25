// Genuine Miniflare D1 binding / workerd local runtime. NO remote D1 or auth.
import test from 'node:test';
import assert from 'node:assert/strict';
import {Miniflare} from 'miniflare';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createGuardedBatchCandidate} from '../h14-50/guarded-batch-candidate.mjs';
import {readOccurrence85C} from '../storage-contract/storage-contract.mjs';
const ddl=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL('./fixture_export.py',import.meta.url))],{encoding:'utf8'}));
const request={sessionHandle:'MOCK_SESSION',eventId:'f7027810-0c12-4b65-ae3e-18f538d67e18',targetId:'MOCK_TARGET',actionReference:'MOCK_ACTION',intent:'start',expectedRevision:1};
const id2='72db13d6-27db-4bc0-a99f-3b71a643ec14';
async function fixture(t){
 const dir=mkdtempSync(join(tmpdir(),'h1451-d1-'));
 const options={modules:true,script:'export default {fetch(){return new Response("lab disabled",{status:404});}}',compatibilityDate:'2026-07-30',d1Databases:{DB:'h1451-synthetic-db'},d1Persist:dir,port:0};
 let mf=new Miniflare(options);
 t.after(async()=>{await mf.dispose();rmSync(dir,{recursive:true,force:true});});
 let raw=await mf.getD1Database('DB');
 // Python exports DDL only: every query below uses the actual Miniflare D1 API.
 for(const sql of ddl.schema.split(';').filter(s=>s.trim()))await raw.prepare(sql).run();
 await raw.prepare('CREATE TABLE mock_h1448_gate(id INTEGER PRIMARY KEY CHECK(id=1),enabled INTEGER NOT NULL CHECK(enabled IN (0,1)))').run();
 await raw.prepare('INSERT INTO mock_h1448_gate VALUES(1,1)').run();
 for(const sql of ddl.triggers)await raw.prepare(sql).run();
 await raw.prepare('CREATE TABLE mock_h1450_assertion(id INTEGER PRIMARY KEY CHECK(id=1),ok INTEGER NOT NULL CHECK(ok=1))').run();
 const policy={subject:'mock-a',skillId:'why.use.contextual-reason',language:'en',originExperienceId:'shopping-for-dinner',contractVersion:'0.1.0',questionWord:'WHY',purpose:'assessment'};
 const binding={skillId:policy.skillId,questionWord:'WHY',language:'en',dimension:'reason-answer(local)',contractId:'MOCK_CONTRACT',contractVersion:'0.1.0',originExperienceId:policy.originExperienceId,currentExperienceId:policy.originExperienceId};
 await raw.prepare('INSERT INTO mock_sessions VALUES (?,?,0,4102444800)').bind('MOCK_SESSION','mock-a').run();
 await raw.prepare('INSERT INTO mock_targets VALUES (?,?,1,1,0,4102444800,?)').bind('MOCK_TARGET','mock-a',JSON.stringify(binding)).run();
 await raw.prepare('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)').bind('mock-a','MOCK_ACTION','MOCK_TARGET','not_exposed','MOCK_EXPOSURE').run();
 const identity={ok:true,principal:{subject:'mock-a',sessionId:'mock-session',expiresAt:4102444800}};
 const target={id:'MOCK_TARGET',status:'AUTHORIZED',revoked:false,expiresAt:4102444800,...policy,...binding,allowedIntents:['start','resume','transfer']};
 const action={reference:'MOCK_ACTION',subject:'mock-a',targetId:'MOCK_TARGET',source:'DIRECT_LEARNER_ACTION',verified:true,exposureReference:'MOCK_EXPOSURE',modelExposure:'not_exposed',sourceOccurrenceId:'MOCK_ACTION',language:'en',originExperienceId:policy.originExperienceId,currentExperienceId:policy.originExperienceId,dimension:'reason-answer(local)'};
 const f={mf,raw,policy,identity,target,action,exists:false,batches:0};
 const db={prepare:sql=>raw.prepare(sql),batch:async statements=>{
  f.batches++;
  if(f.beforeBatch)await f.beforeBatch();
  if(f.failAfterInsert)statements.splice(4,0,raw.prepare('INSERT INTO mock_h1450_assertion(id,ok) VALUES(2,0)'));
  try{const r=await raw.batch(statements);if(f.loseResponse){f.loseResponse=false;throw Error('injected lost response after commit');}return r;}
  catch(error){f.batchError=String(error);throw error;}
 }};
 f.db=db;
 f.restart=async()=>{await mf.dispose();mf=new Miniflare(options);raw=await mf.getD1Database('DB');f.mf=mf;f.raw=raw;};
 const services={now:()=>Math.floor(Date.now()/1000),resolveIdentity:async()=>identity,resolveTarget:async()=>target,resolveAction:async()=>action,resolveScope:async key=>({...key,exists:f.exists})};
 f.candidate=(enabled=true)=>createGuardedBatchCandidate({enabled,db,...services});
 f.submit=(patch={})=>f.candidate().submit({...request,...patch});
 f.counts=async()=>Promise.all(['v30_85c_occurrences','mock_scope_reservations','mock_action_consumption','mock_h1450_assertion'].map(table=>raw.prepare(`SELECT count(*) AS n FROM ${table}`).first('n')));
 return f;
}
test('Miniflare D1 accepts actual candidate batch, bindings and return metadata',async t=>{const f=await fixture(t);const r=await f.submit();assert.equal(r.receipt,'created');assert.equal(r.evidenceAllowed,false);assert.equal(f.batches,1);assert.deepEqual(await f.counts(),[1,1,1,0]);});
test('D1 CHECK precondition aborts zero-match authorization batch',async t=>{const f=await fixture(t);f.beforeBatch=()=>f.raw.prepare('DELETE FROM mock_targets').run();assert.equal((await f.submit()).reason,'guarded_batch_failed');assert.match(f.batchError,/CHECK|constraint/i);assert.deepEqual(await f.counts(),[0,0,0,0]);});
test('D1 batch rolls back scope claim and occurrence on later SQL failure',async t=>{const f=await fixture(t);f.failAfterInsert=true;assert.equal((await f.submit()).reason,'guarded_batch_failed');assert.deepEqual(await f.counts(),[0,0,0,0]);});
test('target revocation after prepare is checked inside real local D1 batch',async t=>{const f=await fixture(t);f.beforeBatch=()=>f.raw.prepare('UPDATE mock_targets SET revoked=1').run();assert.equal((await f.submit()).reason,'guarded_batch_failed');assert.deepEqual(await f.counts(),[0,0,0,0]);});
test('stale revision and expired target leave no partial reservations',async t=>{const f=await fixture(t);assert.equal((await f.submit({expectedRevision:2})).reason,'guarded_batch_failed');assert.deepEqual(await f.counts(),[0,0,0,0]);f.beforeBatch=()=>f.raw.prepare('UPDATE mock_targets SET expires=1').run();assert.equal((await f.submit()).reason,'guarded_batch_failed');assert.deepEqual(await f.counts(),[0,0,0,0]);});
test('retry after scope creation is duplicate without another batch',async t=>{const f=await fixture(t);await f.submit();f.exists=true;assert.equal((await f.submit()).receipt,'duplicate');assert.equal(f.batches,1);assert.deepEqual(await f.counts(),[1,1,1,0]);});
test('same action different UUID cannot be consumed twice',async t=>{const f=await fixture(t);await f.submit();f.exists=true;assert.equal((await f.submit({eventId:id2,intent:'resume'})).reason,'guarded_batch_failed');assert.deepEqual(await f.counts(),[1,1,1,0]);});
test('eight simultaneous submissions use one row and one action claim',async t=>{const f=await fixture(t);const results=await Promise.all(Array.from({length:8},()=>f.submit()));assert.equal(results.filter(r=>r.receipt==='created').length,1);assert.equal(results.filter(r=>r.receipt==='duplicate').length,7);assert.deepEqual(await f.counts(),[1,1,1,0]);});
test('lost response after D1 batch commit recovers stable receipt',async t=>{const f=await fixture(t);f.loseResponse=true;assert.equal((await f.submit()).reason,'guarded_batch_failed');assert.deepEqual(await f.counts(),[1,1,1,0]);f.exists=true;assert.equal((await f.submit()).receipt,'duplicate');});
test('disabled gate rejects inserts; historical reads stay available',async t=>{const f=await fixture(t);await f.raw.prepare('UPDATE mock_h1448_gate SET enabled=0').run();assert.equal((await f.submit()).reason,'guarded_batch_failed');assert.deepEqual(await f.counts(),[0,0,0,0]);});
test('EN ES PT candidate rows read with unchanged 85C reader over D1 binding',async t=>{const f=await fixture(t);const ids=[request.eventId,id2,'a9515c2a-9f83-4945-b185-3c55720f9c9d'];for(const [i,language] of ['en','es','pt'].entries()){f.target.language=f.action.language=language;const ref='MOCK_ACTION_'+language;f.action.reference=f.action.sourceOccurrenceId=ref;await f.raw.prepare("UPDATE mock_targets SET binding_json=json_set(binding_json,'$.language',?)").bind(language).run();await f.raw.prepare('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)').bind('mock-a',ref,'MOCK_TARGET','not_exposed','MOCK_EXPOSURE').run();assert.equal((await f.submit({eventId:ids[i],actionReference:ref})).receipt,'created');const r=await readOccurrence85C({identity:f.identity,policy:{...f.policy,language},eventId:ids[i],db:f.raw});assert.equal(r.ok,true);assert.equal(r.event.language,language);}assert.deepEqual(await f.counts(),[3,3,3,0]);});
test('default opt-in prevents candidate writes',async t=>{const f=await fixture(t);assert.equal((await f.candidate(false).submit(request)).reason,'adapter_disabled');assert.equal(f.batches,0);assert.deepEqual(await f.counts(),[0,0,0,0]);});
test('persisted D1 local state survives full runtime dispose and recreation',async t=>{const f=await fixture(t);await f.submit();await f.restart();f.exists=true;assert.equal((await f.submit()).receipt,'duplicate');assert.deepEqual(await f.counts(),[1,1,1,0]);});
test('different UUIDs racing for one new action have one winner',async t=>{const f=await fixture(t);await f.submit();f.exists=true;f.action.reference=f.action.sourceOccurrenceId='MOCK_NEW_ACTION';await f.raw.prepare('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)').bind('mock-a','MOCK_NEW_ACTION','MOCK_TARGET','not_exposed','MOCK_EXPOSURE').run();const ids=[id2,'a9515c2a-9f83-4945-b185-3c55720f9c9d'];const r=await Promise.all(ids.map(eventId=>f.submit({eventId,actionReference:'MOCK_NEW_ACTION',intent:'resume'})));assert.equal(r.filter(v=>v.receipt==='created').length,1);assert.equal(r.filter(v=>v.reason==='guarded_batch_failed').length,1);assert.deepEqual(await f.counts(),[2,1,2,0]);});
