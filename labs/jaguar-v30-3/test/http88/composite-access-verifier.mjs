// SIYAYO 88D composite crypto + individual session contract.
// OFFLINE TEST MODEL. DO NOT DEPLOY. Signed 'sid' is a fixture-specific claim,
// NOT guaranteed to exist in real Cloudflare Access tokens.
import {createRotatingKeyset88} from './rotating-jwks.mjs';
import {createSessionGate88} from './session-gate.mjs';
import {createAccessVerifier87} from '../http87/access-verifier.mjs';
const deny=()=>Object.freeze({ok:false,reason:'unauthenticated'});
const safeId=s=>typeof s==='string'&&/^[A-Za-z0-9_.-]{1,128}$/.test(s);
function readVerifiedPayload(request){
 const token=request.headers.get('cf-access-jwt-assertion');
 const s=token.split('.')[1];
 if(!s||s.length>4096||!/^[a-zA-Z0-9_-]+$/.test(s))return null;
 const raw=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));
 const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(raw,x=>x.charCodeAt(0))));
 return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
}
export function createCompositeAccessVerifier88D({
 issuer,audience,now,fetchTrustedKeys,resolveVerifiedSession,isRevoked,maxTtl=300
}={}){
 if(typeof now!=='function'||typeof resolveVerifiedSession!=='function'||typeof isRevoked!=='function')
  throw new TypeError('trusted_session_dependencies_required');
 const keys=createRotatingKeyset88({expectedIssuer:issuer,now,fetchTrustedKeys,maxTtl});
 return Object.freeze({
  async verify(request){
   const assertion=request?.headers?.get?.('cf-access-jwt-assertion');
   if(typeof assertion!=='string'||assertion.length<8||assertion.length>8192)return deny();
   try{
    const available=await keys.current();
    if(!available.ok)return deny();
    // 87A is the SIGNATURE validator. Its stub is not session authorization:
    // session validity is independently checked below before any success.
    const crypto=createAccessVerifier87({issuer,audience,now,publicKeys:available.keys,
     isSessionActive:async()=>true});
    const checked=await crypto.verify(request);
    if(!checked.ok)return deny();
    // Only after signature verification may a session hint be inspected.
    const claims=readVerifiedPayload(request);
    if(!claims||!safeId(claims.sid)||claims.sub!==checked.principal.subject||
       claims.exp!==checked.principal.expiresAt||!Number.isSafeInteger(claims.iat))return deny();
    const sessionGate=createSessionGate88({now,
     resolveVerifiedSession:async ticket=>{
      const record=await resolveVerifiedSession(ticket);
      if(!record||record.ok!==true||record.sessionId!==claims.sid||
         record.subject!==claims.sub||record.issuedAt!==claims.iat||
         record.expiresAt!==claims.exp)return null;
      return record;
     },isRevoked});
    const active=await sessionGate.check(claims.sid);
    if(!active.ok||active.principal.subject!==checked.principal.subject||
       active.principal.sessionId!==claims.sid||
       active.principal.expiresAt!==checked.principal.expiresAt)return deny();
    return Object.freeze({ok:true,principal:Object.freeze({
     subject:active.principal.subject,sessionId:active.principal.sessionId,
     issuer,audience,expiresAt:active.principal.expiresAt
    })});
   }catch{return deny();}
  },
  invalidateKeys(){return keys.invalidate();},
  keyStatus(){return keys.status();}
 });
}
