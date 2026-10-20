// JAGUAR V30.3.86 — TEST-ONLY end-to-end gateway. NEVER DEPLOY.
// This integrates the 85B mock identity, 85C write, 85D restore and 85E
// observations-only shape. It is NOT a production HTTP/API authentication adapter.
import {createServerIdentityContract} from '../identity-contract/server-identity-contract.mjs';
import {writeOccurrence85C} from '../storage-contract/storage-contract.mjs';
import {restoreHistory85D,observationPreview85D,VISIBLE_85D} from '../storage-contract/restore-observer.mjs';
import {validateObservationSnapshot85E} from '../observation-ui/observation-panel.mjs';

const fail=reason=>Object.freeze({ok:false,reason});
const LANGUAGES=new Set(['en','es','pt']);
const policyFields=['contractVersion','language','originExperienceId','policyId','purpose','questionWord','skillId','subject'].sort().join(',');
const userReadFields='nick,sessionHandle';
const userWriteFields='nick,policyId,sessionHandle,submission';
const keyset=obj=>Object.keys(obj).sort().join(',');
const token=x=>typeof x==='string'&&x.length>0&&x.length<=128&&/^[A-Za-z0-9_.-]+$/.test(x);
const validPolicy=(p,subject)=>{
 if(!p||typeof p!=='object'||Array.isArray(p)||keyset(p)!==policyFields||
   p.subject!==subject||!token(p.policyId)||!token(p.contractVersion)||!token(p.originExperienceId)||
   !LANGUAGES.has(p.language)||!['assessment','exploration'].includes(p.purpose))return false;
 return VISIBLE_85D.some(q=>q.questionWord===p.questionWord&&q.skillId===p.skillId);
};
export function createLocalObservationGateway86({verifySession,now,issuer,audience,policiesForSubject,db}={}){
 if(typeof verifySession!=='function'||typeof now!=='function'||
   typeof policiesForSubject!=='function'||!db||typeof db.prepare!=='function')
   throw new TypeError('server_dependencies_required');
 const auth=createServerIdentityContract({verifySession,now,issuer,audience});
 async function authorize(sessionHandle,nick){
  const identity=await auth.resolve({sessionHandle,nick});
  if(!identity.ok)return fail(identity.reason);
  let rules;try{rules=await policiesForSubject(identity.principal.subject);}catch{return fail('forbidden');}
  if(!Array.isArray(rules)||rules.length<1||rules.length>48)return fail('forbidden');
  const ids=new Set();
  for(const p of rules){
   if(!validPolicy(p,identity.principal.subject)||ids.has(p.policyId))return fail('forbidden');
   ids.add(p.policyId);
  }
  // Rules are server supplied. No browser NICK/purpose/subject is authoritative.
  return {ok:true,identity,rules};
 }
 async function read(request){
  if(!request||typeof request!=='object'||Array.isArray(request)||
     keyset(request)!==userReadFields)return fail('invalid_request');
  const authz=await authorize(request.sessionHandle,request.nick);
  if(!authz.ok)return fail(authz.reason);
  const histories=[];
  for(const policy of authz.rules){
   const result=await restoreHistory85D({identity:authz.identity,policy,db});
   if(!result.ok)return fail('history_unavailable');
   histories.push(result);
  }
  const preview=observationPreview85D(histories);
  if(!validateObservationSnapshot85E(preview))return fail('history_unavailable');
  return preview; // Strictly 12 sanitized cells, no opaque subject or raw answers.
 }
 async function record(request){
  if(!request||typeof request!=='object'||Array.isArray(request)||
     keyset(request)!==userWriteFields)return fail('invalid_request');
  const authz=await authorize(request.sessionHandle,request.nick);
  if(!authz.ok)return fail(authz.reason);
  const policy=authz.rules.find(p=>p.policyId===request.policyId);
  if(!policy)return fail('forbidden');
  const result=await writeOccurrence85C({identity:authz.identity,policy,submission:request.submission,db});
  if(!result.ok)return fail(result.reason);
  // Do NOT return scopeKey: it contains a server-owned opaque subject.
  return Object.freeze({ok:true,eventId:result.eventId,receipt:result.receipt,status:result.status});
 }
 return Object.freeze({record,read});
}
