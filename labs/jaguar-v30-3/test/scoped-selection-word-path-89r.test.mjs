// V30.3.89R — original pinned Explorer retention and Word Path; synthetic, offline only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createRequire} from 'node:module';
import vm from 'node:vm';
const pinned=process.env.SIYAYO_89R_PINNED_ROOT;
if(!pinned)throw Error('STOP: immutable pinned Explorer checkout required');
const base=resolve(process.cwd(),pinned);
const source=p=>readFileSync(join(base,p),'utf8');
const r=createRequire(join(base,'package.json'));
const Scope=r('./js/adaptive-assessment-scope.js');
const Eval=r('./js/green-pass-profile.js');
const Progress=r('./js/adaptive-pass-contract-progress-view.js');
const Trail=r('./js/adaptive-learner-trail-view.js');
const Marker=r('./js/adaptive-learner-progress-marker.js');
const names={which:'which.use.determiner',what:'what.use.object-question',
 where:'where.use.location-question',why:'why.use.contextual-reason'};
const contracts=Object.fromEntries(Object.keys(names).map(w=>[
 w,JSON.parse(source('data/learning/skills/'+w+'.json')).passContract
]));
const origins={which:'shopping-for-dinner',what:'preparing-dinner',
 where:'shopping-for-dinner',why:'having-dinner'};
const next={which:'preparing-dinner',what:'having-dinner',
 where:'preparing-dinner',why:'after-dinner-conversation'};
const scope=(id,w,lang,origin=origins[w])=>{
 const s=Scope.create({learnerId:id,skill:names[w],language:lang,originExperienceId:origin});
 assert.ok(Scope.valid(s));return s;
};
const witness=(s,req,i,to)=>({
 skill:s.skill,dimension:req.dimension,result:req.result,
 ...(req.mode?{mode:req.mode}:{}),...(req.support?{support:req.support}:{}),
 context:{assessmentScope:s,language:s.language,
  experienceId:i===2?to:s.originExperienceId,
  fromExperienceId:i===2?s.originExperienceId:null,
  selectedAlternativeId:i===0?'question':i===1?'local-answer':'transfer-answer'}
});
const snapshot=(s,w,n,to=next[w])=>({
 session:{decision:{skill:s.skill,experienceId:s.originExperienceId,assessmentScope:s}},
 context:{assessmentScope:s,passContract:contracts[w],
  evidencePackets:contracts[w].requires.slice(0,n).map((req,i)=>witness(s,req,i,to))}
});
let principal='OPAQUE-A';
const sandbox={Object,Array,Map,Set,Number,JSON,Promise,Date,
 AdaptiveAssessmentScope:Scope,GreenPassProfile:Eval,AdaptivePassContractProgressView:Progress,
 SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>principal},
 localStorage:{getItem:()=>null,setItem:()=>{throw Error('unexpected storage write');}}};
sandbox.globalThis=sandbox;
vm.runInNewContext(source('js/verb-explorer-polyglot-word-path-view.js'),sandbox,{filename:'pinned-word-path.js'});
vm.runInNewContext(source('js/verb-explorer-thinking-mind-assessment-selection.js'),sandbox,{filename:'pinned-selection.js'});
const selection=sandbox.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
const details=sandbox.SIYAYOVerbExplorerWordPathWitnessView;
const matrix=sandbox.SIYAYOVerbExplorerPolyglotWordPathView;
const a={
 which:scope('OPAQUE-A','which','en'),
 whatS1:scope('OPAQUE-A','what','en','shopping-for-dinner'),
 whatS2:scope('OPAQUE-A','what','en','preparing-dinner'),
 where:scope('OPAQUE-A','where','es'),
 whyPt:scope('OPAQUE-A','why','pt'),
 whyEn:scope('OPAQUE-A','why','en')
};
const b={
 what:scope('OPAQUE-B','what','en','preparing-dinner'),
 why:scope('OPAQUE-B','why','pt')
};
const entriesA=[[a.which,'which',1],[a.whatS1,'what',2,'preparing-dinner'],
 [a.whatS2,'what',1,'having-dinner'],[a.where,'where',1],
 [a.whyPt,'why',2],[a.whyEn,'why',1]];
const entriesB=[[b.what,'what',2],[b.why,'why',1]];
for(const [s,w,n,to] of entriesA)
 assert.equal(selection.remember(snapshot(s,w,n,to),{id:s.skill}),true);
principal='OPAQUE-B';
for(const [s,w,n,to] of entriesB)
 assert.equal(selection.remember(snapshot(s,w,n,to),{id:s.skill}),true);
const progress=(w,l)=>selection.getRetainedProgress(names[w],l);
const evidence=(w,l)=>selection.getRetainedEvidence(names[w],l);
const profile=(id,observations=[])=>({id,observations});
const catalog={getExperience(id){return {id,title:{en:id,es:id,pt:id}};},
 getNouns(){return {items:[]};}};
