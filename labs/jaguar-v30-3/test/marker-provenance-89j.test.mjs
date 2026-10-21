// V30.3.89J - offline provenance regression. Nothing is deployed or scored.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import {observationPreview85D} from './storage-contract/restore-observer.mjs';
import {validateObservationSnapshot85E} from './observation-ui/observation-panel.mjs';
import {read89D,inspect89D} from '../scripts/check-staging-architecture-89d.mjs';

const root=process.env.SIYAYO_89J_PINNED_ROOT;
if(!root)throw Error('Pinned canonical Explorer checkout required');
const base=resolve(process.cwd(),root),requireSource=createRequire(import.meta.url);
const Marker=requireSource(join(base,'js/adaptive-learner-progress-marker.js'));
const Progress=requireSource(join(base,'js/adaptive-pass-contract-progress-view.js'));
const Evaluator=requireSource(join(base,'js/green-pass-profile.js'));
const which=requireSource(join(base,'data/learning/skills/which.json'));
const trail=footprints=>({skill:'which.use.determiner',footprints});
const footprint=(patch={})=>({source:'determiner-use-probe',status:'observed',
 experienceId:'shopping-for-dinner',confirmed:false,contractStatus:null,...patch});
const closure=experienceId=>footprint({source:'green-pass-contract',
 status:'transfer-confirmed',confirmed:true,contractStatus:'GREEN_PASS',experienceId});
const history=(q,language,purpose='assessment')=>{
 const skill={WHICH:'which.use.determiner',WHAT:'what.use.object-question',
  WHERE:'where.use.location-question',WHY:'why.use.contextual-reason'};
 return {ok:true,kind:'OBSERVATIONS_ONLY',questionWord:q,language,
  skillId:skill[q],originExperienceId:'shopping-for-dinner',
  events:[{questionWord:q,language,originExperienceId:'shopping-for-dinner',
   purpose,status:purpose==='assessment'?'pending':'observed_exploratory'}]};
};
const findCell=(snapshot,q,language)=>snapshot.cells.find(c=>c.questionWord===q&&c.language===language);
const choice={dimension:'choice-function',result:'pass',support:'none'};
const use={mode:'local',dimension:'determiner-use',result:'pass',support:'none'};
const transfer={mode:'transfer',dimension:'determiner-use',result:'pass',support:'none'};

