// 89Q: scope continuity and longitudinal evidence projection, synthetic only.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {resolve,join} from 'node:path';
import {readFileSync} from 'node:fs';
const root=process.env.SIYAYO_89Q_PINNED_ROOT;
if(!root)throw Error('Immutable pinned Explorer required');
const base=resolve(process.cwd(),root),r=createRequire(join(base,'package.json'));
const Scope=r('./js/adaptive-assessment-scope.js');
const Trail=r('./js/adaptive-learner-trail-view.js');
const Marker=r('./js/adaptive-learner-progress-marker.js');
const Eval=r('./js/green-pass-profile.js');
const Progress=r('./js/adaptive-pass-contract-progress-view.js');
const corpus=JSON.parse(readFileSync(join(base,'data/learning/experience-seeds.json'),'utf8'));
const words=['which','what','where','why'],languages=['en','es','pt'];
const ids={which:'which.use.determiner',what:'what.use.object-question',
 where:'where.use.location-question',why:'why.use.contextual-reason'};
const contracts=Object.fromEntries(words.map(w=>[w,JSON.parse(readFileSync(join(base,'data/learning/skills/'+w+'.json'),'utf8')).passContract]));
const origins={which:'shopping-for-dinner',what:'preparing-dinner',
 where:'shopping-for-dinner',why:'having-dinner'};
const transfers={which:'preparing-dinner',what:'having-dinner',
 where:'preparing-dinner',why:'after-dinner-conversation'};
