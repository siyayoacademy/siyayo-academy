// SIYAYO JAGUAR V30.3.87C — browser-side observation fetch coordinator.
// TEST-ONLY, NEVER DEPLOY. Does not integrate with the actual Explorer yet.
// Cloudflare Access must authenticate at the edge/origin; the browser must NOT
// handle JWTs, insert an Access assertion, or submit NICK as authorization.
// This adds ONLY an observations-only view, not canonical Trail / Word Path credit.
import {createObservationPanel85E,validateObservationSnapshot85E} from '../observation-ui/observation-panel.mjs';

const path='/__lab/v30/observations';
const LANG=new Set(['en','es','pt']);
const QWS=new Set(['WHICH','WHAT','WHERE','WHY']);
const only=(obj,keys)=>obj&&typeof obj==='object'&&!Array.isArray(obj)&&
 Object.keys(obj).sort().join(',')===keys;
const safeName=(v,n=128)=>typeof v==='string'&&v.length>0&&v.length<=n&&
 /^[A-Za-z0-9_.:-]+$/.test(v);
const allowedContext=ctx=>only(ctx,'experienceId,language,questionWord,viewerKey')&&
 safeName(ctx.viewerKey)&&safeName(ctx.experienceId)&&LANG.has(ctx.language)&&QWS.has(ctx.questionWord);

export function createExplorerObservationClient87C({
 document,element,fetchSameOrigin,AbortControllerImpl=AbortController
}={}){
 if(typeof fetchSameOrigin!=='function'||typeof AbortControllerImpl!=='function')
  throw new TypeError('same_origin_transport_required');
 let selected=null,job=null,version=0,outcome='inactive';
 const live=j=>j&&job===j&&selected===j.context&&j.version===version&&
   !j.controller.signal.aborted;
 function cancel(){
  ++version;
  if(job){job.controller.abort();job=null;}
 }
 async function loadSnapshot(viewKey){
  const j=job;
  if(!live(j)||viewKey!==j.context.viewerKey)return null;
  try {
   // Browser uses a same-origin GET; Access/proxy adds assertion server side.
   // No Authorization/Cf-Access-Jwt-Assertion header, token, URL query or NICK.
   const response=await fetchSameOrigin(path,Object.freeze({
    method:'GET',credentials:'same-origin',cache:'no-store',mode:'same-origin',
    redirect:'error',referrerPolicy:'no-referrer',
    headers:Object.freeze({Accept:'application/json'}),
    signal:j.controller.signal
   }));
   if(!live(j))return null;
   if(!response||typeof response.status!=='number'){
    outcome='unavailable';return null;
   }
   if(response.status===401){
    outcome='authentication_required';
    cancel();selected=null;panel.clear();
    return null;
   }
   if(response.status===403){outcome='forbidden';return null;}
   if(response.status===404){outcome='not_found';return null;}
   if(response.status!==200){outcome='unavailable';return null;}
   if(!response.headers?.get?.('content-type')?.toLowerCase().includes('application/json')||
      typeof response.text!=='function'){
    outcome='unavailable';return null;
   }
   const body=await response.text();
   if(!live(j))return null;
   if(typeof body!=='string'||body.length>8192){
    outcome='unavailable';return null;
   }
   let snapshot;
   try{snapshot=JSON.parse(body);}catch{outcome='unavailable';return null;}
   if(!validateObservationSnapshot85E(snapshot)){
    outcome='unavailable';return null;
   }
   return snapshot;
  }catch{
   if(live(j))outcome='unavailable';
   return null;
  }
 }
 const panel=createObservationPanel85E({document,element,loadSnapshot});
 const api={
  selectContext(context){
   // UI selection is not proof of a logged-in session.
   cancel();selected=null;panel.clear();
   if(!allowedContext(context)){outcome='invalid_context';return false;}
   selected=Object.freeze({...context});outcome='ready';return true;
  },
  async refresh(){
   if(!selected){outcome='inactive';return false;}
   cancel();
   const j={version,context:selected,controller:new AbortControllerImpl()};
   job=j;outcome='loading';
   const result=await panel.refresh({viewKey:j.context.viewerKey,displayLanguage:j.context.language});
   if(!live(j))return false;
   if(result){outcome='shown';return true;}
   if(outcome==='loading')outcome='unavailable';
   return false;
  },
  logout(){
   cancel();selected=null;panel.clear();outcome='signed_out';return true;
  },
  state(){
   return Object.freeze({active:!!selected,
    questionWord:selected?.questionWord??null,
    language:selected?.language??null,experienceId:selected?.experienceId??null,
    visualState:panel.getState(),outcome});
  }
 };
 return Object.freeze(api);
}
