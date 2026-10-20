import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createServerIdentityContract} from './identity-contract/server-identity-contract.mjs';
import {scopeKey85C,writeOccurrence85C,readOccurrence85C} from './storage-contract/storage-contract.mjs';

const issuer='mock-issuer',audience='siyayo-85c';
const registry=new Map([
  ['a',{ok:true,subject:'opaque-a',sessionId:'session-a',issuer,audience,issuedAt:900,expiresAt:1100,revoked:false}],
  ['b',{ok:true,subject:'opaque-b',sessionId:'session-b',issuer,audience,issuedAt:900,expiresAt:1100,revoked:false}]
]);
const resolver=createServerIdentityContract({issuer,audience,now:()=>1000,verifySession:async key=>registry.get(key)});
const identity=(ticket='a',nick='JAGUAR')=>resolver.resolve({sessionHandle:ticket,nick});
const policy=(subject='opaque-a',opts={})=>({subject,skillId:'which.use.determiner',language:'en',
  originExperienceId:'shopping-for-dinner',contractVersion:'0.1.0',questionWord:'WHICH',
  purpose:'assessment',...opts});
const id1='f7027810-0c12-4b65-ae3e-18f538d67e18';
const id2='72db13d6-27db-4bc0-a99f-3b71a643ec14';
const id3='a9515c2a-9f83-4945-b185-3c55720f9c9d';
const submission=(eventId=id1,opts={})=>({eventId,sourceOccurrenceId:'choice-select:1',
  currentExperienceId:'shopping-for-dinner',event:{choice:'books'},...opts});
function db(){
  const records=new Map();
  return {records,prepare(sql){
    let args=[];
    return {bind(...params){args=params;return this;},
      async run(){
        assert.ok(sql.startsWith('INSERT INTO v30_85c_occurrences'));
        const key=JSON.stringify(args.slice(0,2));
        if(records.has(key))return {meta:{changes:0}};
        records.set(key,Object.fromEntries(['learner_subject','event_id','skill_id','language',
          'origin_experience_id','current_experience_id','question_word','purpose','status',
          'contract_version','source_occurrence_id','payload_sha256','payload_json']
          .map((name,i)=>[name,args[i]])));
        return {meta:{changes:1}};
      },
      async first(){
        assert.ok(sql.startsWith('SELECT '));
        return records.get(JSON.stringify(args.slice(0,2)))??null;
      }
    };
  }};
}
const write=async({ticket='a',nick='JAGUAR',p=policy(),s=submission(),db:database=db()}={})=>
  writeOccurrence85C({identity:await identity(ticket,nick),policy:p,submission:s,db:database});

test('server principal forms canonical scope without trusting the NICK',async()=>{
 const a=await identity();const b=await identity('a','OTHER NICK');
 assert.equal(scopeKey85C(a,policy()),scopeKey85C(b,policy()));
 assert.equal(scopeKey85C(a,policy()),JSON.stringify(['opaque-a','which.use.determiner','en','shopping-for-dinner','0.1.0']));
});
test('create assessment pending without credit or Green Pass',async()=>{
 const d=db(),r=await write({db:d});
 assert.equal(r.receipt,'created');assert.equal(r.status,'pending');
 assert.equal('credit' in r,false);assert.equal('greenPass' in r,false);
 assert.equal(d.records.size,1);
});
test('exploration remains observed_exploratory independent from assessment',async()=>{
 const d=db(),r=await write({db:d,p:policy('opaque-a',{purpose:'exploration'})});
 assert.equal(r.status,'observed_exploratory');
});
test('stable UUID replay across attempts is idempotent',async()=>{
 const d=db();assert.equal((await write({db:d})).receipt,'created');
 assert.equal((await write({db:d})).receipt,'duplicate');assert.equal(d.records.size,1);
});
test('same UUID with different payload fails closed',async()=>{
 const d=db();await write({db:d});
 assert.equal((await write({db:d,s:submission(id1,{event:{choice:'salmon'}})})).reason,'occurrence_conflict');
});
test('same UUID with different current experience is a conflict',async()=>{
 const d=db();await write({db:d});
 assert.equal((await write({db:d,s:submission(id1,{currentExperienceId:'preparing-dinner'})})).reason,'occurrence_conflict');
});
test('same UUID cannot be silently reused under different skill or language',async()=>{
 const d=db();await write({db:d});
 for(const options of [{skillId:'what.use.object-question'},{language:'es'},{originExperienceId:'preparing-dinner'},{contractVersion:'0.2.0'}]){
   assert.equal((await write({db:d,p:policy('opaque-a',options)})).reason,'occurrence_conflict');
 }
});
test('transfer from S1 to S2 and S3 stays under one canonical origin',async()=>{
 const d=db();
 const a=await write({db:d,s:submission(id1)});
 const b=await write({db:d,s:submission(id2,{currentExperienceId:'preparing-dinner',sourceOccurrenceId:'determiner-use-transfer-probe-select:1',event:{choice:'carrots'}})});
 const c=await write({db:d,s:submission(id3,{currentExperienceId:'having-dinner',sourceOccurrenceId:'transfer-probe:2',event:{choice:'salmon'}})});
 assert.equal(new Set([a.scopeKey,b.scopeKey,c.scopeKey]).size,1);
 assert.equal(d.records.size,3);
});
test('reading S2 transfer retains current experience and origin scope',async()=>{
 const d=db();const s=submission(id2,{currentExperienceId:'preparing-dinner'});
 await write({db:d,s});
 const r=await readOccurrence85C({identity:await identity(),policy:policy(),eventId:id2,db:d});
 assert.equal(r.experienceId,'preparing-dinner');assert.equal(r.scopeKey,scopeKey85C(await identity(),policy()));
 assert.deepEqual(r.event,{choice:'books'});assert.equal(r.status,'pending');
});
test('same nick for two server subjects cannot cross-read records',async()=>{
 const d=db();await write({db:d});
 const r=await readOccurrence85C({identity:await identity('b','JAGUAR'),
  policy:policy('opaque-b'),eventId:id1,db:d});
 assert.equal(r.reason,'not_found');
});
test('different subjects may independently submit same UUID',async()=>{
 const d=db();await write({db:d});
 const b=await write({ticket:'b',db:d,p:policy('opaque-b')});
 assert.equal(b.ok,true);assert.equal(d.records.size,2);
});
test('client cannot supply identity, purpose or credit as top-level fields',async()=>{
 const d=db();for(const addition of [{subject:'opaque-b'},{purpose:'assessment'},{credit:9},{greenPass:true}]){
  assert.equal((await write({db:d,s:{...submission(),...addition}})).reason,'invalid_submission');
 }assert.equal(d.records.size,0);
});
test('nested privilege injection in event rejected',async()=>{
 const d=db();for(const event of [{nested:{greenPass:true}},{answer:[{credits:3}]},{status:'confirmed'},{__proto__:null}]){
  const r=await write({db:d,s:submission(id1,{event})});
  // A null-prototype event is permitted as data; forbidden nested authority is not.
  if('nested' in event||'answer' in event||'status' in event)assert.equal(r.reason,'invalid_submission');
 }});
