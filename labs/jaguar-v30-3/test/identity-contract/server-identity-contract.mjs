// SIYAYO JAGUAR V30.3.85B — TEST-ONLY contract, NOT a production authentication adapter.
// This module never authenticates a browser NICK; it models how a SERVER-verified session
// must be separated from the Explorer's display nickname before any future D1 write.
// Never deploy, expose as an HTTP route, or use its mock verifier with real learners.

const error = (reason) => Object.freeze({ok:false,reason});
const text = (value,max) =>
  typeof value==='string' && value.trim().length>0 && value.trim().length<=max &&
  !/[\u0000-\u001F\u007F]/u.test(value) ? value.trim() : null;

export function createServerIdentityContract({verifySession,now,issuer,audience}={}) {
  if(typeof verifySession!=='function'||typeof now!=='function'||
     !text(issuer,128)||!text(audience,128))throw new TypeError('server_verifier_required');

  async function resolve(input) {
    if(!input||typeof input!=='object'||Array.isArray(input)||
       Object.keys(input).some(key=>!['sessionHandle','nick'].includes(key)))return error('invalid_input');
    const sessionHandle=text(input.sessionHandle,256);
    const nick=text(input.nick,80);
    if(!sessionHandle)return error('unauthenticated');
    if(!nick)return error('invalid_nick');

    let moment,proof;
    try {
      moment=now(); // Server clock only; never from request, Explorer or Nick.
      if(!Number.isSafeInteger(moment))return error('server_clock_unavailable');
      proof=await verifySession(sessionHandle); // Inject only real server-side verifier in future.
    }catch{return error('unauthenticated');}

    if(!proof||typeof proof!=='object'||Array.isArray(proof)||
       proof.ok!==true||proof.revoked!==false||
       !text(proof.subject,128)||!text(proof.sessionId,128)||
       proof.issuer!==issuer||proof.audience!==audience||
       !Number.isSafeInteger(proof.issuedAt)||
       !Number.isSafeInteger(proof.expiresAt)||
       proof.issuedAt>moment||proof.expiresAt<=moment||
       proof.issuedAt>=proof.expiresAt)return error('unauthenticated');

    // Ownership depends solely on the trusted verifier's opaque subject.
    // The nickname may change or be shared by different learners.
    const principal=Object.freeze({subject:proof.subject,sessionId:proof.sessionId,
      issuer:proof.issuer,audience:proof.audience,expiresAt:proof.expiresAt});
    return Object.freeze({ok:true,principal,display:Object.freeze({nick})});
  }
  return Object.freeze({resolve});
}
