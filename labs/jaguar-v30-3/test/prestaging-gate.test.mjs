import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {examinePreStaging87D,readPreStaging87D} from '../scripts/prestaging-gate.mjs';
const root=resolve(import.meta.dirname,'../../..');
const at=p=>readFileSync(resolve(root,p),'utf8');
const manifest=JSON.parse(at('labs/jaguar-v30-3/security/prestaging-readiness.json'));
const names=readdirSync(resolve(root,'.github/workflows')).filter(x=>x.startsWith('jaguar-v30-3-')&&x.endsWith('.yml'));
const sources={
 worker:at('labs/jaguar-v30-3/src/worker-v30-integration.mjs'),
 wrangler:at('labs/jaguar-v30-3/test/wrangler.local.toml'),
 jwt:at('labs/jaguar-v30-3/test/http87/access-verifier.mjs'),
 http:at('labs/jaguar-v30-3/test/http87/read-only-http.mjs'),
 browser:at('labs/jaguar-v30-3/test/browser87/explorer-observation-client.mjs'),
 workflows:Object.fromEntries(names.map(n=>[n,at('.github/workflows/'+n)]))
};
const mutate=f=>{const m=structuredClone(manifest);f(m);return examinePreStaging87D(m,sources)};
const changed=(name,content)=>examinePreStaging87D(manifest,{...sources,[name]:content});
test('canonical manifest stays STAGING BLOCKED with twelve blockers',()=>{
 const r=readPreStaging87D();assert.equal(r.valid,true);assert.equal(r.verdict,'BLOCKED');assert.equal(r.blockers.length,12);
});
test('manifest must not authorize release',()=>assert.equal(mutate(m=>m.releaseAuthorized=true).valid,false));
test('manifest must not permit deployment',()=>assert.equal(mutate(m=>m.deploymentPermitted=true).valid,false));
test('environment must remain isolated',()=>assert.equal(mutate(m=>m.environment='STAGING').valid,false));
test('Explorer pin drift invalidates audit',()=>assert.equal(mutate(m=>m.explorerPin='main').valid,false));
test('missing external gate invalid',()=>assert.equal(mutate(m=>m.records.pop()).valid,false));
test('duplicate gate invalid',()=>assert.equal(mutate(m=>m.records[19].id='EXT-01').valid,false));
test('external self-attestation as green invalid',()=>assert.equal(mutate(m=>m.records.find(x=>x.id==='EXT-01').status='ready').valid,false));
test('external gate cannot impersonate local gate',()=>assert.equal(mutate(m=>m.records.find(x=>x.id==='EXT-05').kind='local').valid,false));
test('short unsupported external verification text invalid',()=>assert.equal(mutate(m=>m.records.find(x=>x.id==='EXT-03').verification='ok').valid,false));
test('no fake extra gate may sneak into inventory',()=>assert.equal(mutate(m=>m.records.push({id:'EXT-13',kind:'external',status:'ready'})).valid,false));
test('local provenance must cite versioned CI workflow',()=>assert.equal(mutate(m=>m.records[0].evidence='https://example.invalid').valid,false));
test('workers_dev must stay false',()=>assert.equal(changed('wrangler',sources.wrangler.replace('workers_dev = false','workers_dev = true')).valid,false));
test('D1 placeholder may not be replaced by real ID',()=>assert.equal(changed('wrangler',sources.wrangler.replace('00000000-0000-0000-0000-000000000030','real123')).valid,false));
test('legacy routes must stay disabled',()=>assert.equal(changed('worker',sources.worker.replace("'/__lab/v30/read-other'","'/__lab/v30/something'")).valid,false));
test('JWT signature verification must remain',()=>assert.equal(changed('jwt',sources.jwt.replace('crypto.verify','crypto.missing')).valid,false));
test('HTTP method deny must remain',()=>assert.equal(changed('http',sources.http.replace('method_not_allowed','write_allowed')).valid,false));
test('same-origin browser transport must remain',()=>assert.equal(changed('browser',sources.browser.replace("credentials:'same-origin'","credentials:'include'")).valid,false));
test('unsafe workflow branch detected',()=>{
 const name=names[0];assert.equal(examinePreStaging87D(manifest,{...sources,workflows:{...sources.workflows,[name]:sources.workflows[name].replace('jaguar/v30-3-recovery-archive','main')}}).valid,false);
});
test('unsafe workflow token permissions detected',()=>{
 const name=names[0];assert.equal(examinePreStaging87D(manifest,{...sources,workflows:{...sources.workflows,[name]:sources.workflows[name].replace('contents: read','contents: write')}}).valid,false);
});
test('deploy command in CI is rejected',()=>{
 const name=names[0];assert.equal(examinePreStaging87D(manifest,{...sources,workflows:{...sources.workflows,[name]:sources.workflows[name]+'\n# wrangler deploy\n'}}).valid,false);
});
test('Cloudflare secret reference in CI is rejected',()=>{
 const name=names[0];assert.equal(examinePreStaging87D(manifest,{...sources,workflows:{...sources.workflows,[name]:sources.workflows[name]+'\n# CLOUDFLARE_API_TOKEN\n'}}).valid,false);
});
test('explicit --require-ready stops with nonzero exit',()=>{
 const command=resolve(root,'labs/jaguar-v30-3/scripts/prestaging-gate.mjs');
 const r=spawnSync(process.execPath,[command,'--require-ready'],{encoding:'utf8'});
 assert.equal(r.status,2);assert.match(r.stderr,/STOP: staging release NOT authorized/);
});
test('normal audit passes consistency but prints BLOCKED',()=>{
 const command=resolve(root,'labs/jaguar-v30-3/scripts/prestaging-gate.mjs');
 const r=spawnSync(process.execPath,[command],{encoding:'utf8'});
 assert.equal(r.status,0);assert.match(r.stdout,/STAGING BLOCKED: 12 external controls/);
});