test('wrong policy subject fails without touching database',async()=>{
 const d=db();const r=await write({db:d,p:policy('opaque-b')});
 assert.equal(r.reason,'forbidden');assert.equal(d.records.size,0);
});
test('invalid purpose is forbidden and cannot mint confirmed evidence',async()=>{
 const d=db();const r=await write({db:d,p:policy('opaque-a',{purpose:'greenPass'})});
 assert.equal(r.reason,'invalid_policy');assert.equal(d.records.size,0);
});
test('identifiers must be durable random UUIDv4, not Explorer counter',async()=>{
 const d=db(),r=await write({db:d,s:submission('choice-select:1')});
 assert.equal(r.reason,'invalid_submission');
 assert.equal(/^[0-9a-f-]{36}$/.test(randomUUID()),true);
});
test('read denied across language, skill, assessment origin and contract version',async()=>{
 const d=db();await write({db:d});const auth=await identity();
 for(const opts of [{language:'es'},{skillId:'what.use.object-question'},{originExperienceId:'preparing-dinner'},{contractVersion:'0.2.0'},{purpose:'exploration'}]){
  const r=await readOccurrence85C({identity:auth,policy:policy('opaque-a',opts),eventId:id1,db:d});
  assert.equal(r.reason,'not_found');
 }
});
test('payload tampering detected using SHA-256',async()=>{
 const d=db();await write({db:d});
 const row=[...d.records.values()][0];row.payload_json='{"choice":"forged"}';
 assert.equal((await readOccurrence85C({identity:await identity(),policy:policy(),eventId:id1,db:d})).reason,'integrity_failure');
});
test('stored status changed to confirmed is rejected',async()=>{
 const d=db();await write({db:d});const row=[...d.records.values()][0];row.status='confirmed';
 assert.equal((await readOccurrence85C({identity:await identity(),policy:policy(),eventId:id1,db:d})).reason,'integrity_failure');
});
test('same event JSON with different object key ordering is idempotent',async()=>{
 const d=db();const s=submission(id1,{event:{choice:'books',detail:{b:2,a:1}}});
 await write({db:d,s});
 const r=await write({db:d,s:submission(id1,{event:{detail:{a:1,b:2},choice:'books'}})});
 assert.equal(r.receipt,'duplicate');
});
test('database unavailable or failing closed',async()=>{
 const a=await writeOccurrence85C({identity:await identity(),policy:policy(),submission:submission()});
 assert.equal(a.reason,'storage_unavailable');
 const broken={prepare(){throw Error('db failure')}};
 const b=await writeOccurrence85C({identity:await identity(),policy:policy(),submission:submission(),db:broken});
 assert.equal(b.reason,'storage_failure');
});
test('expired or revoked sessions cannot write',async()=>{
 const d=db();for(const patch of [{expiresAt:1000},{revoked:true}]){
  const bad=createServerIdentityContract({issuer,audience,now:()=>1000,verifySession:async()=>({...registry.get('a'),...patch})});
  const r=await writeOccurrence85C({identity:await bad.resolve({sessionHandle:'a',nick:'JAGUAR'}),policy:policy(),submission:submission(),db:d});
  assert.equal(r.reason,'unauthenticated');
 }assert.equal(d.records.size,0);
});
test('changing display NICK leaves persisted learner-owned event readable',async()=>{
 const d=db();await write({db:d,nick:'ALUNO'});
 const r=await readOccurrence85C({identity:await identity('a','NOVO NICK'),policy:policy(),eventId:id1,db:d});
 assert.equal(r.ok,true);
});
test('event source occurrence reference may repeat across distinct durable IDs',async()=>{
 const d=db();await write({db:d,s:submission(id1)});
 const r=await write({db:d,s:submission(id2,{event:{choice:'cheese'}})});
 assert.equal(r.ok,true);assert.equal(d.records.size,2);
});
