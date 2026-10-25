import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createPersistedReplayLab} from './persisted-replay-lab.mjs';
// Thin bridge executes ORIGINAL 85C JS queries in real file-backed SQLite.
// It is a test driver, not D1 and not a replacement occurrence store.
const python=`import json,sqlite3,sys
x=json.load(sys.stdin)
c=sqlite3.connect(x['path']); c.row_factory=sqlite3.Row
if x.get('schema'):
 c.executescript(x['schema']); c.commit(); print('{}')
else:
 q=c.execute(x['sql'],x['args'])
 if x['mode']=='first':
  row=q.fetchone(); print(json.dumps(dict(row) if row else None))
 else:
  changes=q.rowcount;c.commit();print(json.dumps({'meta':{'changes':changes}}))
c.close()
`;
const request={sessionHandle:'MOCK_SESSION',eventId:'f7027810-0c12-4b65-ae3e-18f538d67e18',targetId:'MOCK_TARGET',actionReference:'MOCK_ACTION',intent:'start'};
function fixture(t){
 const dir=mkdtempSync(join(tmpdir(),'h1445-'));t.after(()=>rmSync(dir,{recursive:true,force:true}));
 const path=join(dir,'85c.sqlite');
 const query=x=>JSON.parse(execFileSync('python3',['-c',python],{input:JSON.stringify({path,...x}),encoding:'utf8'}));
 query({schema:readFileSync(new URL('../../migrations/0004_v30_85c_occurrences.sql',import.meta.url),'utf8')});
 const db={fault:false,prepare(sql){let args;return {bind(...v){args=v;return this;},async first(){if(db.fault==='read')throw Error('injected');return query({sql,args,mode:'first'});},async run(){const r=query({sql,args,mode:'run'});if(db.fault==='lost-response'){db.fault=false;throw Error('injected');}return r;}};}};
 const target={id:'MOCK_TARGET',status:'AUTHORIZED',revoked:false,expiresAt:200,subject:'mock-a',skillId:'why.use.contextual-reason',questionWord:'WHY',language:'en',dimension:'reason-answer(local)',contractId:'MOCK_CONTRACT',contractVersion:'0.1.0',originExperienceId:'shopping-for-dinner',currentExperienceId:'shopping-for-dinner',allowedIntents:['start','resume','transfer']};
 const action={reference:'MOCK_ACTION',subject:'mock-a',targetId:'MOCK_TARGET',source:'DIRECT_LEARNER_ACTION',verified:true,exposureReference:'MOCK_EXPOSURE',modelExposure:'not_exposed',sourceOccurrenceId:'mock:1',language:'en',originExperienceId:target.originExperienceId,currentExperienceId:target.currentExperienceId,dimension:target.dimension};
 const f={db,query,target,action,exists:false,identity:{ok:true,principal:{subject:'mock-a',sessionId:'mock-session',expiresAt:200}},targetCalls:0};
 f.services={now:()=>100,resolveIdentity:async()=>f.identity,resolveTarget:async()=>{f.targetCalls++;return f.target;},resolveAction:async()=>f.action,resolveScope:async key=>({...key,exists:f.exists})};
 f.adapter=(enabled=true)=>createPersistedReplayLab({enabled,db,...f.services});
 f.count=()=>query({sql:'SELECT count(*) AS n FROM v30_85c_occurrences',args:[],mode:'first'}).n;
 return f;
}
test('new authorized mock submission writes pending through unchanged 85C',async t=>{const f=fixture(t);const r=await f.adapter().submit(request);assert.equal(r.receipt,'created');assert.equal(r.evidenceAllowed,false);assert.equal(f.count(),1);assert.equal(f.targetCalls,2);});
test('restart and start retry after scope exists gives duplicate without target resolver',async t=>{const f=fixture(t);await f.adapter().submit(request);f.exists=true;f.services.resolveTarget=async()=>{throw Error('must not reprepare');};const r=await f.adapter().submit(request);assert.equal(r.receipt,'duplicate');assert.equal(f.count(),1);});
test('lost response after durable insert replays safely',async t=>{const f=fixture(t);f.db.fault='lost-response';assert.equal((await f.adapter().submit(request)).reason,'storage_failure');f.exists=true;assert.equal((await f.adapter().submit(request)).receipt,'duplicate');assert.equal(f.count(),1);});
test('same UUID altered target/action/intent rejected without overwrite',async t=>{const f=fixture(t);await f.adapter().submit(request);for(const patch of [{targetId:'OTHER'},{actionReference:'OTHER'},{intent:'resume'}])assert.equal((await f.adapter().submit({...request,...patch})).reason,'occurrence_conflict');assert.equal(f.count(),1);});
test('receipt after target revoked is historical only, new UUID denied',async t=>{const f=fixture(t);await f.adapter().submit(request);f.target.revoked=true;const r=await f.adapter().submit(request);assert.equal(r.receipt,'duplicate');assert.equal(r.evaluationAllowed,false);assert.equal((await f.adapter().submit({...request,eventId:'72db13d6-27db-4bc0-a99f-3b71a643ec14'})).reason,'target_not_authorized');});
test('revocation between prepares prevents write',async t=>{const f=fixture(t);f.services.resolveTarget=async()=>({...f.target,revoked:++f.targetCalls>1});assert.equal((await f.adapter().submit(request)).reason,'target_not_authorized');assert.equal(f.count(),0);});
test('binding changes between prepares prevents write',async t=>{const f=fixture(t);f.services.resolveTarget=async()=>({...f.target,contractVersion:++f.targetCalls===1?'0.1.0':'0.2.0'});assert.equal((await f.adapter().submit(request)).reason,'binding_changed_before_write');assert.equal(f.count(),0);});
test('session expires at final identity check prevents write',async t=>{const f=fixture(t);let calls=0;f.services.resolveIdentity=async()=>++calls>=4?{ok:false}:f.identity;assert.equal((await f.adapter().submit(request)).reason,'unauthenticated');assert.equal(f.count(),0);});
test('expired identity cannot access even duplicate receipt',async t=>{const f=fixture(t);await f.adapter().submit(request);f.identity.principal.expiresAt=99;assert.equal((await f.adapter().submit(request)).reason,'unauthenticated');});
test('different authenticated subjects can use same UUID independently',async t=>{const f=fixture(t);await f.adapter().submit(request);f.identity.principal.subject=f.target.subject=f.action.subject='mock-b';assert.equal((await f.adapter().submit(request)).receipt,'created');assert.equal(f.count(),2);});
test('tampered persisted JSON fails digest check',async t=>{const f=fixture(t);await f.adapter().submit(request);f.query({sql:'UPDATE v30_85c_occurrences SET payload_json=?',args:['{"bindingVersion":"forged"}'],mode:'run'});assert.equal((await f.adapter().submit(request)).reason,'integrity_failure');assert.equal(f.count(),1);});
test('legacy unbound payload is not upgraded',async t=>{const f=fixture(t);await f.adapter().submit(request);const {createHash}=await import('node:crypto');const payload='{"choice":"synthetic"}';f.query({sql:'UPDATE v30_85c_occurrences SET payload_json=?,payload_sha256=?',args:[payload,createHash('sha256').update(payload).digest('hex')],mode:'run'});assert.equal((await f.adapter().submit(request)).reason,'legacy_unbound');assert.equal(f.count(),1);});
test('disabled adapter and malformed request never write',async t=>{const f=fixture(t);assert.equal((await f.adapter(false).submit(request)).reason,'adapter_disabled');assert.equal((await f.adapter().submit({...request,subject:'forged'})).reason,'invalid_request');assert.equal(f.count(),0);});
test('lookup failure cannot become not-found or trigger write',async t=>{const f=fixture(t);f.db.fault='read';assert.equal((await f.adapter().submit(request)).reason,'server_or_storage_failure');assert.equal(f.count(),0);assert.equal(f.targetCalls,0);});
test('real draft target remains blocked before storage',async t=>{const f=fixture(t);f.target.status='DRAFT_NOT_AUTHORIZED';assert.equal((await f.adapter().submit(request)).reason,'target_not_authorized');assert.equal(f.count(),0);});
test('EN ES PT each persists exact binding without cross-language replay mutation',async t=>{const f=fixture(t);const ids=[request.eventId,'72db13d6-27db-4bc0-a99f-3b71a643ec14','a9515c2a-9f83-4945-b185-3c55720f9c9d'];for(const [i,language] of ['en','es','pt'].entries()){f.target.language=f.action.language=language;assert.equal((await f.adapter().submit({...request,eventId:ids[i]})).receipt,'created');}assert.equal(f.count(),3);f.exists=true;assert.equal((await f.adapter().submit(request)).receipt,'duplicate');const r=f.query({sql:'SELECT language FROM v30_85c_occurrences WHERE event_id=?',args:[request.eventId],mode:'first'});assert.equal(r.language,'en');});
test('transfer preserves explicit origin and does not require local proof',async t=>{const f=fixture(t);f.exists=true;f.target.dimension=f.action.dimension='reason-answer(transfer)';f.target.currentExperienceId=f.action.currentExperienceId='preparing-dinner';const r=await f.adapter().submit({...request,intent:'transfer'});assert.equal(r.receipt,'created');const row=f.query({sql:'SELECT origin_experience_id,current_experience_id FROM v30_85c_occurrences',args:[],mode:'first'});assert.equal(row.origin_experience_id,'shopping-for-dinner');assert.equal(row.current_experience_id,'preparing-dinner');});
test('principal change during final revalidation prevents write',async t=>{const f=fixture(t);let calls=0;f.services.resolveIdentity=async()=>++calls>=4?{ok:true,principal:{subject:'mock-b',sessionId:'mock-session',expiresAt:200}}:f.identity;assert.equal((await f.adapter().submit(request)).reason,'unauthenticated');assert.equal(f.count(),0);});
