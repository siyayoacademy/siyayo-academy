import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {Miniflare} from 'miniflare';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {TRUSTED_PROVENANCE_DDL} from './trusted-provenance-fixture.mjs';
import {bindingDigest} from './trusted-action-gateway.mjs';
const bundle=await build({entryPoints:[fileURLToPath(new URL('./worker-entry.mjs',import.meta.url))],bundle:true,write:false,metafile:true,format:'esm',platform:'browser',target:'es2022',external:['node:crypto','cloudflare:workers']});
const ddl=JSON.parse(execFileSync('python3',['-B',fileURLToPath(new URL('../h14-51/fixture_export.py',import.meta.url))],{encoding:'utf8'}));
const eventId='f7027810-0c12-4b65-ae3e-18f538d67e18',eventId2='72db13d6-27db-4bc0-a99f-3b71a643ec14';
const input={actionKey:'ACT-1',eventId,intent:'start'};
const now=()=>Math.floor(Date.now()/1000);
async function fixture(t,extra={},initial=true){
 const dir=mkdtempSync(join(tmpdir(),'h1453-worker-'));
 const bindings={LAB_RPC_ENABLED:true,LAB_H1453_TRUST_ENABLED:true,LAB_H1453_SESSION_HANDLE:'MOCK_SESSION',...extra};
 const options={modules:true,script:bundle.outputFiles[0].text,compatibilityDate:'2026-07-30',compatibilityFlags:['nodejs_compat'],bindings,d1Databases:{DB:'h1453-local'},d1Persist:dir,port:0};
 let mf=new Miniflare(options),stub=await mf.getWorker(),db=await mf.getD1Database('DB');
 t.after(async()=>{await mf.dispose();rmSync(dir,{recursive:true,force:true})});
 for(const sql of ddl.schema.split(';').filter(s=>s.trim()))await db.prepare(sql).run();
 await db.prepare('CREATE TABLE mock_h1448_gate(id INTEGER PRIMARY KEY CHECK(id=1),enabled INTEGER NOT NULL CHECK(enabled IN (0,1)))').run();
 await db.prepare('INSERT INTO mock_h1448_gate VALUES(1,1)').run();
 for(const sql of ddl.triggers)await db.prepare(sql).run();
 await db.prepare('CREATE TABLE mock_h1450_assertion(id INTEGER PRIMARY KEY CHECK(id=1),ok INTEGER NOT NULL CHECK(ok=1))').run();
 const binding={skillId:'why.use.contextual-reason',questionWord:'WHY',language:'en',dimension:'reason-answer(local)',contractId:'MOCK_CONTRACT',contractVersion:'0.1.0',originExperienceId:'shopping-for-dinner',currentExperienceId:'shopping-for-dinner'};
 const raw=JSON.stringify(binding);
 await db.prepare('INSERT INTO mock_sessions VALUES (?,?,0,4102444800)').bind('MOCK_SESSION','mock-a').run();
 await db.prepare('INSERT INTO mock_targets VALUES (?,?,1,1,0,4102444800,?)').bind('MOCK_TARGET','mock-a',raw).run();
 await db.prepare('INSERT INTO mock_actions VALUES (?,?,?,1,?,?)').bind('mock-a','MOCK_ACTION','MOCK_TARGET','not_exposed','MOCK_EXPOSURE').run();
 for(const sql of TRUSTED_PROVENANCE_DDL)await db.prepare(sql).run();
 if(initial)await db.prepare('INSERT INTO mock_h1453_action_provenance VALUES (?,?,?,?,?,?,?,?,?,?,?,?)')
   .bind('ACT-1','MOCK_SESSION','mock-a','MOCK_TARGET','MOCK_ACTION',1,'DIRECT_LEARNER_ACTION','not_exposed','MOCK_EXPOSURE',now(),bindingDigest(raw),'start').run();
 const f={db,submit:(v=input)=>stub.submitAction(v),read:(id=eventId)=>stub.readForTest(id),fetch:(url,init)=>stub.fetch(url,init),
  counts:()=>Promise.all(['v30_85c_occurrences','mock_scope_reservations','mock_action_consumption','mock_h1453_action_provenance','mock_h1450_assertion'].map(table=>db.prepare('SELECT count(*) AS n FROM '+table).first('n')))};
 f.restart=async()=>{await mf.dispose();mf=new Miniflare(options);stub=await mf.getWorker();db=await mf.getD1Database('DB');f.db=db;};
 return f;
}
test('bundle imports original H14.50 candidate, H14.44 and 85C',()=>{
 const inputs=Object.keys(bundle.metafile.inputs);
 for(const name of ['h14-50/guarded-batch-candidate.mjs','h14-44/server-binding-dry-run.mjs','storage-contract/storage-contract.mjs','h14-53/trusted-action-gateway.mjs'])
  assert.ok(inputs.some(p=>p.endsWith(name)),name);
});
test('synthetic SERVER session resolves provenance into local Worker and D1',async t=>{
 const f=await fixture(t),r=await f.submit();
 assert.equal(r.receipt,'created');assert.equal(r.execution,'SYNTHETIC_TRUSTED_WORKER_LOCAL');
 assert.equal(r.cryptoProof,createHash('sha256').update('H14.53-TRUST').digest('hex'));
 assert.deepEqual(await f.counts(),[1,1,1,1,0]);
 assert.equal((await f.read()).status,'pending');
});
test('HTTP remains 404, disabled RPC cannot write',async t=>{
 const f=await fixture(t,{LAB_H1453_TRUST_ENABLED:false});
 assert.equal((await f.submit()).reason,'lab_rpc_disabled');
 for(const method of ['GET','POST'])for(const p of ['/submit','/__lab/v30/write','/'])
  assert.equal((await f.fetch('https://local.invalid'+p,{method})).status,404);
 assert.deepEqual(await f.counts(),[0,0,0,1,0]);
});
test('request cannot claim subject, handle, target, revision or provenance',async t=>{
 const f=await fixture(t);
 for(const extra of [{subject:'mock-a'},{sessionHandle:'MOCK_SESSION'},{targetId:'MOCK_TARGET'},{actionReference:'MOCK_ACTION'},{expectedRevision:1},{verified:true},{exposureReference:'MOCK_EXPOSURE'}])
  assert.equal((await f.submit({...input,...extra})).reason,'invalid_request');
 assert.deepEqual(await f.counts(),[0,0,0,1,0]);
});
test('unregistered and wrong-subject action keys fail closed',async t=>{
 const f=await fixture(t);
 assert.equal((await f.submit({...input,actionKey:'MISSING'})).reason,'unverified_action_provenance');
 await f.db.prepare("INSERT INTO mock_sessions VALUES('MOCK_OTHER','mock-b',0,4102444800)").run();
 await f.db.prepare("INSERT INTO mock_h1453_action_provenance VALUES (?,?,?,?,?,?,?,?,?,?,?,?)")
 .bind('OTHER','MOCK_OTHER','mock-b','MOCK_TARGET','MOCK_ACTION',1,'DIRECT_LEARNER_ACTION','not_exposed','MOCK_EXPOSURE',now(),'0'.repeat(64),'start').run();
 assert.equal((await f.submit({...input,actionKey:'OTHER'})).reason,'unverified_action_provenance');
 assert.equal((await f.read()).reason,'not_found');
});
test('provenance record is immutable and direct learner action required',async t=>{
 const f=await fixture(t);
 await assert.rejects(f.db.prepare("UPDATE mock_h1453_action_provenance SET source='PATITA_OBSERVATION'").run());
 await assert.rejects(f.db.prepare('DELETE FROM mock_h1453_action_provenance').run());
 await f.db.prepare('UPDATE mock_actions SET direct=0').run();
 assert.equal((await f.submit()).reason,'action_provenance_changed');
 assert.deepEqual(await f.counts(),[0,0,0,1,0]);
});
test('target data tampering, action exposure tampering and revision mismatch blocked',async t=>{
 const f=await fixture(t);
 await f.db.prepare("UPDATE mock_targets SET binding_json=json_set(binding_json,'$.language','es')").run();
 assert.equal((await f.submit()).reason,'target_provenance_changed');
 await f.db.prepare("UPDATE mock_targets SET binding_json=json_set(binding_json,'$.language','en')").run();
 await f.db.prepare("UPDATE mock_actions SET exposure_reference='TAMPERED'").run();
 assert.equal((await f.submit()).reason,'action_provenance_changed');
 await f.db.prepare("UPDATE mock_actions SET exposure_reference='MOCK_EXPOSURE'").run();
 await f.db.prepare('UPDATE mock_targets SET revision=2').run();
 assert.equal((await f.submit()).reason,'guarded_batch_failed');
 assert.deepEqual(await f.counts(),[0,0,0,1,0]);
});
test('revocation after prepare or action mutation before batch prevents partial writes',async t=>{
 const f=await fixture(t,{LAB_REVOKE_BEFORE_BATCH:true});
 assert.equal((await f.submit()).reason,'guarded_batch_failed');
 assert.deepEqual(await f.counts(),[0,0,0,1,0]);
 const g=await fixture(t,{LAB_TAMPER_ACTION_BEFORE_BATCH:true});
 assert.equal((await g.submit()).reason,'guarded_batch_failed');
 assert.deepEqual(await g.counts(),[0,0,0,1,0]);
});
test('fault after claim rolls back whole guarded batch',async t=>{
 const f=await fixture(t,{LAB_INJECT_BATCH_ERROR:true});
 assert.equal((await f.submit()).reason,'guarded_batch_failed');
 assert.deepEqual(await f.counts(),[0,0,0,1,0]);
});
test('retry replay cannot create duplicate and Worker reboot preserves same 85C event',async t=>{
 const f=await fixture(t);
 assert.equal((await f.submit()).receipt,'created');
 assert.equal((await f.submit()).receipt,'duplicate');
 await f.restart();
 assert.equal((await f.submit()).receipt,'duplicate');
 assert.deepEqual(await f.counts(),[1,1,1,1,0]);
});
test('concurrent attempts produce one created and seven duplicate',async t=>{
 const f=await fixture(t),rs=await Promise.all(Array.from({length:8},()=>f.submit()));
 assert.equal(rs.filter(r=>r.receipt==='created').length,1);
 assert.equal(rs.filter(r=>r.receipt==='duplicate').length,7);
 assert.deepEqual(await f.counts(),[1,1,1,1,0]);
});
test('revoked session denies both submit and read',async t=>{
 const f=await fixture(t);await f.submit();
 await f.db.prepare('UPDATE mock_sessions SET revoked=1').run();
 assert.equal((await f.submit()).reason,'unauthenticated');
 assert.equal((await f.read()).reason,'unauthenticated');
});
