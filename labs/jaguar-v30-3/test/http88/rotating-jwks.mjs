// SIYAYO V30.3.88B — offline JWKS rotation contract. TEST-ONLY; NO remote fetch.
// Trusted keyset snapshots must come from a server-owned verified issuer origin.
// No request-controlled jku/jwk, no browser tokens, no production Access assertion.
const failure=(reason)=>Object.freeze({ok:false,reason});
const key=(k)=>k&&typeof k==='object'&&!Array.isArray(k)&&
 typeof k.kid==='string'&&/^[A-Za-z0-9_.-]{1,128}$/.test(k.kid)&&
 k.kty==='RSA'&&k.alg==='RS256'&&k.use==='sig'&&
 typeof k.n==='string'&&k.n.length>=340&&k.n.length<=2048&&/^[A-Za-z0-9_-]+$/.test(k.n)&&
 typeof k.e==='string'&&/^[A-Za-z0-9_-]{1,16}$/.test(k.e)&&
 !['d','p','q','dp','dq','qi','oth'].some(x=>Object.hasOwn(k,x));
export function createRotatingKeyset88({fetchTrustedKeys,now,expectedIssuer,
 minTtl=30,maxTtl=300}={}){
 if(typeof fetchTrustedKeys!=='function'||typeof now!=='function'||
 typeof expectedIssuer!=='string'||!/^https:\/\/[a-z0-9.-]+\.cloudflareaccess\.com$/.test(expectedIssuer)||
 !Number.isSafeInteger(minTtl)||!Number.isSafeInteger(maxTtl)||minTtl<1||maxTtl>600||minTtl>maxTtl)
 throw new TypeError('trusted_rotation_dependencies_required');
 let cache=null,inFlight=null;
 const validTime=x=>Number.isSafeInteger(x)&&x>=0;
 async function refresh(){
  if(inFlight)return inFlight;
  inFlight=(async()=>{
   try{
    const t=now();
    if(!validTime(t))return failure('clock_unavailable');
    const r=await fetchTrustedKeys(); // trusted server-side dependency only, never arbitrary URL from a token
    if(!r||r.issuer!==expectedIssuer||!Number.isSafeInteger(r.ttl)||
       r.ttl<minTtl||r.ttl>maxTtl||!Array.isArray(r.keys)||r.keys.length<1||r.keys.length>4)
      return failure('untrusted_keyset');
    const kids=new Set();
    for(const k of r.keys){
     if(!key(k)||kids.has(k.kid))return failure('untrusted_keyset');
     kids.add(k.kid);
    }
    const snapshot=Object.freeze({ok:true,expiresAt:t+r.ttl,
     keys:Object.freeze(r.keys.map(k=>Object.freeze({kid:k.kid,kty:'RSA',alg:'RS256',use:'sig',n:k.n,e:k.e})))});
    cache=snapshot;
    return snapshot;
   }catch{return failure('jwks_unavailable');}
   finally{inFlight=null;}
  })();
  return inFlight;
 }
 return Object.freeze({
  async current(){
   let t;
   try{t=now();}catch{return failure('clock_unavailable');}
   if(!validTime(t))return failure('clock_unavailable');
   if(cache&&t<cache.expiresAt)return cache;
   // On expired JWKS retrieval failure, DO NOT reuse stale trust material.
   return refresh();
  },
  invalidate(){cache=null;return true;},
  status(){return Object.freeze({hasSnapshot:!!cache,expiresAt:cache?.expiresAt??null});}
 });
}
