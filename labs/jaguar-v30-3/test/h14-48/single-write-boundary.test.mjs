import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createPersistedReplayLab} from '../h14-45/persisted-replay-lab.mjs';
import {readOccurrence85C} from '../storage-contract/storage-contract.mjs';
const request={sessionHandle:'MOCK_SESSION',eventId:'f7027810-0c12-4b65-ae3e-18f538d67e18',targetId:'MOCK_TARGET',actionReference:'MOCK_ACTION',intent:'start'};
const id2='72db13d6-27db-4bc0-a99f-3b71a643ec14';
const policy={subject:'mock-a',skillId:'why.use.contextual-reason',language:'en',originExperienceId:'shopping-for-dinner',contractVersion:'0.1.0',questionWord:'WHY',purpose:'assessment'};
function fixture(t,metadata=true){
 const dir=mkdtempSync(join(tmpdir(),'h1448-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const path=join(dir,'85c.sqlite'),driver=fileURLToPath(new URL('./boundary_driver.py',import.meta.url));
 const rpc=x=>JSON.parse(execFileSync('python3',['-B',driver],{input:JSON.stringify({path,...x}),encoding:'utf8',stdio:['pipe','pipe','pipe']}));
 rpc({op:'init',metadata});
 const db={prepare(sql){let args;return {bind(...v){args=v;return this;},async first(){return rpc({op:'first',sql,args});},async run(){return rpc({op:'run',sql,args});}};}};
 const identity={ok:true,principal:{subject:'mock-a',sessionId:'mock-session',expiresAt:200}};
 const target={id:'MOCK_TARGET',status:'AUTHORIZED',revoked:false,expiresAt:200,...policy,dimension:'reason-answer(local)',contractId:'MOCK_CONTRACT',currentExperienceId:'shopping-for-dinner',allowedIntents:['start','resume','transfer']};
 const action={reference:'MOCK_ACTION',subject:'mock-a',targetId:'MOCK_TARGET',source:'DIRECT_LEARNER_ACTION',verified:true,exposureReference:'MOCK_EXPOSURE',modelExposure:'not_exposed',sourceOccurrenceId:'MOCK_ACTION',language:'en',originExperienceId:'shopping-for-dinner',currentExperienceId:'shopping-for-dinner',dimension:'reason-answer(local)'};
 const f={rpc,db,identity,target,action,exists:false};
 f.js=()=>createPersistedReplayLab({enabled:true,db,now:()=>100,resolveIdentity:async()=>identity,resolveTarget:async()=>target,resolveAction:async()=>action,resolveScope:async key=>({...key,exists:f.exists})});
 f.model=(patch={})=>rpc({op:'model',request:{...request,expectedRevision:1,...patch}});
 f.audit=()=>rpc({op:'audit'});
 f.rows=()=>rpc({op:'all',sql:'SELECT * FROM v30_85c_occurrences ORDER BY learner_subject,event_id'});
 return f;
}
test('installation default is off and leaves schema unchanged',t=>{
 const f=fixture(t);const before=f.rpc({op:'all',sql:'SELECT name FROM sqlite_master ORDER BY name'});assert.equal(f.rpc({op:'install'}).reason,'boundary_not_enabled');assert.deepEqual(f.rpc({op:'all',sql:'SELECT name FROM sqlite_master ORDER BY name'}),before);
});
test('clean empty database accepts boundary then transactional writer',t=>{
 const f=fixture(t);assert.equal(f.rpc({op:'install',enabled:true}).ok,true);assert.equal(f.model().receipt,'created');assert.equal(f.audit().problems.length,0);
});
test('legacy H14.45 cannot insert through guarded occurrence table',async t=>{
 const f=fixture(t);f.rpc({op:'install',enabled:true});assert.equal((await f.js().submit(request)).reason,'storage_failure');assert.equal(f.rows().length,0);
});
test('H14.47 action bypass is now rejected at DB boundary',async t=>{
 const f=fixture(t);f.rpc({op:'install',enabled:true});f.model();f.exists=true;const before=f.rows();assert.equal((await f.js().submit({...request,eventId:id2,intent:'resume'})).reason,'storage_failure');assert.deepEqual(f.rows(),before);assert.equal(f.audit().problems.length,0);
});
test('historical JS retry works after guarded transaction without insert',async t=>{
 const f=fixture(t);f.rpc({op:'install',enabled:true});f.model();f.exists=true;assert.equal((await f.js().submit(request)).receipt,'duplicate');assert.equal(f.rows().length,1);
});
test('H14.45 unreserved rows block installation with no implicit backfill',async t=>{
 const f=fixture(t);await f.js().submit(request);const before=f.rows();const r=f.rpc({op:'install',enabled:true});assert.equal(r.reason,'legacy_or_inconsistent_database');assert.ok(r.problems.includes('UNRESERVED_OR_CONFLICTING_ACTION'));assert.deepEqual(f.rows(),before);assert.equal(f.rpc({op:'all',sql:"SELECT name FROM sqlite_master WHERE name LIKE 'h1448_%' OR name='mock_h1448_gate'"}).length,0);
});
test('unbound legacy record blocks installation without conversion',async t=>{
 const f=fixture(t);await f.js().submit(request);const payload='{"choice":"synthetic"}';f.rpc({op:'run',sql:'UPDATE v30_85c_occurrences SET payload_json=?,payload_sha256=?',args:[payload,createHash('sha256').update(payload).digest('hex')]});const before=f.rows();assert.ok(f.rpc({op:'install',enabled:true}).problems.includes('LEGACY_DISPOSITION_REQUIRED'));assert.deepEqual(f.rows(),before);
});
test('consistent existing H14.46 rows survive installation and replay',t=>{
 const f=fixture(t);f.model();const before=f.rows();assert.equal(f.rpc({op:'install',enabled:true}).ok,true);assert.equal(f.model().receipt,'duplicate');assert.deepEqual(f.rows(),before);
});
test('disable stops new writes and rolls back action claims while allowing reads',async t=>{
 const f=fixture(t);f.rpc({op:'install',enabled:true});f.model();const before=f.rows();f.rpc({op:'disable'});
 f.rpc({op:'run',sql:'INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',args:['mock-a','MOCK_ACTION_2','MOCK_TARGET','not_exposed','MOCK_EXPOSURE']});
 assert.equal(f.model({eventId:id2,actionReference:'MOCK_ACTION_2',intent:'resume'}).reason,'transaction_failure');assert.deepEqual(f.rows(),before);
 assert.equal(f.rpc({op:'first',sql:'SELECT count(*) AS n FROM mock_action_consumption'}).n,1);assert.equal((await f.js().submit(request)).receipt,'duplicate');
 const r=await readOccurrence85C({identity:f.identity,policy,eventId:request.eventId,db:f.db});assert.equal(r.ok,true);
});
test('existing occurrence cannot be updated or deleted through old SQL path',t=>{
 const f=fixture(t);f.rpc({op:'install',enabled:true});f.model();const before=f.rows();
 for(const sql of ['DELETE FROM v30_85c_occurrences',"UPDATE v30_85c_occurrences SET source_occurrence_id='forged'"]){
 assert.throws(()=>f.rpc({op:'run',sql}),/h1448_occurrence_immutable/);
 }
 assert.deepEqual(f.rows(),before);
});
test('direct 85C insert bypass cannot omit transactional reservations',t=>{
 const f=fixture(t);f.model();const row=f.rows()[0];f.rpc({op:'install',enabled:true});const columns=Object.keys(row).filter(k=>k!=='recorded_at');row.event_id=id2;
 assert.throws(()=>f.rpc({op:'run',sql:`INSERT INTO v30_85c_occurrences (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`,args:columns.map(k=>row[k])}),/h1448_action_reservation_required/);assert.equal(f.rows().length,1);
});
test('EN ES PT transactional writes remain readable with guard installed',async t=>{
 const f=fixture(t);f.rpc({op:'install',enabled:true});const ids=[request.eventId,id2,'a9515c2a-9f83-4945-b185-3c55720f9c9d'];
 for(const [i,language] of ['en','es','pt'].entries()){
 const binding={skillId:policy.skillId,questionWord:'WHY',language,dimension:'reason-answer(local)',contractId:'MOCK_CONTRACT',contractVersion:'0.1.0',originExperienceId:policy.originExperienceId,currentExperienceId:policy.originExperienceId};
 const action='MOCK_ACTION_'+language;f.rpc({op:'run',sql:'UPDATE mock_targets SET binding_json=?',args:[JSON.stringify(binding)]});f.rpc({op:'run',sql:'INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',args:['mock-a',action,'MOCK_TARGET','not_exposed','MOCK_EXPOSURE']});
 assert.equal(f.model({eventId:ids[i],actionReference:action}).receipt,'created');const r=await readOccurrence85C({identity:f.identity,policy:{...policy,language},eventId:ids[i],db:f.db});assert.equal(r.ok,true);
 }
 assert.equal(f.audit().problems.length,0);
});
