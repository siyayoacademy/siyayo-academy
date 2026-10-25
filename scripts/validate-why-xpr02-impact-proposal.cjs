'use strict';
// Verify this documentary proposal and replay observations using existing XPR-02.
// No new drift engine, no network, no active watchlist modification.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const active=read('docs/siyayo-cross-project-watchlist.json');
const proposal=read('docs/proposals/siyayo-cross-project-watchlist-why-proposal.json');
const review=read('docs/reviews/why-xpr02-impact-review-20261025.json');
const observation=read('docs/reviews/why-xpr02-head-observation-20261025.json');
assert.equal(proposal.status,'PROPOSED_NOT_ACTIVE_NO_MONITORING');
assert.deepEqual(proposal.watches.slice(0,active.watches.length),active.watches);
assert.equal(active.watches.length,5);assert.equal(proposal.watches.length,16);
assert.equal(new Set(proposal.watches.map(w=>w.id)).size,16);
assert.equal(review.checkpoint_audit.length,12);
assert.ok(Object.values(review.protection).every(v=>v===false));
assert.equal(review.watchlist_activation,false);assert.equal(review.no_automatic_supervision,true);
for(const row of review.checkpoint_audit){
 assert.equal(row.current_sha,row.expected_sha);assert.equal(row.head_status,'MATCH');
 assert.ok(row.ci.some(run=>run.conclusion==='success'&&run.head_sha===row.expected_sha));
 assert.equal(row.explorer_integration,'NAO_INTEGRADO');assert.ok(row.human_homologation.startsWith('PENDENTE'));
 const watch=proposal.watches.find(w=>w.id==='SIA:'+row.elo);assert.equal(watch.expected_sha,row.expected_sha);assert.equal(watch.branch,row.branch);
 assert.ok(row.files.every(f=>f.status==='added'),'unexpected non-additive checkpoint');
}
for(let i=1;i<review.checkpoint_audit.length;i++)assert.equal(review.checkpoint_audit[i].parents[0],review.checkpoint_audit[i-1].expected_sha,'checkpoint chain drift');
assert.deepEqual(Object.keys(review.five_how),['HOW TO DO','HOW TO RECORD','HOW TO SHOW','HOW TO CHECK','HOW TO SPEAK']);
const registry=read('docs/siyayo-cross-project-registry.json');
for(const item of review.future_consumers)assert.ok(registry.entries.some(e=>e.id===item.ref));
// Reuse original auditor in isolated temp directory with proposed list substituted
// ONLY in that directory, never in this branch's active documents.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'why-xpr-proposal-'));
try{
 fs.mkdirSync(path.join(temp,'docs'));fs.mkdirSync(path.join(temp,'scripts'));
 fs.copyFileSync(path.join(root,'scripts/siyayo-xpr02-drift-audit.cjs'),path.join(temp,'scripts/siyayo-xpr02-drift-audit.cjs'));
 fs.copyFileSync(path.join(root,'docs/siyayo-cross-project-registry.json'),path.join(temp,'docs/siyayo-cross-project-registry.json'));
 fs.writeFileSync(path.join(temp,'docs/siyayo-cross-project-watchlist.json'),JSON.stringify(proposal));
 fs.writeFileSync(path.join(temp,'observation.json'),JSON.stringify(observation));
 const result=cp.spawnSync(process.execPath,[path.join(temp,'scripts/siyayo-xpr02-drift-audit.cjs'),'--fixture',path.join(temp,'observation.json'),'--strict','--output-dir',path.join(temp,'report')],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const r=JSON.parse(fs.readFileSync(path.join(temp,'report/xpr02-report.json'),'utf8'));
 assert.deepEqual(r.summary,{match:16,drift:0,unknown:0});
 assert.equal(r.mode,'offline_fixture');assert.equal(r.decision,'NO_REGISTERED_DRIFT');
 assert.deepEqual(read('docs/siyayo-cross-project-watchlist.json'),active);
 console.log('WHY/XPR proposal PASS: 12 pinned checkpoints, 16 observed HEADs, existing XPR-02 reused; active watchlist unchanged.');
}finally{fs.rmSync(temp,{recursive:true,force:true});}
