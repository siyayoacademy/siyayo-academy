// Jaguar 89P — reproduces historical RED test, runs corrected ephemeral copy,
// verifies 1/3 → 2/3 → 3/3 without altering canonical contract or official scripts.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {createRequire} from 'node:module';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
const pinned=process.env.SIYAYO_89P_PINNED_ROOT;
if(!pinned)throw Error('STOP: immutable Explorer checkout is required');
const source=resolve(process.cwd(),pinned);
const read=p=>readFileSync(join(source,p),'utf8');
const requirePinned=createRequire(join(source,'package.json'));
const Profile=requirePinned('./js/green-pass-profile.js');
const contract=JSON.parse(read('data/learning/skills/which.json')).passContract;
const historical=read('scripts/test-which-third-attempt-green-boundary.js');
const choice={skill:'which.use.determiner',dimension:'choice-function',result:'pass',
 support:'none',context:'shopping-for-dinner'};
const useLocal={skill:'which.use.determiner',dimension:'determiner-use',result:'pass',
 mode:'local',support:'none',context:'shopping-for-dinner'};
const transfer={skill:'which.use.determiner',dimension:'determiner-use',result:'pass',
 mode:'transfer',support:'none',
 context:{fromExperienceId:'shopping-for-dinner',experienceId:'preparing-dinner'}};
