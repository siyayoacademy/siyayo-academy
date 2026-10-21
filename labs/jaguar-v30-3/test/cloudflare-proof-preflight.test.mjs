import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {inspectCloudflareProof89,readCloudflareProof89} from '../scripts/cloudflare-proof-preflight.mjs';
const source=JSON.parse(readFileSync('security/cloudflare-live-proof.json','utf8'));
const change=fn=>{const v=structuredClone(source);fn(v);return inspectCloudflareProof89(v)};
test('readiness can be consistent but real Access proof remains BLOCKED',()=>{
 const r=readCloudflareProof89();assert.equal(r.ok,true);assert.equal(r.verdict,'BLOCKED');
 assert.equal(r.remainingExternalControls,12);
});
test('attempt to claim a real account is connected without evidence fails',()=>{
 assert.equal(change(x=>x.remoteCloudflareAccountVerified=true).ok,false);
});
test('attempt to claim Access is verified without evidence fails',()=>{
 assert.equal(change(x=>x.accessApplicationVerified=true).ok,false);
});
test('attempt to claim D1 staging exists fails',()=>{
 assert.equal(change(x=>x.dedicatedStagingD1Verified=true).ok,false);
});
test('no remote deployment flag may be authorized by a public manifest edit',()=>{
 assert.equal(change(x=>x.remoteDeploymentAuthorized=true).ok,false);
});
test('no remote mutation flag may be authorized by a public manifest edit',()=>{
 assert.equal(change(x=>x.remoteMutationAuthorized=true).ok,false);
});
test('no credentials are stored in a public proof manifest',()=>{
 assert.equal(change(x=>x.cloudflareAccountCredentialsStored=true).ok,false);
 const serialized=JSON.stringify(source);
 assert.equal(serialized.includes('CLOUDFLARE_API_TOKEN'),false);
});
test('fake team/account names are not passed off as verified',()=>{
 assert.equal(change(x=>x.cloudflareAccountIdentity='my-team').ok,false);
});
test('missing required safety gate fails',()=>{
 assert.equal(change(x=>x.liveProofs.pop()).ok,false);
});
test('extra fabricated gate fails',()=>{
 assert.equal(change(x=>x.liveProofs.push({id:'EXT-13',state:'verified',purpose:'unreviewed'})).ok,false);
});
test('duplicate gate cannot hide missing gate',()=>{
 assert.equal(change(x=>x.liveProofs[11].id='EXT-01').ok,false);
});
test('a gate cannot self-claim remote success',()=>{
 assert.equal(change(x=>x.liveProofs[0].state='verified').ok,false);
});
test('canonical Explorer pin drift is rejected',()=>{
 assert.equal(change(x=>x.officialExplorerCommit='main').ok,false);
});
test('remote workflows are never silently authorized',()=>{
 assert.equal(change(x=>x.phases=[]).ok,false);
});
test('untrusted public reference is rejected',()=>{
 assert.equal(change(x=>x.publicSources[0]='https://unknown.example.invalid/').ok,false);
});
test('forcing actual real-Access proof exits nonzero',()=>{
 const r=spawnSync(process.execPath,['scripts/cloudflare-proof-preflight.mjs','--require-live'],{encoding:'utf8'});
 assert.equal(r.status,2);assert.match(r.stderr,/REAL CLOUDFARE ACCESS PROOF NOT YET AVAILABLE/);
});
