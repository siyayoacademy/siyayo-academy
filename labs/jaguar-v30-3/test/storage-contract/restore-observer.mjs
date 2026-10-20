// JAGUAR V30.3.85D: LOCAL read-only restore observer. NEVER DEPLOY.
// A stored 'pending' occurrence is NOT approved evidence, progress or Green Pass.
import {createHash} from 'node:crypto';
import {scopeKey85C} from './storage-contract.mjs';
const fail=reason=>Object.freeze({ok:false,reason});
const uuid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(x);
const sha=x=>createHash('sha256').update(x).digest('hex');
const forbidden=new Set(['__proto__','constructor','prototype','learnerId','learner_subject','subject','scope_key','credit','credits','status','confirmed','greenPass','assessmentAuthority']);
function safe(v,depth=0){
 if(depth>10)return false;
 if(v===null||typeof v!=='object')return true;
 if(Array.isArray(v))return v.every(x=>safe(x,depth+1));
 return Object.entries(v).every(([k,x])=>!forbidden.has(k)&&safe(x,depth+1));
}
export const HISTORY_SQL_85D='SELECT learner_subject,event_id,skill_id,language,origin_experience_id,current_experience_id,question_word,purpose,status,contract_version,source_occurrence_id,payload_sha256,payload_json FROM v30_85c_occurrences WHERE learner_subject=? AND skill_id=? AND language=? AND origin_experience_id=? AND contract_version=? AND question_word=? AND purpose=? ORDER BY recorded_at ASC,event_id ASC LIMIT 101';
export async function restoreHistory85D({identity,policy,db}={}){
 const scope=scopeKey85C(identity,policy);
 if(!scope)return fail(identity?.ok?'forbidden':'unauthenticated');
 if(!db||typeof db.prepare!=='function')return fail('storage_unavailable');
 try{
  const out=await db.prepare(HISTORY_SQL_85D).bind(identity.principal.subject,policy.skillId,
   policy.language,policy.originExperienceId,policy.contractVersion,policy.questionWord,policy.purpose).all();
  if(!out||!Array.isArray(out.results))return fail('storage_failure');
  if(out.results.length>100)return fail('history_limit_exceeded');
  const events=[],seen=new Set();
  for(const row of out.results){
   if(!row||row.learner_subject!==identity.principal.subject||row.skill_id!==policy.skillId||
     row.language!==policy.language||row.origin_experience_id!==policy.originExperienceId||
     row.contract_version!==policy.contractVersion||row.question_word!==policy.questionWord||
     row.purpose!==policy.purpose||row.status!==(policy.purpose==='assessment'?'pending':'observed_exploratory')||
     !uuid(row.event_id)||seen.has(row.event_id)||
     typeof row.current_experience_id!=='string'||!row.current_experience_id||
     typeof row.source_occurrence_id!=='string'||!row.source_occurrence_id||
     typeof row.payload_json!=='string'||row.payload_json.length>4096||
     !/^[0-9a-f]{64}$/.test(row.payload_sha256)||sha(row.payload_json)!==row.payload_sha256)
    return fail('integrity_failure');
   let body;try{body=JSON.parse(row.payload_json);}catch{return fail('integrity_failure');}
   if(!body||typeof body!=='object'||Array.isArray(body)||!Object.keys(body).length||!safe(body))
    return fail('integrity_failure');
   seen.add(row.event_id);
   events.push(Object.freeze({eventId:row.event_id,questionWord:row.question_word,
     language:row.language,originExperienceId:row.origin_experience_id,
     currentExperienceId:row.current_experience_id,sourceOccurrenceId:row.source_occurrence_id,
     purpose:row.purpose,status:row.status}));
  }
  // No nickname, subject, raw answer, accepted witness, credit or canonical trail.
  return Object.freeze({ok:true,kind:'OBSERVATIONS_ONLY',skillId:policy.skillId,
    questionWord:policy.questionWord,language:policy.language,originExperienceId:policy.originExperienceId,
    events:Object.freeze(events)});
 }catch{return fail('storage_failure');}
}
export const VISIBLE_85D=Object.freeze([
 Object.freeze({questionWord:'WHICH',skillId:'which.use.determiner'}),
 Object.freeze({questionWord:'WHAT',skillId:'what.use.object-question'}),
 Object.freeze({questionWord:'WHERE',skillId:'where.use.location-question'}),
 Object.freeze({questionWord:'WHY',skillId:'why.use.contextual-reason'})
]);
export function observationPreview85D(histories){
 if(!Array.isArray(histories))return fail('invalid_histories');
 const observed=new Map();
 for(const history of histories){
  if(!history||history.ok!==true||history.kind!=='OBSERVATIONS_ONLY'||!Array.isArray(history.events))
   return fail('invalid_histories');
  if(!VISIBLE_85D.some(x=>x.questionWord===history.questionWord&&x.skillId===history.skillId))
   continue;
  if(!['en','es','pt'].includes(history.language))return fail('invalid_histories');
  const key=history.questionWord+'/'+history.language;
  const count=observed.get(key)||{exploration:0,pending:0};
  for(const ev of history.events){
   if(ev.questionWord!==history.questionWord||ev.language!==history.language||
     ev.originExperienceId!==history.originExperienceId||
     !((ev.purpose==='exploration'&&ev.status==='observed_exploratory')||
       (ev.purpose==='assessment'&&ev.status==='pending')))return fail('invalid_histories');
   if(ev.purpose==='assessment')count.pending++;else count.exploration++;
  }
  observed.set(key,count);
 }
 const cells=VISIBLE_85D.flatMap(q=>['en','es','pt'].map(language=>{
  const n=observed.get(q.questionWord+'/'+language)||{exploration:0,pending:0};
  return Object.freeze({questionWord:q.questionWord,skillId:q.skillId,language,
   exploratoryObservations:n.exploration,pendingOccurrences:n.pending,
   observationMarker:n.exploration+n.pending?'◐':'○',
   acceptedProgress:null,confirmed:false,greenPass:false});
 }));
 return Object.freeze({ok:true,kind:'OBSERVATION_PREVIEW_ONLY',cells:Object.freeze(cells)});
}
