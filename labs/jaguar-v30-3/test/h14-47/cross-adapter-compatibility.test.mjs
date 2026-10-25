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
 const dir=mkdtempSync(join(tmpdir(),'h1447-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const path=join(dir,'85c.sqlite'),driver=fileURLToPath(new URL('./sqlite_lab_driver.py',import.meta.url));
 const rpc=x=>JSON.parse(execFileSync('python3',['-B',driver],{input:JSON.stringify({path,...x}),encoding:'utf8'}));
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
test('H14.46 occurrence is readable by original 85C JS reader',async t=>{
 const f=fixture(t);assert.equal(f.model().receipt,'created');const r=await readOccurrence85C({identity:f.identity,policy,eventId:request.eventId,db:f.db});assert.equal(r.ok,true);assert.equal(r.event.authorizationRevision,1);assert.equal(r.status,'pending');assert.equal(f.audit().problems.length,0);
});
test('H14.46 write then H14.45 retry preserves all bytes and claims',async t=>{
 const f=fixture(t);f.model();f.exists=true;const before=f.rows();assert.equal((await f.js().submit(request)).receipt,'duplicate');assert.deepEqual(f.rows(),before);assert.equal(f.audit().problems.length,0);
});
test('H14.45 write then H14.46 receipt does not fabricate reservations',async t=>{
 const f=fixture(t);await f.js().submit(request);const before=f.rows();assert.equal(f.model().receipt,'duplicate');assert.deepEqual(f.rows(),before);const a=f.audit();assert.ok(a.problems.includes('UNRESERVED_SCOPE'));assert.ok(a.problems.includes('UNRESERVED_OR_CONFLICTING_ACTION'));assert.equal(a.cutoverReady,false);
});
test('mixed writers demonstrate bypass of H14.46 action consumption',async t=>{
 const f=fixture(t);f.model();f.exists=true;assert.equal((await f.js().submit({...request,eventId:id2,intent:'resume'})).receipt,'created');const a=f.audit();assert.ok(a.problems.includes('ACTION_REUSED_ACROSS_UUIDS'));assert.ok(a.problems.includes('UNRESERVED_OR_CONFLICTING_ACTION'));assert.equal(f.rows().length,2);
});
test('audit preserves old unbound 85C record and never upgrades it',async t=>{
 const f=fixture(t);await f.js().submit(request);const payload='{"choice":"synthetic"}';f.rpc({op:'run',sql:'UPDATE v30_85c_occurrences SET payload_json=?,payload_sha256=?',args:[payload,createHash('sha256').update(payload).digest('hex')]});const before=f.rows();assert.ok(f.audit().problems.includes('LEGACY_DISPOSITION_REQUIRED'));assert.deepEqual(f.rows(),before);assert.equal(f.model().reason,'legacy_unbound');
});
test('missing companion metadata blocks review without creating tables',async t=>{
 const f=fixture(t,false);const before=f.rpc({op:'all',sql:"SELECT name FROM sqlite_master ORDER BY name"});assert.equal(f.audit().status,'BLOCKED_COMPANION_METADATA_ABSENT');assert.deepEqual(f.rpc({op:'all',sql:"SELECT name FROM sqlite_master ORDER BY name"}),before);
});
test('tampered payload fails cross-adapter integrity checks',async t=>{
 const f=fixture(t);f.model();f.rpc({op:'run',sql:'UPDATE v30_85c_occurrences SET payload_json=?',args:['{"bindingVersion":"forged"}']});assert.ok(f.audit().problems.includes('INTEGRITY_FAILURE'));assert.equal((await f.js().submit(request)).reason,'integrity_failure');
});
test('orphan claim is flagged without repair',async t=>{
 const f=fixture(t);f.model();f.rpc({op:'run',sql:'DELETE FROM v30_85c_occurrences'});assert.ok(f.audit().problems.includes('ORPHAN_ACTION_CLAIM'));assert.equal(f.rows().length,0);
});
test('scope mismatch in stored envelope rejected by audit',async t=>{
 const f=fixture(t);f.model();const e=JSON.parse(f.rows()[0].payload_json);e.language='pt';const payload=JSON.stringify(e);f.rpc({op:'run',sql:'UPDATE v30_85c_occurrences SET payload_json=?,payload_sha256=?',args:[payload,createHash('sha256').update(payload).digest('hex')]});assert.ok(f.audit().problems.includes('INVALID_BINDING'));assert.equal((await f.js().submit(request)).reason,'invalid_persisted_binding');
});
test('EN ES PT model records all read through original JS storage contract',async t=>{
 const f=fixture(t);const ids=[request.eventId,id2,'a9515c2a-9f83-4945-b185-3c55720f9c9d'];
 for(const [i,language] of ['en','es','pt'].entries()){
 const b={skillId:policy.skillId,questionWord:'WHY',language,dimension:'reason-answer(local)',contractId:'MOCK_CONTRACT',contractVersion:'0.1.0',originExperienceId:policy.originExperienceId,currentExperienceId:policy.originExperienceId};
 const action='MOCK_ACTION_'+language;f.rpc({op:'run',sql:'UPDATE mock_targets SET binding_json=?',args:[JSON.stringify(b)]});f.rpc({op:'run',sql:'INSERT INTO mock_actions VALUES (?,?,?,1,?,?)',args:['mock-a',action,'MOCK_TARGET','not_exposed','MOCK_EXPOSURE']});
 assert.equal(f.model({eventId:ids[i],actionReference:action}).receipt,'created');
 const read=await readOccurrence85C({identity:f.identity,policy:{...policy,language},eventId:ids[i],db:f.db});assert.equal(read.ok,true);assert.equal(read.event.language,language);
 }
 assert.equal(f.audit().problems.length,0);assert.equal(f.audit().evaluationAllowed,false);assert.equal(f.audit().cutoverReady,false);
});
