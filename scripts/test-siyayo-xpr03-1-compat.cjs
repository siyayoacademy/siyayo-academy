'use strict';
// Isolated contract tests; never change the real watchlist or remote repositories.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const list=read('docs/siyayo-cross-project-watchlist.json');
const prior=JSON.parse(cp.execFileSync('git',['show','39b81289f1a05479701343325640b31bc7ded02b:docs/siyayo-cross-project-watchlist.json'],{cwd:root,encoding:'utf8'}));
assert.equal(list.watches.length,17);
assert.deepEqual(list.watches.slice(0,16),prior.watches,'all original checkpoints must remain byte-value identical and ordered');
assert.equal(new Set(list.watches.map(w=>w.id)).size,17);
assert.equal(list.watches[16].expected_sha,'677ced16460e9f0f5c88a40a379293beedb3c07f');
const registry=read('docs/siyayo-cross-project-registry.json');
function run(version,mutate){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'xpr031-'));
 try{
  fs.mkdirSync(path.join(tmp,'docs'));fs.mkdirSync(path.join(tmp,'scripts'));
  fs.copyFileSync(path.join(root,'scripts/siyayo-xpr02-drift-audit.cjs'),path.join(tmp,'scripts/audit.cjs'));
  const w=structuredClone(list);if(version===undefined)delete w.schema_version;else w.schema_version=version;
  if(mutate)mutate(w);
  fs.writeFileSync(path.join(tmp,'docs/siyayo-cross-project-registry.json'),JSON.stringify(registry));
  fs.writeFileSync(path.join(tmp,'docs/siyayo-cross-project-watchlist.json'),JSON.stringify(w));
  fs.writeFileSync(path.join(tmp,'fixture.json'),JSON.stringify({branches:Object.fromEntries(list.watches.map(x=>[x.id,{sha:x.expected_sha}]))}));
  const out=path.join(tmp,'out');
  const p=cp.spawnSync(process.execPath,[path.join(tmp,'scripts/audit.cjs'),'--fixture',path.join(tmp,'fixture.json'),'--strict','--output-dir',out],{encoding:'utf8'});
  assert.equal(p.error,undefined);
  const allowed=['1.0.0','1.1.0'].includes(version)&&!mutate;
  if(allowed){
   assert.equal(p.status,0,p.stderr);
   const r=JSON.parse(fs.readFileSync(path.join(out,'xpr02-report.json'),'utf8'));
   assert.equal(r.summary.match,17);assert.ok(fs.readFileSync(path.join(out,'xpr02-report.md'),'utf8').includes('NO_REGISTERED_DRIFT'));
  }else{
   assert.notEqual(p.status,0);assert.match(p.stderr,mutate?/unexpected repository|bad HEAD reference/:/unsupported watchlist schema_version/);
   assert.equal(fs.existsSync(path.join(out,'xpr02-report.json')),false,'invalid contract must not yield a success report');
  }
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
}
for(const v of ['1.0.0','1.1.0','1.2.0','2.0.0','1.1',null,undefined])run(v);
for(const v of ['1.0.0','1.1.0']){
 run(v,w=>{w.watches[0].repository='untrusted/repo'});
 run(v,w=>{w.watches[0].expected_sha='invalid'});
 run(v,w=>{w.watches[0].branch='../unsafe'});
}
console.log('XPR-03.1 PASS: 13 schema/security cases, original 16 checkpoints preserved, 17 unique references, project separation');
