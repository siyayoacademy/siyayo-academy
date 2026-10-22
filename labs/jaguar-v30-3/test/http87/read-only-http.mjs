// SIYAYO JAGUAR V30.3.87B — ISOLATED HTTP READ CONTRACT. NEVER DEPLOY.
// THIS IS NOT a Cloudflare Access or production Worker integration.
// Requires a verified JWT principal and SERVER-SUPPLIED policy. Never trusts NICK,
// query parameters, browser-scoped learner IDs or a stored 'pending' as accepted.
import {restoreHistory85D,observationPreview85D,VISIBLE_85D} from '../storage-contract/restore-observer.mjs';
import {validateObservationSnapshot85E} from '../observation-ui/observation-panel.mjs';

const route='/__lab/v30/observations';
const allowedLang=new Set(['en','es','pt']);
const policyFields='contractVersion,language,originExperienceId,policyId,purpose,questionWord,skillId,subject';
const token=v=>typeof v==='string'&&v.length>=1&&v.length<=128&&/^[A-Za-z0-9_.-]+$/.test(v);
const exactKeys=(v,s)=>v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).sort().join(',')===s;
const denial=(error,status)=>response({error},status);
function response(body,status=200){
 return new Response(JSON.stringify(body),{status,headers:{
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'Pragma':'no-cache',
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'no-referrer',
  'Vary':'Cf-Access-Jwt-Assertion'
 }});
}
function validRule(p,subject){
 if(!exactKeys(p,policyFields)||p.subject!==subject||
   !token(p.policyId)||!token(p.skillId)||!token(p.originExperienceId)||
   !token(p.contractVersion)||!allowedLang.has(p.language)||
   !['exploration','assessment'].includes(p.purpose))return false;
 return VISIBLE_85D.some(q=>q.questionWord===p.questionWord&&q.skillId===p.skillId);
}
export function createHttpObservationHandler87B({verifier,policiesForSubject,db}={}){
 if(!verifier||typeof verifier.verify!=='function'||
    typeof policiesForSubject!=='function'||!db||typeof db.prepare!=='function')
  throw new TypeError('trusted_dependencies_required');

 async function fetch(request){
  if(!request||typeof request.url!=='string'||typeof request.method!=='string')
   return denial('not_found',404);
  let url;
  try{url=new URL(request.url);}catch{return denial('not_found',404);}
  if(url.pathname!==route)return denial('not_found',404);
  if(request.method!=='GET')return denial('method_not_allowed',405);
  // Prohibit all request-derived authorization selectors, including a nickname.
  if(url.search||url.hash)return denial('invalid_request',400);
  let principal;
  try{
   const authentication=await verifier.verify(request);
   if(!authentication?.ok||!authentication.principal)return denial('unauthenticated',401);
   principal=authentication.principal;
  }catch{return denial('unauthenticated',401);}
  if(!token(principal.subject)||!token(principal.sessionId))
   return denial('unauthenticated',401);
  let policies;
  try{policies=await policiesForSubject(principal.subject);}
  catch{return denial('forbidden',403);}
  if(!Array.isArray(policies)||policies.length===0||policies.length>48)
   return denial('forbidden',403);
  const identifiers=new Set(),scopes=new Set();
  for(const p of policies){
   if(!validRule(p,principal.subject)||identifiers.has(p.policyId))
    return denial('forbidden',403);
   const scope=JSON.stringify([p.subject,p.skillId,p.language,p.originExperienceId,
    p.contractVersion,p.questionWord,p.purpose]);
   if(scopes.has(scope))return denial('forbidden',403);
   scopes.add(scope);identifiers.add(p.policyId);
  }
  const identity=Object.freeze({ok:true,principal});
  const histories=[];
  for(const policy of policies){
   const history=await restoreHistory85D({identity,policy,db});
   if(!history.ok)return denial('history_unavailable',503);
   histories.push(history);
  }
  const preview=observationPreview85D(histories);
  if(!validateObservationSnapshot85E(preview))return denial('history_unavailable',503);
  const total=preview.cells.reduce((n,c)=>n+c.exploratoryObservations+c.pendingOccurrences,0);
  if(total===0)return denial('not_found',404);
  // Sanitized twelve-cell snapshot only; no subject, answers or assessment progress.
  return response(preview);
 }
 return Object.freeze({fetch});
}
