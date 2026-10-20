// Exercise the actual local workerd HTTP API, not the mocked JS fetch handler.
import assert from 'node:assert/strict';
import {setTimeout as delay} from 'node:timers/promises';
const root='http://127.0.0.1:8791';
const check=async(path,method,status,expected)=>{
  const resp=await fetch(root+path,{method,signal:AbortSignal.timeout(5000)});
  const json=await resp.json();
  assert.equal(resp.status,status,method+' '+path+': HTTP '+resp.status+' '+JSON.stringify(json));
  assert.deepEqual(json,expected,method+' '+path);
  console.log('PASS '+method+' '+path+' -> '+status);
};
let ready=false;
for(let n=0;n<55;n++){
  try{
    const r=await fetch(root+'/__lab/v30/health',{signal:AbortSignal.timeout(2000)});
    if(r.status===200 && (await r.json()).table==='v30_occurrences'){ready=true;break;}
  }catch{}
  await delay(1000);
}
assert.ok(ready,'Wrangler local D1 /health failed to start with migrated table');
await check('/__lab/v30/health','GET',200,{ok:true,table:'v30_occurrences'});
await check('/__lab/v30/health','POST',404,{error:'route_disabled'});
await check('/__lab/v30/write-once','POST',404,{error:'route_disabled'});
await check('/__lab/v30/read-once','GET',404,{error:'route_disabled'});
await check('/__lab/v30/read-other','GET',404,{error:'route_disabled'});
await check('/__lab/v30/write-once','GET',404,{error:'route_disabled'});
await check('/__lab/v30/read-once','POST',404,{error:'route_disabled'});
await check('/__lab/v30/read-other','POST',404,{error:'route_disabled'});
await check('/__lab/v30/unknown','GET',404,{error:'route_disabled'});
await check('/__lab/v30/probe','GET',200,{ok:false,reason:'unauthenticated'});
console.log('CLOUDFLARE LOCAL WORKER + D1: PASS (no remote requests/deploy)');
