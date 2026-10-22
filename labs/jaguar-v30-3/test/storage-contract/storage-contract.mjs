// JAGUAR V30.3.85C — LOCAL MOCK PERSISTENCE CONTRACT, NEVER DEPLOY.
// NOT real authentication, NOT assessment authority, NOT a Green Pass.
import {createHash} from 'node:crypto';
const fail=(reason)=>Object.freeze({ok:false,reason});
const wordSet=new Set(['WHAT','WHERE','WHEN','WHO','WHICH','WHY','HOW','HOW MUCH','HOW MANY','WHOSE','WHOM','HOW LONG','HOW FAR','HOW OFTEN']);
const token=(s,n=128)=>typeof s==='string'&&s.length>0&&s.length<=n&&/^[A-Za-z0-9_.-]+$/.test(s);
const experience=(s)=>typeof s==='string'&&s.length<=128&&/^[A-Za-z0-9_-]+$/.test(s);
const eventIdOK=(s)=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(s);
const sourceIDOK=(s)=>typeof s==='string'&&s.length<=128&&/^[A-Za-z0-9_:-]+$/.test(s);
const sha=(s)=>createHash('sha256').update(s).digest('hex');

function canonicalize(v,depth=0,stack=new Set()){
  if(depth>10)throw Error('depth');
  if(v===null||typeof v==='string'||typeof v==='boolean')return v;
  if(typeof v==='number'&&Number.isFinite(v))return v;
  if(typeof v!=='object'||stack.has(v))throw Error('unsupported');
  const proto=Object.getPrototypeOf(v);
  if(!Array.isArray(v)&&proto!==Object.prototype&&proto!==null)throw Error('prototype');
  stack.add(v);
  let output;
  if(Array.isArray(v))output=v.map(x=>canonicalize(x,depth+1,stack));
  else{
    output={};
    for(const k of Object.keys(v).sort()){
      if(['__proto__','constructor','prototype','learnerId','learner_subject','subject','scope_key','status','credit','credits','greenPass','confirmed','assessmentAuthority'].includes(k))throw Error('forged');
      Object.defineProperty(output,k,{value:canonicalize(v[k],depth+1,stack),enumerable:true,writable:true,configurable:true});
    }
  }
  stack.delete(v);
  return output;
}
function context(identity,policy){
  if(!identity?.ok||!identity.principal||!token(identity.principal.subject)||!token(identity.principal.sessionId))return fail('unauthenticated');
  if(!policy||typeof policy!=='object'||policy.subject!==identity.principal.subject)return fail('forbidden');
  if(!token(policy.skillId)||!['en','es','pt'].includes(policy.language)||
    !experience(policy.originExperienceId)||!token(policy.contractVersion,64)||
    !wordSet.has(policy.questionWord)||!['exploration','assessment'].includes(policy.purpose))return fail('invalid_policy');
  return Object.freeze({ok:true,subject:identity.principal.subject,skillId:policy.skillId,
    language:policy.language,originExperienceId:policy.originExperienceId,
    contractVersion:policy.contractVersion,questionWord:policy.questionWord,purpose:policy.purpose,
    scopeKey:JSON.stringify([identity.principal.subject,policy.skillId,policy.language,policy.originExperienceId,policy.contractVersion])});
}
export function scopeKey85C(identity,policy){
  const ctx=context(identity,policy);
  return ctx.ok?ctx.scopeKey:null;
}
const cols='learner_subject,event_id,skill_id,language,origin_experience_id,current_experience_id,question_word,purpose,status,contract_version,source_occurrence_id,payload_sha256,payload_json';
const readSql='SELECT '+cols+' FROM v30_85c_occurrences WHERE learner_subject=? AND event_id=?';
function safeRow(row,ctx){
  if(!row||row.learner_subject!==ctx.subject||row.skill_id!==ctx.skillId||
    row.language!==ctx.language||row.origin_experience_id!==ctx.originExperienceId||
    row.question_word!==ctx.questionWord||row.contract_version!==ctx.contractVersion||
    row.purpose!==ctx.purpose)return false;
  const expected=row.purpose==='exploration'?'observed_exploratory':'pending';
  return row.status===expected&&typeof row.payload_json==='string'&&
    /^[0-9a-f]{64}$/.test(row.payload_sha256)&&sha(row.payload_json)===row.payload_sha256;
}
function safeSubmission(submission){
  if(!submission||typeof submission!=='object'||Array.isArray(submission)||
    Object.keys(submission).sort().join(',')!=='currentExperienceId,event,eventId,sourceOccurrenceId')return null;
  if(!eventIdOK(submission.eventId)||!sourceIDOK(submission.sourceOccurrenceId)||
    !experience(submission.currentExperienceId)||
    !submission.event||Array.isArray(submission.event)||typeof submission.event!=='object'||
    Object.keys(submission.event).length===0)return null;
  try{
    const json=JSON.stringify(canonicalize(submission.event));
    if(json.length>4096)return null;
    return Object.freeze({eventId:submission.eventId,sourceOccurrenceId:submission.sourceOccurrenceId,
      currentExperienceId:submission.currentExperienceId,payload:json,digest:sha(json)});
  }catch{return null;}
}
export async function writeOccurrence85C({identity,policy,submission,db}={}){
  const ctx=context(identity,policy);
  if(!ctx.ok)return fail(ctx.reason);
  const v=safeSubmission(submission);
  if(!v)return fail('invalid_submission');
  if(!db||typeof db.prepare!=='function')return fail('storage_unavailable');
  try{
    const status=ctx.purpose==='exploration'?'observed_exploratory':'pending';
    const rowData=[ctx.subject,v.eventId,ctx.skillId,ctx.language,ctx.originExperienceId,
      v.currentExperienceId,ctx.questionWord,ctx.purpose,status,ctx.contractVersion,
      v.sourceOccurrenceId,v.digest,v.payload];
    const ins=await db.prepare('INSERT INTO v30_85c_occurrences ('+cols+') VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(learner_subject,event_id) DO NOTHING').bind(...rowData).run();
    const row=await db.prepare(readSql).bind(ctx.subject,v.eventId).first();
    if(!row||row.learner_subject!==ctx.subject)return fail('integrity_failure');
    // An existing event ID with any changed context must not be silently reattributed.
    if([row.skill_id,row.language,row.origin_experience_id,row.current_experience_id,
      row.question_word,row.purpose,row.contract_version,row.source_occurrence_id,
      row.payload_sha256,row.payload_json].some((item,i)=>item!==[
      ctx.skillId,ctx.language,ctx.originExperienceId,v.currentExperienceId,ctx.questionWord,
      ctx.purpose,ctx.contractVersion,v.sourceOccurrenceId,v.digest,v.payload][i]))
      return fail('occurrence_conflict');
    if(!safeRow(row,ctx))return fail('integrity_failure');
    return Object.freeze({ok:true,receipt:ins.meta?.changes===1?'created':'duplicate',
      eventId:v.eventId,sourceOccurrenceId:v.sourceOccurrenceId,scopeKey:ctx.scopeKey,
      purpose:ctx.purpose,status:row.status});
  }catch{return fail('storage_failure');}
}
export async function readOccurrence85C({identity,policy,eventId,db}={}){
  const ctx=context(identity,policy);
  if(!ctx.ok)return fail(ctx.reason);
  if(!eventIdOK(eventId))return fail('invalid_event_id');
  if(!db||typeof db.prepare!=='function')return fail('storage_unavailable');
  try{
    const row=await db.prepare(readSql).bind(ctx.subject,eventId).first();
    if(!row)return fail('not_found');
    if(row.learner_subject!==ctx.subject||row.skill_id!==ctx.skillId||row.language!==ctx.language||
      row.origin_experience_id!==ctx.originExperienceId||row.question_word!==ctx.questionWord||
      row.contract_version!==ctx.contractVersion||row.purpose!==ctx.purpose)return fail('not_found');
    if(!safeRow(row,ctx))return fail('integrity_failure');
    return Object.freeze({ok:true,eventId:row.event_id,sourceOccurrenceId:row.source_occurrence_id,
      scopeKey:ctx.scopeKey,experienceId:row.current_experience_id,purpose:row.purpose,
      status:row.status,event:JSON.parse(row.payload_json)});
  }catch{return fail('storage_failure');}
}
