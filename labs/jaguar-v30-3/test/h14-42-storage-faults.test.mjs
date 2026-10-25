// Fault injection against unchanged 85C JS contract, with in-memory DB double.
import test from 'node:test';
import assert from 'node:assert/strict';
import {writeOccurrence85C,readOccurrence85C} from './storage-contract/storage-contract.mjs';
const identity={ok:true,principal:{subject:'mock-a',sessionId:'mock-session'}};
const policy={subject:'mock-a',skillId:'why.use.contextual-reason',language:'en',originExperienceId:'shopping-for-dinner',contractVersion:'0.1.0',questionWord:'WHY',purpose:'assessment'};
const submission={eventId:'f7027810-0c12-4b65-ae3e-18f538d67e18',currentExperienceId:'shopping-for-dinner',sourceOccurrenceId:'mock:1',event:{bindingVersion:'h14.41.v0.1',dimension:'reason-answer(local)',intent:'start',assessmentTargetId:'MOCK_ONLY'}};
const columns='learner_subject,event_id,skill_id,language,origin_experience_id,current_experience_id,question_word,purpose,status,contract_version,source_occurrence_id,payload_sha256,payload_json'.split(',');
// Scope each fake's closure without sharing state across tests.
function database(){
 let saved=null;
 const db={fault:null,get saved(){return saved;},prepare(){let a;return {bind(...v){a=v;return this;},async run(){
 if(db.fault==='before-insert')throw Error('injected');
 const changes=saved?0:1;if(!saved)saved=Object.fromEntries(columns.map((c,i)=>[c,a[i]]));
 if(db.fault==='after-insert')throw Error('injected');return {meta:{changes}};
 },async first(){if(db.fault==='read')throw Error('injected');return saved;}};}};return db;
}
const write=(db,s=submission)=>writeOccurrence85C({identity,policy,submission:s,db});
for(const fault of ['before-insert','after-insert','read'])test(`85C ${fault}: failure then stable replay`,async()=>{
 const db=database();db.fault=fault;
 assert.equal((await write(db)).reason,'storage_failure');
 if(fault==='before-insert')assert.equal(db.saved,null);
 db.fault=null;const r=await write(db);
 assert.equal(r.receipt,fault==='before-insert'?'created':'duplicate');
 assert.equal(r.status,'pending');assert.equal('evidence' in r,false);
});
test('85C rejects changed dimension/intent on same UUID after uncertain response',async()=>{
 const db=database();db.fault='after-insert';await write(db);db.fault=null;
 for(const event of [{...submission.event,dimension:'question-function'},{...submission.event,intent:'resume'}])
  assert.equal((await write(db,{...submission,event})).reason,'occurrence_conflict');
 assert.equal((await write(db)).receipt,'duplicate');
});
test('85C tampered persisted binding fails integrity verification',async()=>{
 const db=database();await write(db);db.saved.payload_json='{"dimension":"question-function"}';
 const r=await readOccurrence85C({identity,policy,eventId:submission.eventId,db});
 assert.equal(r.reason,'integrity_failure');
});