function state(packets){
 const result=Profile.evaluateContract(contract,packets);
 return {result,passed:result.requirements.filter(x=>x.satisfied).length};
}
test('89P.1 canonical contract requires explicit local mode, not inferred from pass result',()=>{
 assert.deepEqual(contract.requires.map(x=>x.dimension),['choice-function','determiner-use','determiner-use']);
 assert.equal(contract.requires[1].mode,'local');
 assert.equal(contract.requires[2].mode,'transfer');
 assert.equal(contract.requires[1].support,'none');
 assert.equal(contract.requires[2].support,'none');
});
test('89P.1 preserved historical test is EXPECTED RED for exactly WAITING_FOR_EVIDENCE',()=>{
 const r=spawnSync(process.execPath,['scripts/test-which-third-attempt-green-boundary.js'],{
  cwd:source,encoding:'utf8',timeout:25000,maxBuffer:2e6});
 assert.equal(r.error,undefined,'Could not execute historical test');
 assert.notEqual(r.status,0,'Unexpected GREEN: historical fixture changed; study before editing');
 assert.match(r.stderr,/AssertionError \[ERR_ASSERTION\]/);
 assert.match(r.stderr,/WAITING_FOR_EVIDENCE/);
 assert.match(r.stderr,/GREEN_PASS/);
 // RED is an intentionally observed historical fixture limitation, not production failure.
});
test('89P.2 progressive 1/3 → 2/3 → 3/3 comes only from explicitly contract-matching packets',()=>{
 const steps=[
  {packets:[choice],score:1,status:'WAITING_FOR_EVIDENCE'},
  {packets:[choice,useLocal],score:2,status:'WAITING_FOR_EVIDENCE'},
  {packets:[choice,useLocal,transfer],score:3,status:'GREEN_PASS'}
 ];
 for(const step of steps){
  const {result,passed}=state(step.packets);
  assert.equal(passed,step.score);
  assert.equal(result.status,step.status);
  assert.equal(result.missing.length,3-step.score);
 }
});
test('89P.2 no grant from missing mode, local duplicates, or mismatched support and transfer mode',()=>{
 const bad=[
  [choice,{...useLocal,mode:undefined},transfer],
  [choice,useLocal,{...useLocal}],
  [choice,useLocal,{...transfer,support:'hint'}],
  [choice,useLocal,{...transfer,mode:undefined}],
  [choice,useLocal,{...transfer,result:'fail'}],
  [{...choice,result:'fail'},useLocal,transfer]
 ];
 for(const packets of bad)assert.equal(state(packets).result.status,'WAITING_FOR_EVIDENCE');
});
test('89P.3 isolated corrected clone of historical test passes without changing official source',()=>{
 const before=read('scripts/test-which-third-attempt-green-boundary.js');
 const needle="{skill:'which.use.determiner',dimension:'determiner-use',result:'pass',support:'none',context:'shopping-for-dinner'}";
 const patch="{skill:'which.use.determiner',dimension:'determiner-use',result:'pass',support:'none',mode:'local',context:'shopping-for-dinner'}";
 assert.equal(before.split(needle).length-1,1,'STOP: historical fixture no longer has expected shape');
 const transformed=before.replace(needle,patch);
 assert.notEqual(transformed,before);
 const dir=mkdtempSync(join(tmpdir(),'siyayo-89p-'));
 try{
  const file=join(dir,'corrected-test.cjs');
  writeFileSync(file,transformed,'utf8');
  const r=spawnSync(process.execPath,[file],{cwd:source,encoding:'utf8',timeout:25000,maxBuffer:2e6});
  assert.equal(r.error,undefined,'Corrected clone could not run');
  assert.equal(r.status,0,'Corrected clone failed:\n'+r.stdout+'\n'+r.stderr);
  assert.match(r.stdout,/cross-Experience transfer completes the 3-footprint contract/);
  assert.equal(read('scripts/test-which-third-attempt-green-boundary.js'),before,
   'Official test source must remain byte-for-byte unchanged');
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('89P.4 source keeps contract authority independent of NEXT automatic navigation',()=>{
 const cycle=read('js/adaptive-learning-cycle.js');
 assert.match(cycle,/contractEligible = operationalAuthority === 'contract' && contractEvaluation\?\.status === 'GREEN_PASS'/);
 assert.match(cycle,/action: 'continue-assessment', authority: 'contract', reason: 'green-pass-eligible-awaiting-route'/);
 assert.match(cycle,/if \(recommendation\.action === 'advance'\)/);
});
test('89P.4 original S1 to S2 transfer bridge rejects mismatched origin, choice and repeated Experience',()=>{
 const Bridge=requirePinned('./js/adaptive-determiner-use-transfer-probe-evidence-bridge.js');
 const Boundary=requirePinned('./js/adaptive-determiner-use-transfer-probe-attempt-boundary.js');
 const Sensor=requirePinned('./js/adaptive-determiner-use-transfer-probe-support-sensor.js');
 const event={observed:true,actor:'learner',source:'determiner-use-transfer-probe-select',
  occurrenceId:'89p:1',choice:'carrots',fromExperienceId:'shopping-for-dinner',
  experienceId:'preparing-dinner',dimension:'determiner-use',mode:'transfer',
  targetForm:'which',targetNoun:'carrots'};
 const result={occurrenceId:event.occurrenceId,fromExperienceId:event.fromExperienceId,
  experienceId:event.experienceId,skill:'which.use.determiner',dimension:'determiner-use',
  mode:'transfer',targetForm:'which',targetNoun:'carrots',
  selectedAlternativeId:'carrots',result:'pass'};
 const sensor=Sensor.create();
 const pack=Bridge.fromResult({result,learnerEvent:event,supportSensor:sensor});
 assert.equal(pack?.mode,'transfer');assert.equal(pack?.support,'none');
 assert.equal(Boundary.assemble({learnerEvent:event,evidence:pack})?.mode,'transfer');
 assert.equal(Bridge.fromResult({result:{...result,selectedAlternativeId:'tomatoes'},learnerEvent:event,supportSensor:sensor}),null);
 assert.equal(Bridge.fromResult({result:{...result,fromExperienceId:'having-dinner'},learnerEvent:event,supportSensor:sensor}),null);
 assert.equal(Bridge.fromResult({result:{...result,experienceId:'shopping-for-dinner'},learnerEvent:event,supportSensor:sensor}),null);
 assert.equal(Boundary.assemble({learnerEvent:{...event,choice:'wrong'},evidence:pack}),null);
});