function render(id,observations=[]){
 return matrix.render({language:'pt',profile:profile(id,observations),
  identity:sandbox.SIYAYOVerbExplorerLearnerIdentitySource,selection,snapshot:null,
  progressView:Progress,evaluator:Eval,scopeApi:Scope,catalog,
  trailView:Trail,markerAuthority:Marker});
}
test('89R.1 real selection returns to A after B without mixing same QW or language',()=>{
 principal='OPAQUE-A';
 assert.deepEqual(progress('what','en').map(x=>[x.originExperienceId,x.progress.completed]),
  [['shopping-for-dinner',2],['preparing-dinner',1]]);
 assert.equal(progress('which','en')[0].progress.completed,1);
 assert.equal(progress('where','es')[0].progress.completed,1);
 assert.equal(progress('why','pt')[0].progress.completed,2);
 assert.equal(progress('why','en')[0].progress.completed,1);
 assert.equal(progress('where','en').length,0);
 assert.equal(progress('what','es').length,0);
 principal='OPAQUE-B';
 assert.deepEqual(progress('what','en').map(x=>x.progress.completed),[2]);
 assert.equal(progress('which','en').length,0);
 assert.equal(progress('why','pt')[0].progress.completed,1);
 assert.equal(selection.remember(snapshot(a.whatS1,'what',3,'preparing-dinner'),{id:names.what}),false);
 principal='OPAQUE-A';
 assert.deepEqual(progress('what','en').map(x=>x.progress.completed),[2,1]);
 principal=null;
 assert.equal(progress('what','en').length,0);
 principal='OPAQUE-A';
});
test('89R.2 original Word Path respects two WHAT origins and 12 localized cells',()=>{
 principal='OPAQUE-A';
 const html=render('OPAQUE-A');
 assert.equal((html.match(/class="wp-poly-cell"/g)||[]).length,12);
 assert.equal((html.match(/class="wp-evidence-card"/g)||[]).length,6);
 assert.match(html,/data-skill="what.use.object-question" data-language="en" data-state="multiple"/);
 assert.match(html,/2\/3/);assert.match(html,/1\/3/);
 assert.match(html,/shopping-for-dinner/);assert.match(html,/preparing-dinner/);
 assert.ok(!html.includes('OPAQUE-A')&&!html.includes('OPAQUE-B'),'no internal principal in DOM');
 assert.equal(render('OPAQUE-B'),'','identity mismatch must hide entire Word Path');
 principal='OPAQUE-B';
 const bHtml=render('OPAQUE-B');
 assert.equal((bHtml.match(/class="wp-evidence-card"/g)||[]).length,2);
 assert.ok(!bHtml.includes('shopping-for-dinner'),'A WHAT S1 origin cannot leak to B');
 principal='OPAQUE-A';
});
test('89R.3 evidence detail uses exact scope and does not invent transfer witness',()=>{
 principal='OPAQUE-A';
 const what=evidence('what','en');
 assert.equal(what.length,2);
 assert.deepEqual(what.map(x=>x.detail.completed),[2,1]);
 assert.equal(what[0].detail.items[2].accepted,false);
 assert.equal(what[0].detail.items[2].selectedAlternativeId,'');
 assert.equal(what[1].detail.items[1].accepted,false);
 assert.equal(evidence('what','pt').length,0);
 principal='OPAQUE-B';
 assert.equal(evidence('what','en').length,1);
 assert.equal(evidence('what','en')[0].detail.originExperienceId,'preparing-dinner');
 principal='OPAQUE-A';
 const foreignPacket=witness(b.what,contracts.what.requires[0],0,'having-dinner');
 const suspicious=details.project({scope:a.whatS1,scopeApi:Scope,evaluator:Eval,progressView:Progress,
  context:{assessmentScope:a.whatS1,passContract:contracts.what,evidencePackets:[foreignPacket]}});
 assert.equal(suspicious.completed,0,'foreign packet cannot become accepted witness');
});
test('89R.4 S4 visit and observed WHY transfer do not confirm Green or overwrite S3 origin',()=>{
 principal='OPAQUE-A';
 const observed={source:'why-contextual-reason-probe-select',status:'observed',context:{
  skill:a.whyPt.skill,language:'pt',assessmentScope:a.whyPt,
  experienceId:'after-dinner-conversation',confirmed:false,contractStatus:null}};
 const before=progress('why','pt')[0].progress.completed;
 const trail=Trail.project(profile('OPAQUE-A',[observed]),a.whyPt.skill,
  {language:'pt',originExperienceId:'having-dinner'});
 assert.equal(trail.footprints.length,1);
 assert.equal(trail.counts.greenPassClosures,0);
 assert.equal(Marker.resolve(trail).marker,'PARTIAL_DOT');
 assert.equal(progress('why','pt')[0].progress.completed,before);
 assert.equal(before,2);
 const html=render('OPAQUE-A',[observed]);
 assert.match(html,/data-skill="why.use.contextual-reason" data-language="pt" data-state="saved"/);
 assert.ok(!html.includes('3/3 · Confirmada'),'S4 observation cannot confer a 3/3 or confirmed label');
 assert.equal(a.whyPt.originExperienceId,'having-dinner');
 assert.equal(selection.getRetainedEvidence(names.why,'pt')[0].detail.items[2].accepted,false);
});
