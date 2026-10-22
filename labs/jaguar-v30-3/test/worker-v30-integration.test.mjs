import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker-v30-integration.mjs';

function createEnv() {
  let dbCalls = 0;
  const env = {
    ASSESSMENT_DB: {
      prepare(sql) {
        dbCalls++;
        assert.match(sql, /sqlite_master/);
        return {async first() { return {name: 'v30_occurrences'}; }};
      }
    }
  };
  return {env, calls: () => dbCalls};
}
const hit = async (path, method='GET', env={}) => {
  const response = await worker.fetch(new Request('http://127.0.0.1:8791'+path,{method}),env);
  return {status:response.status, data:await response.json()};
};

for (const [path,method] of [
  ['/__lab/v30/write-once','POST'],
  ['/__lab/v30/read-once','GET'],
  ['/__lab/v30/read-other','GET']
]) {
  test('HTTP '+method+' '+path+': 404 without invoking D1',async()=>{
    const {env,calls}=createEnv();
    assert.deepEqual(await hit(path,method,env),{status:404,data:{error:'route_disabled'}});
    assert.equal(calls(),0);
  });
}

test('HTTP guard rejects alternate methods on blocked paths',async()=>{
  const {env,calls}=createEnv();
  for(const path of ['/__lab/v30/write-once','/__lab/v30/read-once','/__lab/v30/read-other']){
    assert.deepEqual(await hit(path,'PUT',env),{status:404,data:{error:'route_disabled'}});
  }
  assert.equal(calls(),0);
});

test('HTTP GET /health: 200 when local D1 table exists',async()=>{
  const {env,calls}=createEnv();
  assert.deepEqual(await hit('/__lab/v30/health','GET',env),{status:200,data:{ok:true,table:'v30_occurrences'}});
  assert.equal(calls(),1);
});

test('HTTP POST /health and unknown route: 404 without touching D1',async()=>{
  const {env,calls}=createEnv();
  assert.equal((await hit('/__lab/v30/health','POST',env)).status,404);
  assert.equal((await hit('/not-a-route','GET',env)).status,404);
  assert.equal(calls(),0);
});

test('HTTP /health fails closed without DB or with failed query',async()=>{
  assert.deepEqual(await hit('/__lab/v30/health'),{status:503,data:{error:'storage_unavailable'}});
  const broken={ASSESSMENT_DB:{prepare(){throw new Error('mock query failed');}}};
  assert.deepEqual(await hit('/__lab/v30/health','GET',broken),{status:500,data:{error:'storage_failure'}});
});

test('HTTP GET /probe: no proof yields unauthenticated diagnostic only',async()=>{
  const {env}=createEnv();
  assert.deepEqual(await hit('/__lab/v30/probe','GET',env),{status:200,data:{ok:false,reason:'unauthenticated'}});
});
