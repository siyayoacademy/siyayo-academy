// SIYAYO JAGUAR V29: ONLY local development with simulated authority. NEVER deploy.
// V26 D1 schema + V28 simulated signed claims + V27 fail-closed boundaries.
const enc = new TextEncoder();
const json = (data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const b64 = bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unb64 = s=>{if(!/^[A-Za-z0-9_-]+$/.test(s))throw Error('invalid');const a=s.replace(/-/g,'+').replace(/_/g,'/');return Uint8Array.from(atob(a+'='.repeat((4-a.length%4)%4)),c=>c.charCodeAt(0));};
const hex = buf=>Array.from(new Uint8Array(buf)).map(v=>v.toString(16).padStart(2,'0')).join('');
const sha256 = async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const sortCanonical = x=>JSON.stringify(Object.fromEntries(Object.entries(x).sort(([a],[b])=>a.localeCompare(b))));
async function mac(secret,body){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(body)));}
async function claims(token, secret, now){
 if(typeof token!=='string'||token.length>2048||token.split('.').length!==2)throw Error('invalid_token');
 const [body,sig]=token.split('.');let rawSig, data;
 try{rawSig=unb64(sig); data=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(unb64(body)));}catch{throw Error('invalid_token');}
 const expected=await mac(secret,body);if(rawSig.length!==expected.length||!expected.every((v,i)=>v===rawSig[i]))throw Error('invalid_token');
 if(!data||Array.isArray(data)||Object.keys(data).sort().join(',')!=='exp,kind,scope,sub'||data.kind!=='v28-lab'||typeof data.sub!=='string'||!data.sub||data.sub.length>128||typeof data.scope!=='string'||!data.scope||data.scope.length>128||!Number.isSafeInteger(data.exp)||data.exp<=now)throw Error('invalid_token');
 return data;
}
async function read(db,sub,scope,id){return db.prepare('SELECT learner_subject,scope_key,occurrence_id,payload_sha256,payload_json,status FROM assessment_occurrences WHERE learner_subject=? AND scope_key=? AND occurrence_id=?').bind(sub,scope,id).first();}
async function verify(row){if(!row||row.status!=='pending'||typeof row.payload_json!=='string'||!/^[0-9a-f]{64}$/.test(row.payload_sha256))return false;return (await sha256(row.payload_json))===row.payload_sha256;}
export default {async fetch(request,env){
 // Local-only: binds to loopback via wrangler dev --ip 127.0.0.1; never deploy.
 if(env.V29_LOCAL_ONLY!=='true'||!env.ASSESSMENT_DB||!env.V29_SIM_SECRET||env.V29_SIM_SECRET.length<24||!env.V29_ALLOWED_SCOPE)return json({error:'lab_disabled'},503);
 const url=new URL(request.url); if(url.pathname!=='/__lab/v29/occurrence'&& !url.pathname.startsWith('/__lab/v29/occurrence/'))return json({error:'route_disabled'},404);
 if(request.method!=='POST' && request.method!=='GET')return json({error:'method_disabled'},405);
 const auth=request.headers.get('authorization')||'';
 if(!auth.startsWith('Bearer '))return json({error:'unauthorized'},401);
 let identity;try{identity=await claims(auth.slice(7),env.V29_SIM_SECRET,Math.floor(Date.now()/1000));}catch{return json({error:'unauthorized'},401);}
 if(identity.scope!==env.V29_ALLOWED_SCOPE)return json({error:'forbidden'},403);
 if(url.pathname==='/__lab/v29/occurrence'&&request.method==='POST'){
  let raw='';try{raw=await request.text();if(raw.length>4096)throw Error();}catch{return json({error:'invalid_input'},400);}
  let body;try{body=JSON.parse(raw);}catch{return json({error:'invalid_input'},400);}
  if(!body||Array.isArray(body)||typeof body!=='object'||Object.keys(body).sort().join(',')!=='event,occurrenceId'||typeof body.occurrenceId!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(body.occurrenceId)||!body.event||Array.isArray(body.event)||typeof body.event!=='object'||Object.keys(body.event).length===0||Object.keys(body.event).some(k=>['learner_subject','scope_key','learnerId','subject','scope','credit','credits','greenPass','status','confirmed'].includes(k)))return json({error:'invalid_input'},400);
  const payload=sortCanonical(body.event),digest=await sha256(payload);
  try{
   const result=await env.ASSESSMENT_DB.prepare("INSERT INTO assessment_occurrences (learner_subject,scope_key,occurrence_id,payload_sha256,payload_json,status) VALUES (?,?,?,?,?,'pending') ON CONFLICT(learner_subject,scope_key,occurrence_id) DO NOTHING").bind(identity.sub,identity.scope,body.occurrenceId,digest,payload).run();
   const row=await read(env.ASSESSMENT_DB,identity.sub,identity.scope,body.occurrenceId);
   if(!await verify(row))return json({error:'integrity_failure'},503);
   if(row.payload_sha256!==digest||row.payload_json!==payload)return json({error:'occurrence_conflict'},409);
   const created=result.meta?.changes===1;
   return json({receipt:created?'created':'duplicate',status:'pending',occurrenceId:body.occurrenceId},created?202:200);
  }catch{return json({error:'storage_failure'},503);}
 }
 if(request.method==='GET'&&url.pathname.startsWith('/__lab/v29/occurrence/')){
  const id=url.pathname.slice('/__lab/v29/occurrence/'.length);if(!/^[A-Za-z0-9_-]{1,64}$/.test(id))return json({error:'invalid_input'},400);
  try{const row=await read(env.ASSESSMENT_DB,identity.sub,identity.scope,id);if(!row)return json({error:'not_found'},404);if(!await verify(row))return json({error:'integrity_failure'},503);return json({occurrenceId:id,status:'pending',payloadSha256:row.payload_sha256,event:JSON.parse(row.payload_json)});}catch{return json({error:'storage_failure'},503);}
 }
 return json({error:'method_disabled'},405);
}};