import test from 'node:test';
import assert from 'node:assert/strict';
import {processLabOccurrence,readLabOccurrence} from '../src/bridge.mjs';
const now=1000;
const proof={ticket:'ticket-a',subject:'opaque-a',sessionId:'s1',iss:'mock-v30-local',aud:'v30-identity-lab',iat:900,exp:1100};
const other={...proof,ticket:'ticket-b',subject:'opaque-b'};
const registry=new Map([['ticket-a',{...proof,revoked:false}],['ticket-b',{...other,revoked:false}]]);
const base={occurrenceId:'v30demo',skillId:'which.use.determiner',language:'en',experienceId:'shopping-for-dinner',questionWord:'WHICH',purpose:'exploration',contractVersion:'0.1.0',event:{choice:'books'}};
const rule=(r)=>({skillId:r.skillId,language:r.language,experienceId:r.experienceId,questionWord:r.questionWord,purpose:r.purpose,contractVersion:r.contractVersion});
const policies=new Map([['opaque-a',[rule(base),rule({...base,purpose:'assessment'})]],['opaque-b',[rule(base)]]]);
function mockD1(){
 const records=new Map();return {records,prepare(sql){let params=[];return {bind(...v){params=v;return this;},async run(){if(!sql.trimStart().startsWith('INSERT'))throw Error('unexpected SQL');const [sub,scope,id,purpose,status,version,digest,payload]=params;const key=JSON.stringify([sub,scope,id]);if(records.has(key))return {meta:{changes:0}};records.set(key,{learner_subject:sub,scope_key:scope,occurrence_id:id,purpose,status,contract_version:version,payload_sha256:digest,payload_json:payload});return {meta:{changes:1}};},async first(){if(!sql.trimStart().startsWith('SELECT'))throw Error('unexpected SQL');const [sub,scope,id]=params;return records.get(JSON.stringify([sub,scope,id]))??null;}};}};}
const args=(db,request=base,p=proof)=>({db,request,proof:p,registry,policies,now});
test('exploration creates observed_exploratory, never credit',async()=>{const db=mockD1();const x=await processLabOccurrence(args(db));assert.equal(x.status,'observed_exploratory');assert.equal(x.receipt,'created');assert.equal('greenPass' in x,false);});
test('assessment creates pending independently',async()=>{const db=mockD1();const x=await processLabOccurrence(args(db,{...base,purpose:'assessment',occurrenceId:'assessment1'}));assert.equal(x.status,'pending');});
test('same identity and scope can read event',async()=>{const db=mockD1();await processLabOccurrence(args(db));const x=await readLabOccurrence(args(db));assert.equal(x.event.choice,'books');});
test('identical replay is idempotent',async()=>{const db=mockD1();await processLabOccurrence(args(db));assert.equal((await processLabOccurrence(args(db))).receipt,'duplicate');});
test('conflicting replay rejected',async()=>{const db=mockD1();await processLabOccurrence(args(db));assert.equal((await processLabOccurrence(args(db,{...base,event:{choice:'carrots'}}))).reason,'occurrence_conflict');});
test('changing purpose for same occurrence rejected',async()=>{const db=mockD1();await processLabOccurrence(args(db));assert.equal((await processLabOccurrence(args(db,{...base,purpose:'assessment'}))).reason,'occurrence_conflict');});
test('other subject cannot read first subject record',async()=>{const db=mockD1();await processLabOccurrence(args(db));assert.equal((await readLabOccurrence(args(db,base,other))).reason,'not_found');});
test('revoked proof blocked',async()=>{const db=mockD1();const rev=new Map([['ticket-a',{...proof,revoked:true}]]);assert.equal((await processLabOccurrence({...args(db),registry:rev})).reason,'unauthenticated');});
test('wrong scope rejected',async()=>{const db=mockD1();assert.equal((await processLabOccurrence(args(db,{...base,language:'pt'}))).reason,'forbidden');});
test('nested credit injection rejected',async()=>{const db=mockD1();assert.equal((await processLabOccurrence(args(db,{...base,event:{answer:{credit:9}}}))).reason,'invalid_request');});
test('invalid purpose rejected',async()=>{const db=mockD1();assert.equal((await processLabOccurrence(args(db,{...base,purpose:'greenPass'}))).reason,'invalid_purpose');});
test('modified stored status fails closed',async()=>{const db=mockD1();await processLabOccurrence(args(db));const r=[...db.records.values()][0];r.status='confirmed';assert.equal((await readLabOccurrence(args(db))).reason,'integrity_failure');});
test('stored event tampering fails integrity',async()=>{const db=mockD1();await processLabOccurrence(args(db));const r=[...db.records.values()][0];r.payload_json='{"choice":"forged"}';assert.equal((await readLabOccurrence(args(db))).reason,'integrity_failure');});