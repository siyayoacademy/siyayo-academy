const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const Scope=require('../js/adaptive-assessment-scope.js');
const Profile=require('../js/green-pass-profile.js');
const Trail=require('../js/adaptive-learner-trail-view.js');
const Evidence=require('../js/adaptive-evidence-profile.js');
const Closure=require('../js/adaptive-contract-closure-evidence-source.js');
const skill=require('../data/learning/skills/what.json');
const seeds=require('../data/learning/experience-seeds.json').items;
const runtime={Object,Array,Set,AdaptiveAssessmentScope:Scope,AdaptivePedagogicalOrchestrator:{},
 GreenPassProfile:Profile,AdaptiveAdvanceSelector:{select(){throw Error('No automatic navigation');}},
 GreenPassAuthorityPolicy:require('../data/learning/green-pass-authority.json'),
 AdaptiveLearningRouter:{route:()=>({action:'continue-assessment',focus:'assessment'})},
 AdaptiveWaitClassifier:{classifyWait:()=>null}};
runtime.globalThis=runtime;
for(const file of ['adaptive-attempt-loop','adaptive-learning-cycle'])
 vm.runInNewContext(fs.readFileSync('js/'+file+'.js','utf8'),runtime);
let history=Evidence.createProfile('learner');
const scopes=[];
for(const language of ['en','es','pt']){
 const scope=Scope.create({learnerId:'learner',skill:skill.id,language,originExperienceId:seeds[0].id});
 scopes.push(scope);
 const session={decision:{skill:skill.id,experienceId:seeds[0].id,language,assessmentScope:scope},trace:[]};
 let profile=Profile.createProfile('learner');
 let context={skill:skill.id,currentExperience:seeds[0].id,language,assessmentScope:scope,
  passContract:skill.passContract,evidencePackets:[]};
 for(const [index,requirement] of skill.passContract.requires.entries()){
  const event={observed:true,actor:'learner',language,occurrenceId:language+'-'+index};
  const raw={skill:skill.id,support:'none',...requirement,correct:true,confidence:1,occurrenceId:event.occurrenceId,
   context:{language,experienceId:index===2?seeds[1].id:seeds[0].id}};
  const attempt=Scope.bindAttempt({scope,attempt:raw,learnerEvent:event,
   state:{experienceLanguage:language},learnerId:'learner'});
  assert.ok(attempt);
  for(const invalid of [
   {...attempt,context:{...attempt.context,language:language==='en'?'es':'en'}},
   {...attempt,context:{...attempt.context,assessmentScope:{...scope,key:'forged'}}},
   {...attempt,skill:'another-skill'}]){
    const before=session.trace.length;
    assert.throws(()=>runtime.AdaptiveLearningCycle.submit(profile,session,invalid,context));
    assert.equal(session.trace.length,before,'reject before trace or Green mutation');
  }
  assert.equal(Scope.bindAttempt({scope,attempt:raw,learnerEvent:event,
   state:{experienceLanguage:language},learnerId:'another-learner'}),null);
  assert.equal(Scope.bindAttempt({scope,attempt:raw,learnerEvent:{...event,language:'xx'},
   state:{experienceLanguage:language},learnerId:'learner'}),null);
  const cycle=runtime.AdaptiveLearningCycle.submit(profile,session,attempt,context);
  assert.equal(cycle.contractEligible,index===2);
  assert.equal(cycle.advanceSelection,null);
  profile=cycle.greenProfile;context=cycle.nextContext;
  if(index===2){
   history=Closure.record(Evidence,history,{cycleResult:cycle,session,context});
   const duplicate=Closure.record(Evidence,history,{cycleResult:cycle,session,context});
   assert.equal(duplicate,history);
  }
 }
 assert.equal(Trail.project(history,skill.id,{language}).state,'GREEN_PASS_CONFIRMED');
 for(const other of ['en','es','pt'].filter(l=>l!==language&&!scopes.some(s=>s.language===l)))
  assert.equal(Trail.project(history,skill.id,{language:other}).state,'UNOBSERVED');
}
assert.equal(new Set(scopes.map(s=>s.key)).size,3);
assert.notEqual(Scope.create({...scopes[0],originExperienceId:seeds[1].id}).key,scopes[0].key);
assert.notEqual(Scope.create({...scopes[0],learnerId:'another'}).key,scopes[0].key);
assert.equal(history.observations.length,3);
const legacy=Evidence.record(Evidence.createProfile('legacy'),{
 source:'green-pass-contract',status:'transfer-confirmed',repeated:[],
 requiresReview:false,conflict:false,requiresReinforcement:false},
 {skill:skill.id,language:'en',confirmed:true,experienceId:seeds[0].id,contractStatus:'GREEN_PASS'});
assert.equal(Trail.project(legacy,skill.id,{language:'en'}).state,'UNOBSERVED');
assert.equal(Trail.project(legacy,skill.id,{language:'en'}).counts.legacyFootprints,1);
assert.equal(legacy.observations.length,1,'legacy record preserved');
console.log('PASS: EN/ES/PT ownership, three independent closures, foreign evidence rejection, legacy preservation.');

// Real WHICH provenance cable, rather than inferred screen-language labels.
vm.runInNewContext(fs.readFileSync('js/verb-explorer-learner-event.js','utf8'),runtime);
const which=require('../data/learning/skills/which.json');
const nouns=require('../data/lexicon/nouns/nouns.json');
for(const language of ['en','es','pt']){
 const scope=Scope.create({learnerId:'learner',skill:which.id,language,originExperienceId:seeds[0].id});
 const local=require('../js/adaptive-determiner-use-probe-specification-source.js').resolve(which,seeds[0],language,nouns);
 const transfer=require('../js/adaptive-determiner-use-transfer-probe-specification-source.js').resolve(which,local,seeds[1],nouns,language);
 for(const [spec,isTransfer] of [[local,false],[transfer,true]]){
  const prefix='adaptive-determiner-use-'+(isTransfer?'transfer-':'')+'probe-';
  const event=runtime.SIYAYOVerbExplorerLearnerEvent[isTransfer?'fromDeterminerUseTransferProbeSelect':'fromDeterminerUseProbeSelect'](spec.expectedAlternativeId,{
   language,currentExperienceId:spec.experienceId,fromExperienceId:spec.fromExperienceId,
   dimension:spec.dimension,mode:spec.mode,targetForm:spec.targetForm,targetNoun:spec.targetNoun});
  const result=require('../js/'+prefix+'result.js');
  assert.equal(result.evaluate(spec,{...event,language:undefined}),null);
  assert.equal(result.evaluate(spec,{...event,language:language==='en'?'es':'en'}),null);
  const evaluated=result.evaluate(spec,event);
  const evidence=require('../js/'+prefix+'evidence-bridge.js').fromResult({
   result:evaluated,learnerEvent:event,supportSensor:{support:()=> 'none'}});
  const raw=require('../js/'+prefix+'attempt-boundary.js').assemble({learnerEvent:event,evidence});
  assert.equal(raw.context.language,language);
  assert.ok(Scope.bindAttempt({scope,attempt:raw,learnerEvent:event,state:{experienceLanguage:language},learnerId:'learner'}));
 }
}
console.log('PASS: actual WHICH EN/ES/PT Result/Evidence/Attempt provenance.');