test('observational ○/◐ never include accepted-progress, Green Pass, ● or ★',()=>{
 const snapshot=observationPreview85D([history('WHAT','pt'),history('WHAT','pt','exploration')]);
 assert.equal(validateObservationSnapshot85E(snapshot),true);
 assert.equal(findCell(snapshot,'WHAT','pt').observationMarker,'◐');
 assert.equal(findCell(snapshot,'WHY','pt').observationMarker,'○');
 assert.deepEqual([findCell(snapshot,'WHAT','pt').pendingOccurrences,
   findCell(snapshot,'WHAT','pt').exploratoryObservations],[1,1]);
 assert.ok(snapshot.cells.every(c=>c.acceptedProgress===null&&
   c.confirmed===false&&c.greenPass===false&&!['●','★'].includes(c.observationMarker)));
});
test('a synthetic ◐ does not mutate the canonical Trail marker ○',()=>{
 const s=observationPreview85D([history('WHICH','en')]);
 assert.equal(findCell(s,'WHICH','en').observationMarker,'◐');
 assert.equal(Marker.resolve(trail([])).marker,'EMPTY_DOT');
});
test('canonical footprint without closing Green produces only ◐',()=>{
 const r=Marker.resolve(trail([footprint()]));
 assert.equal(r.marker,'PARTIAL_DOT');assert.equal(r.confirmedExperiences,0);
});
test('partial or counterfeit closure fields cannot mint ●',()=>{
 for(const patch of [
  {status:'observed'},{source:'exploration'},{confirmed:false},
  {contractStatus:'WAITING_FOR_EVIDENCE'}
 ]){
  const r=Marker.resolve(trail([footprint({
   ...closure('shopping-for-dinner'),...patch
  })]));
  assert.equal(r.marker,'PARTIAL_DOT');assert.equal(r.confirmedExperiences,0);
 }
});
test('one distinct confirmed Experience means ●; duplicates never mean ★',()=>{
 for(const foot of [[closure('shopping-for-dinner')],[closure('shopping-for-dinner'),closure('shopping-for-dinner')]]){
  const r=Marker.resolve(trail(foot));
  assert.equal(r.marker,'FILLED_DOT');assert.equal(r.confirmedExperiences,1);
 }
});
test('two distinct Green closures alone mean ★',()=>{
 const r=Marker.resolve(trail([
  closure('shopping-for-dinner'),closure('preparing-dinner')
 ]));
 assert.equal(r.marker,'MILESTONE');assert.equal(r.confirmedExperiences,2);
});
test('contract 0/3 → 3/3 comes from canonical evaluator, never observation count',()=>{
 for(const [packets,n,state] of [
  [[],0,'WAITING_FOR_EVIDENCE'],[[choice],1,'WAITING_FOR_EVIDENCE'],
  [[choice,use],2,'WAITING_FOR_EVIDENCE'],[[choice,use,transfer],3,'GREEN_PASS']
 ]){
  const r=Progress.project(which.passContract,packets,Evaluator);
  assert.equal(r.completed,n);assert.equal(r.total,3);assert.equal(r.status,state);
  assert.equal(r.satisfied.filter(Boolean).length,n);
 }
});
test('●●○ at 2/3 is not the large confirmed ● without closure',()=>{
 const r=Progress.project(which.passContract,[choice,use],Evaluator);
 assert.deepEqual(r.satisfied,[true,true,false]);
 assert.equal(Marker.resolve(trail([footprint()])).marker,'PARTIAL_DOT');
});
test('an earlier confirmed ● can coexist with a new 0/3 Session',()=>{
 const past=Marker.resolve(trail([closure('shopping-for-dinner')]));
 const next=Progress.project(which.passContract,[],Evaluator);
 assert.equal(past.marker,'FILLED_DOT');
 assert.equal(next.completed,0);assert.equal(next.status,'WAITING_FOR_EVIDENCE');
});
test('four authored QWs × three languages remain 12 non-credit observations',()=>{
 const q=['WHICH','WHAT','WHERE','WHY'],languages=['en','es','pt'];
 const snapshots=observationPreview85D(q.flatMap(word=>languages.map(l=>history(word,l))));
 assert.equal(snapshots.cells.length,12);
 assert.equal(validateObservationSnapshot85E(snapshots),true);
 assert.ok(snapshots.cells.every(c=>c.pendingOccurrences===1&&c.acceptedProgress===null));
});
test('canonical UI retains explicit separate guidance in EN ES PT',()=>{
 const trailSrc=readFileSync(join(base,'js/verb-explorer-learner-trail-surface.js'),'utf8');
 const wordPathSrc=readFileSync(join(base,'js/verb-explorer-polyglot-word-path-view.js'),'utf8');
 for(const label of ['HOW TO READ THE TRAIL','CÓMO LEER LA RUTA','COMO LER A TRILHA']){
  assert.ok(trailSrc.includes(label),label);
 }
 for(const label of ['ACCEPTED EVIDENCE','EVIDENCIAS ACEPTADAS','EVIDÊNCIAS ACEITAS']){
  assert.ok(wordPathSrc.includes(label),label);
 }
 assert.match(wordPathSrc,/Exploratory responses never earn credit/);
});
test('external staging STOP gate remains blocked independently of green local CI',()=>{
 const r=inspect89D(read89D());
 assert.equal(r.valid,true);assert.equal(r.verdict,'BLOCKED');
 assert.equal(r.blockedExternalGates,12);
});