const makeScope=(learnerId,w,l,origin=origins[w])=>Scope.create({learnerId,skill:ids[w],language:l,originExperienceId:origin});
const packet=(scope,requirement,atExperience=scope.originExperienceId)=>({
 skill:scope.skill,dimension:requirement.dimension,result:requirement.result,
 ...(requirement.support?{support:requirement.support}:{}),
 ...(requirement.mode?{mode:requirement.mode}:{}),
 context:{language:scope.language,assessmentScope:scope,
  experienceId:atExperience,fromExperienceId:atExperience===scope.originExperienceId?null:scope.originExperienceId}
});
const obs=(scope,experienceId,source='learner-observation',status='observed',confirmed=false)=>({
 source,status,context:{skill:scope.skill,language:scope.language,assessmentScope:scope,
  experienceId,confirmed,contractStatus:confirmed?'GREEN_PASS':null}
});
const render=(profile,scope)=>Trail.project(profile,scope.skill,{language:scope.language,originExperienceId:scope.originExperienceId});
test('89Q.1 four QWs × EN ES PT produce 12 independent scoped circuits',()=>{
 let seen=new Set();
 for(const w of words)for(const l of languages){
  const x=makeScope('LAB-A',w,l);assert.ok(Scope.valid(x));
  assert.ok(!seen.has(x.key));seen.add(x.key);
  assert.equal(x.originExperienceId,origins[w]);
  assert.equal(corpus.items.find(e=>e.id===origins[w]).toroidalNext.nextExperience,transfers[w]);
 }
 assert.equal(seen.size,12);
});
test('89Q.1 all S1→S4 visits are navigation; scope origin remains immutable',()=>{
 const order=corpus.items.map(x=>x.id);
 assert.deepEqual(order,['shopping-for-dinner','preparing-dinner','having-dinner','after-dinner-conversation']);
 const original=makeScope('LAB-A','why','pt');
 for(const experience of order){
  assert.equal(original.originExperienceId,'having-dinner');
  assert.equal(original.key,JSON.stringify(['LAB-A',ids.why,'pt','having-dinner']));
  assert.ok(order.includes(experience));
 }
 assert.equal(Object.isFrozen(original),true);
});
test('89Q.2 accepted packets belong to exact learner-language-skill-origin; NICK never is identity',()=>{
 const a=makeScope('OPAQUE-A','what','en');
 const proper=packet(a,contracts.what.requires[0]);
 assert.equal(Scope.ownsPacket(a,proper),true);
 for(const s of [makeScope('OPAQUE-B','what','en'),
 makeScope('OPAQUE-A','what','es'),
 makeScope('OPAQUE-A','which','en'),
 makeScope('OPAQUE-A','what','en','shopping-for-dinner')]){
  assert.equal(Scope.ownsPacket(s,proper),false);
  assert.equal(Scope.same(s,a),false);
 }
 assert.equal('NICK' in a,false);
});
test('89Q.2 wrong session learner, language, origin and occurrence deny binding',()=>{
 const s=makeScope('OPAQUE-A','why','es');
 const event={observed:true,actor:'learner',occurrenceId:'simulated:1',language:'es'};
 const attempt={occurrenceId:'simulated:1',skill:s.skill,language:'es',
 context:{language:'es',assessmentScope:s}};
 const state={experienceLanguage:'es'};
 const input={scope:s,attempt,learnerEvent:event,state,learnerId:'OPAQUE-A'};
 const allowed=Scope.bindAttempt(input);
 assert.ok(allowed);assert.equal(allowed.context.assessmentScope.key,s.key);
 assert.equal(Scope.bindAttempt({...input,learnerId:'OPAQUE-B'}),null);
 assert.equal(Scope.bindAttempt({...input,learnerEvent:{...event,language:'pt'}}),null);
 assert.equal(Scope.bindAttempt({...input,state:{experienceLanguage:'en'}}),null);
 assert.equal(Scope.bindAttempt({...input,attempt:{...attempt,occurrenceId:'mismatch'}}),null);
});
test('89Q.3 changing QW or display language does not erase or reassign other observations',()=>{
 const scopes=words.flatMap(w=>languages.map(l=>makeScope('OPAQUE-A',w,l)));
 const profile={id:'OPAQUE-A',observations:scopes.map((s,i)=>obs(s,origins[words[Math.floor(i/3)]]))};
 assert.equal(profile.observations.length,12);
 for(const s of scopes){
  const own=render(profile,s);
  assert.equal(own.footprints.length,1);
  assert.equal(own.counts.legacyFootprints,0);
  assert.equal(Marker.resolve(own).marker,'PARTIAL_DOT');
 }
 assert.equal(profile.observations.length,12);
});
test('89Q.3 stored S4 WHY transfer observation is not confirmed closure or Green Pass',()=>{
 for(const l of languages){
  const s=makeScope('OPAQUE-A','why',l);
  const profile={id:'OPAQUE-A',observations:[
    obs(s,'having-dinner'),obs(s,'after-dinner-conversation','why-contextual-reason-probe-select','observed',false)]};
  const trail=render(profile,s);assert.equal(trail.footprints.length,2);
  assert.equal(Marker.resolve(trail).marker,'PARTIAL_DOT');
  assert.equal(trail.counts.greenPassClosures,0);
 }
});
test('89Q.3 forged closure is rejected unless all canonical Green closure fields agree',()=>{
 const s=makeScope('OPAQUE-A','which','en');
 for(const alter of [{confirmed:false},{status:'observed'},{source:'exploration'},{contractStatus:'WAITING_FOR_EVIDENCE'}]){
  const canonical={source:'green-pass-contract',status:'transfer-confirmed',
    context:{skill:s.skill,language:s.language,assessmentScope:s,experienceId:transfers.which,
      confirmed:true,contractStatus:'GREEN_PASS'}};
  const item={...canonical,...alter,context:{...canonical.context,...(alter.confirmed===false?{confirmed:false}:{}),
    ...(alter.contractStatus?{contractStatus:alter.contractStatus}:{})}};
  assert.equal(Marker.resolve(render({id:'OPAQUE-A',observations:[item]},s)).marker,'PARTIAL_DOT');
 }
});
test('89Q.4 1/3 2/3 3/3 accepted assessment progresses independently across origins and locales',()=>{
 const s=makeScope('OPAQUE-A','why','en');const req=contracts.why.requires;
 const packets=req.map((v,i)=>packet(s,v,i===2?transfers.why:origins.why));
 for(let i=1;i<=3;i++){
  const p=Progress.project(contracts.why,packets.slice(0,i),Eval);
  assert.equal(p.completed,i);
  assert.equal(p.status,i===3?'GREEN_PASS':'WAITING_FOR_EVIDENCE');
 }
 for(const other of [makeScope('OPAQUE-A','why','es'),makeScope('OPAQUE-B','why','en')])
  assert.ok(packets.every(p=>!Scope.ownsPacket(other,p)));
});
test('89Q.4 canonical closure only confirms scoped footprint; other language and learner remain empty',()=>{
 const en=makeScope('OPAQUE-A','which','en');
 const es=makeScope('OPAQUE-A','which','es');
 const other=makeScope('OPAQUE-B','which','en');
 const closure={source:'green-pass-contract',status:'transfer-confirmed',
  context:{skill:en.skill,language:'en',assessmentScope:en,experienceId:transfers.which,
   confirmed:true,contractStatus:'GREEN_PASS'}};
 const a={id:'OPAQUE-A',observations:[closure]};
 assert.equal(Marker.resolve(render(a,en)).marker,'FILLED_DOT');
 assert.equal(Marker.resolve(render(a,es)).marker,'EMPTY_DOT');
 assert.equal(Marker.resolve(render({id:'OPAQUE-B',observations:[closure]},other)).marker,'EMPTY_DOT');
});
test('89Q.4 source visits cannot mint closure; repeated confirmed Experience does not mint ★',()=>{
 const s=makeScope('OPAQUE-A','which','pt');
 const foot={source:'green-pass-contract',status:'transfer-confirmed',
  context:{skill:s.skill,language:'pt',assessmentScope:s,experienceId:transfers.which,
  confirmed:true,contractStatus:'GREEN_PASS'}};
 const p={id:'OPAQUE-A',observations:[foot,foot]};
 const state=Marker.resolve(render(p,s));
 assert.equal(state.marker,'FILLED_DOT');assert.equal(state.confirmedExperiences,1);
});
