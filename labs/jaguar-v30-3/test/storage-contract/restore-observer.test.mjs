import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {restoreHistory85D,observationPreview85D,VISIBLE_85D,HISTORY_SQL_85D} from './restore-observer.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex');
const id='f7027810-0c12-4b65-ae3e-18f538d67e18';
const principal=subject=>({ok:true,principal:{subject,sessionId:'session-A'}});
const policy=(o={})=>({subject:'opaque-a',skillId:'which.use.determiner',language:'en',
 originExperienceId:'shopping-for-dinner',contractVersion:'0.1.0',questionWord:'WHICH',purpose:'assessment',...o});
const row=(o={})=>({learner_subject:'opaque-a',event_id:id,skill_id:'which.use.determiner',
 language:'en',origin_experience_id:'shopping-for-dinner',current_experience_id:'shopping-for-dinner',
 question_word:'WHICH',purpose:'assessment',status:'pending',contract_version:'0.1.0',
 source_occurrence_id:'choice-select:1',payload_json:'{"choice":"books"}',payload_sha256:sha('{"choice":"books"}'),...o});
const db=(rows=[])=>{const counts={read:0,write:0};return {counts,prepare(sql){assert.equal(sql,HISTORY_SQL_85D);
 let args;return {bind(...a){args=a;return this;},async all(){counts.read++;return {results:rows.filter(x=>
  x.learner_subject===args[0]&&x.skill_id===args[1]&&x.language===args[2]&&x.origin_experience_id===args[3]&&
  x.contract_version===args[4]&&x.question_word===args[5]&&x.purpose===args[6])};}};}}};
