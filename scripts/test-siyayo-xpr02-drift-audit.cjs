'use strict';
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const ws=JSON.parse(fs.readFileSync(path.join(root,'docs/siyayo-cross-project-watchlist.json'),'utf8')).watches;
function test(scenario,strict){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'xpr02-'));
 try{
  const fixture={branches:Object.fromEntries(ws.map(w=>[w.id,{sha:w.expected_sha}])),comparisons:{}};
  if(scenario==='drift'){
   fixture.branches['MCE:implementation']={sha:'0123456789abcdef0123456789abcdef01234567'};
   fixture.comparisons['MCE:implementation']={status:'ahead',files:[{filename:'data/santo-cruzeiro-universal.json',status:'modified'},{filename:'js/ris-responsive-preview.js',status:'modified'},{filename:'unexpected/file.js',status:'added'}]};
  }
  if(scenario==='unknown')delete fixture.branches['SIA:H14.40'];
  const f=path.join(dir,'fixture.json'),out=path.join(dir,'out');
  fs.writeFileSync(f,JSON.stringify(fixture));
  const args=[path.join(root,'scripts/siyayo-xpr02-drift-audit.cjs'),'--fixture',f,'--output-dir',out];
  if(strict)args.push('--strict');
  const p=cp.spawnSync(process.execPath,args,{encoding:'utf8'});
  assert.equal(p.error,undefined,'auditor spawn failed: '+p.error);
  assert.ok(fs.existsSync(path.join(out,'xpr02-report.json')),'Auditor did not generate xpr02-report.json; exit='+p.status+'; stdout='+p.stdout+'; stderr='+p.stderr);
  const r=JSON.parse(fs.readFileSync(path.join(out,'xpr02-report.json'),'utf8'));
  assert.ok(fs.existsSync(path.join(out,'xpr02-report.md')));
  assert.equal(p.status,scenario==='stable'?0:strict?2:0);
  assert.equal(r.decision,scenario==='stable'?'NO_REGISTERED_DRIFT':'REVIEW_REQUIRED');
  if(scenario==='stable')assert.equal(r.summary.match,ws.length);
  if(scenario==='drift'){
   const m=r.results.find(x=>x.watch_id==='MCE:implementation');
   assert.ok(m.potential_modules.includes('MCE:MCE-RS-01')&&m.potential_modules.includes('MCE:MCE-HYM-A'));
   assert.ok(m.changed_paths.some(x=>x.classification==='DOCUMENTARY_ONLY_NOT_LIVE_RENDERER'));
   assert.ok(m.changed_paths.some(x=>x.classification==='UNMAPPED_REVIEW_REQUIRED'));
   assert.ok(m.related_cross_project_links.some(x=>x.id==='XPR-LINK-01'));
  }
  if(scenario==='unknown')assert.equal(r.summary.unknown,1);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
}
test('stable',true);test('drift',false);test('drift',true);test('unknown',true);
console.log('XPR-02 OFFLINE PASS: match, drift, strict fail-closed, unknown, cross-project map');
