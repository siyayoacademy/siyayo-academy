// SIYAYO JAGUAR V30.3.87A — Access RS256 crypto verifier CONTRACT.
// TEST-ONLY. NO remote JWKS fetch or Cloudflare origin/deploy authorization.
// A future Worker MUST be protected by real Cloudflare Access and use bounded,
// rotating public keys loaded from a trusted server configuration, never requests.
const fail=(reason='unauthenticated')=>Object.freeze({ok:false,reason});
const b64url=s=>{
 if(typeof s!=='string'||!s.length||!/^[A-Za-z0-9_-]+$/.test(s))throw Error('b64url');
 const a=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4));
 return Uint8Array.from(a,c=>c.charCodeAt(0));
};
const parse=s=>JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b64url(s)));
const stableText=(v,max)=>typeof v==='string'&&v.length>0&&v.length<=max&&!/[\u0000-\u001f\u007f]/.test(v);
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const HEX=bytes=>Array.from(bytes,x=>x.toString(16).padStart(2,'0')).join('');

export function createAccessVerifier87({issuer,audience,publicKeys,now,isSessionActive}={}){
 if(!stableText(issuer,256)||!/^https:\/\/[a-z0-9.-]+\.cloudflareaccess\.com$/.test(issuer)||
    !stableText(audience,128)||typeof now!=='function'||typeof isSessionActive!=='function'||
    !Array.isArray(publicKeys)||publicKeys.length<1||publicKeys.length>4)
   throw new TypeError('trusted_access_config_required');
 const keys=new Map();
 for(const jwk of publicKeys){
  if(!jwk||jwk.kty!=='RSA'||!stableText(jwk.kid,128)||!stableText(jwk.n,2048)||
    !stableText(jwk.e,16)||keys.has(jwk.kid)||jwk.d||jwk.p||jwk.q)
   throw new TypeError('invalid_public_jwk');
  // Approx 2048-bit minimum; production source must also validate JWK rotation.
  if(jwk.n.length<340)throw new TypeError('weak_rsa_public_key');
  keys.set(jwk.kid,Object.freeze({kty:'RSA',n:jwk.n,e:jwk.e,alg:'RS256',ext:true}));
 }
 return Object.freeze({
  async verify(request){
   const header=request?.headers?.get?.('cf-access-jwt-assertion');
   if(!stableText(header,8192))return fail();
   const jwt=header.split('.');
   if(jwt.length!==3)return fail();
   let protectedHeader,payload,signature;
   try{
    if(jwt[0].length>2048||jwt[1].length>4096||jwt[2].length>2048)return fail();
    protectedHeader=parse(jwt[0]);payload=parse(jwt[1]);signature=b64url(jwt[2]);
    if(!protectedHeader||typeof protectedHeader!=='object'||Array.isArray(protectedHeader)||
       protectedHeader.alg!=='RS256'||protectedHeader.typ!=='JWT'||
       !stableText(protectedHeader.kid,128)||!keys.has(protectedHeader.kid)||
       Object.keys(protectedHeader).some(x=>!['alg','kid','typ'].includes(x))||
       !payload||typeof payload!=='object'||Array.isArray(payload))return fail();
    const crypto=globalThis.crypto?.subtle;
    if(!crypto)return fail('verification_unavailable');
    const key=await crypto.importKey('jwk',keys.get(protectedHeader.kid),
      {name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
    const signedBytes=new TextEncoder().encode(jwt[0]+'.'+jwt[1]);
    const verified=await crypto.verify({name:'RSASSA-PKCS1-v1_5'},key,signature,signedBytes);
    if(!verified)return fail();
    const moment=now();
    if(!integer(moment)||payload.iss!==issuer||payload.type!=='app'||
       !Array.isArray(payload.aud)||payload.aud.length<1||payload.aud.length>8||
       !payload.aud.includes(audience)||!stableText(payload.sub,128)||
       !integer(payload.iat)||!integer(payload.exp)||payload.exp<=moment||
       payload.iat>moment+30||payload.exp<=payload.iat||
       (payload.nbf!==undefined&&(!integer(payload.nbf)||payload.nbf>moment+30))||
       payload.exp-payload.iat>86400)return fail();
    // A valid signature alone does not establish live authorization.
    let active=false;
    try{
     active=await isSessionActive(Object.freeze({subject:payload.sub,issuer,audience,
       expiresAt:payload.exp,issuedAt:payload.iat}));
    }catch{return fail();}
    if(active!==true)return fail();
    const sessionDigest=await crypto.digest('SHA-256',signature);
    return Object.freeze({ok:true,principal:Object.freeze({subject:payload.sub,
      sessionId:'jwt_'+HEX(new Uint8Array(sessionDigest)).slice(0,32),
      issuer,audience,expiresAt:payload.exp})});
   }catch{return fail();}
  }
 });
}
