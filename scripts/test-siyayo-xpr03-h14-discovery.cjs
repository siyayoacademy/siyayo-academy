'use strict';
// Synthetic branch discovery tests, offline only: stable, added H14.52, missing branch, fetch failure.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),w=JSON.parse(fs.readFileSync(path.join(root,'docs/siyayo-cross-project-watchlist.json'),'utf8'));
const known=w.watches.filter(x=>x.role==='laboratory').map(x=>x.branch);
function verify(name,branches,error,strict){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'siyayo-xpr03-'));
 try{
  const file=path.join(tmp,'input.json'),out=path.join(tmp,'out');
  fs.writeFileSync(file,JSON.stringify(error?{error}:{branches}));
  const args=[path.join(root,'scripts/siyayo-xpr03-h14-discovery.cjs'),'--fixture',file,'--output-dir',out];
  if(strict)args.push('--strict');
  const p=cp.spawnSync(process.execPath,args,{encoding:'utf8'});
  assert.equal(p.error,undefined,'auditor spawn failed: '+p.error);
  assert.ok(fs.existsSync(path.join(out,'xpr03-discovery.json')),'Auditor did not generate xpr03-discovery.json; exit='+p.status+'; stdout='+p.stdout+'; stderr='+p.stderr);
  const report=JSON.parse(fs.readFileSync(path.join(out,'xpr03-discovery.json'),'utf8'));
  assert.equal(report.decision,name==='match'?'REGISTERED_H14_COVERAGE_MATCH':'REVIEW_REQUIRED');
  assert.equal(p.status,name==='match'?0:strict?2:0);
  if(name==='new')assert.deepEqual(report.untracked,['jaguar/h14-52-why-next-lab']);
  if(name==='missing')assert.equal(report.missing.length,1);
  if(name==='error')assert.ok(report.unavailable);
  assert.ok(fs.existsSync(path.join(out,'xpr03-discovery.md')));
 }finally{fs.rmSync(tmp,{recursive:true,force:true})}
}
verify('match',known,null,true);
verify('new',[...known,'jaguar/h14-52-why-next-lab'],null,true);
verify('missing',known.slice(1),null,true);
verify('error',null,'offline API unavailable',true);
console.log('XPR-03 PASS: current coverage, new-branch detection, missing-branch detection and fail-closed unavailable API');
