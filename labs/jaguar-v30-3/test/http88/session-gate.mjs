// SIYAYO V30.3.88C — test-only session revocation contract. NEVER DEPLOY.
// Session ID must be independently verified by a trusted issuer/backend.
// No browser NICK may identify or revoke another user's session.
const fail=reason=>Object.freeze({ok:false,reason});
const token=v=>typeof v==='string'&&v.length>0&&v.length<=128&&/^[A-Za-z0-9_.-]+$/.test(v);
export function createSessionGate88({now,resolveVerifiedSession,isRevoked}={}){
 if(typeof now!=='function'||typeof resolveVerifiedSession!=='function'||typeof isRevoked!=='function')
  throw new TypeError('trusted_session_dependencies_required');
 async function check(ticket){
  if(!token(ticket))return fail('unauthenticated');
  let t,s,blocked;
  try{
   t=now();
   if(!Number.isSafeInteger(t)||t<0)return fail('clock_unavailable');
   s=await resolveVerifiedSession(ticket);
   if(!s||s.ok!==true||!token(s.subject)||!token(s.sessionId)||
     !Number.isSafeInteger(s.issuedAt)||!Number.isSafeInteger(s.expiresAt)||
     s.issuedAt>t||s.expiresAt<=t||s.issuedAt>=s.expiresAt)return fail('unauthenticated');
   blocked=await isRevoked(Object.freeze({subject:s.subject,sessionId:s.sessionId,expiresAt:s.expiresAt}));
  }catch{return fail('unauthenticated');}
  if(blocked!==false)return fail('unauthenticated');
  return Object.freeze({ok:true,principal:Object.freeze({subject:s.subject,
   sessionId:s.sessionId,expiresAt:s.expiresAt})});
 }
 return Object.freeze({check});
}