const read=(d,p=policy(),who=principal('opaque-a'))=>restoreHistory85D({identity:who,policy:p,db:d});
test('read-only empty history does not invent progress',async()=>{const r=await read(db());assert.equal(r.ok,true);assert.equal(r.events.length,0);});
test('reads stored pending record without granting credit',async()=>{const r=await read(db([row()]));assert.equal(r.events.length,1);assert.equal(r.events[0].status,'pending');assert.equal('credit' in r,false);});
test('different nickname is irrelevant to verified subject',async()=>{const r=await read(db([row()]),policy(),{...principal('opaque-a'),display:{nick:'NEW'}});assert.equal(r.events.length,1);});
test('different principal cannot read another subject',async()=>{const p=policy({subject:'opaque-b'});const r=await read(db([row()]),p,principal('opaque-b'));assert.equal(r.events.length,0);});
test('forged policy subject is rejected',async()=>{const d=db([row()]);assert.equal((await read(d,policy({subject:'opaque-b'}))).ok,false);assert.equal(d.counts.read,0);});
test('missing auth is rejected',async()=>{assert.equal((await read(db([row()]),policy(),null)).reason,'unauthenticated');});
test('wrong skill language origin version QW or purpose cannot read record',async()=>{const d=db([row()]);for(const k of [{skillId:'what.use.object-question'},{language:'es'},{originExperienceId:'preparing-dinner'},{contractVersion:'0.2.0'},{questionWord:'WHAT'},{purpose:'exploration'}])assert.equal((await read(d,policy(k))).events.length,0);});
test('transfer retains origin and identifies new current Experience',async()=>{const r=await read(db([row({current_experience_id:'preparing-dinner'})]));assert.equal(r.events[0].originExperienceId,'shopping-for-dinner');assert.equal(r.events[0].currentExperienceId,'preparing-dinner');});
test('stored confirmed status fails closed',async()=>{assert.equal((await read(db([row({status:'confirmed'})]))).reason,'integrity_failure');});
test('SHA-256 tampering fails closed',async()=>{assert.equal((await read(db([row({payload_json:'{"choice":"forged"}'})]))).reason,'integrity_failure');});
test('privilege injection in stored JSON fails closed',async()=>{const v='{"nested":{"greenPass":true}}';assert.equal((await read(db([row({payload_json:v,payload_sha256:sha(v)})]))).reason,'integrity_failure');});
test('same UUID duplicated in D1 scan fails closed',async()=>{assert.equal((await read(db([row(),row()]))).reason,'integrity_failure');});
test('more than 100 rows fail closed',async()=>{assert.equal((await read(db(Array(101).fill(row())))).reason,'history_limit_exceeded');});
test('DB read failure gives no partial progress',async()=>{const broken={prepare(){throw Error('offline')}};assert.equal((await read(broken)).reason,'storage_failure');});
test('restoration cannot write or expose opaque subject',async()=>{const d=db([row()]);const r=await read(d);assert.equal(d.counts.write,0);assert.equal(JSON.stringify(r).includes('opaque-a'),false);assert.equal(JSON.stringify(r).includes('"choice"'),false);});
test('matrix shows four Question Words times three languages, blank by default',()=>{const p=observationPreview85D([]);assert.equal(p.cells.length,12);assert.equal(VISIBLE_85D.length,4);assert.equal(new Set(p.cells.map(x=>x.questionWord+'/'+x.language)).size,12);assert.ok(p.cells.every(x=>x.observationMarker==='○'&&x.acceptedProgress===null));});
test('pending observation never becomes 1/3, 2/3 or 3/3',async()=>{const h=await read(db([row()]));const cell=observationPreview85D([h]).cells.find(x=>x.questionWord==='WHICH'&&x.language==='en');assert.equal(cell.pendingOccurrences,1);assert.equal(cell.observationMarker,'◐');assert.equal(cell.acceptedProgress,null);assert.equal(cell.confirmed,false);assert.equal(cell.greenPass,false);});
test('separate exploratory observations',async()=>{const exp=row({purpose:'exploration',status:'observed_exploratory'}),p=policy({purpose:'exploration'});const h=await read(db([exp]),p);const cell=observationPreview85D([h]).cells.find(x=>x.questionWord==='WHICH'&&x.language==='en');assert.equal(cell.exploratoryObservations,1);assert.equal(cell.pendingOccurrences,0);});
test('all twelve matrix cells may be observed without credit',()=>{
 const word=VISIBLE_85D,langs=['en','es','pt'],hist=[];
 for(const w of word)for(const language of langs)hist.push({ok:true,kind:'OBSERVATIONS_ONLY',...w,language,originExperienceId:'shopping-for-dinner',events:[{questionWord:w.questionWord,language,originExperienceId:'shopping-for-dinner',status:'pending',purpose:'assessment'}]});
 const p=observationPreview85D(hist);assert.ok(p.cells.every(c=>c.pendingOccurrences===1&&c.observationMarker==='◐'&&c.acceptedProgress===null&&!c.confirmed));
});
test('QWs beyond four do not create visual cells',()=>{const p=observationPreview85D([{ok:true,kind:'OBSERVATIONS_ONLY',questionWord:'HOW',skillId:'how.use',language:'en',events:[]}]);assert.equal(p.cells.length,12);assert.equal(p.cells.some(x=>x.questionWord==='HOW'),false);});
test('forged canonical acceptance in preview is rejected',()=>{const p=observationPreview85D([{ok:true,kind:'OBSERVATIONS_ONLY',questionWord:'WHICH',skillId:'which.use.determiner',language:'en',originExperienceId:'s1',events:[{questionWord:'WHICH',language:'en',originExperienceId:'s1',purpose:'assessment',status:'confirmed'}]}]);assert.equal(p.ok,false);});
test('result snapshots and UI preview are immutable',async()=>{const h=await read(db([row()])),p=observationPreview85D([h]);assert.equal(Object.isFrozen(h),true);assert.equal(Object.isFrozen(h.events[0]),true);assert.equal(Object.isFrozen(p.cells),true);assert.equal(Object.isFrozen(p.cells[0]),true);});
