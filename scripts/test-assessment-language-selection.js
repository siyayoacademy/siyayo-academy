const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Scope=require('../js/adaptive-assessment-scope.js');
async function run(){
 let learner=null,state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'},active=null,definition=null,calls=0,clears=0;
 const question={questionWord:'what',assessmentTarget:{skill:'what.use.object-question',definitionPath:'data/learning/skills/what.json'}};
 const root={Promise,Object,AdaptiveAssessmentScope:Scope,
 SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>learner},
 SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>state},
 SIYAYOVerbExplorerExperienceRuntime:{activeQuestionWord:()=> 'what',activeExperienceId:()=>state.currentExperienceId,activeLanguage:()=>state.experienceLanguage},
 SIYAYOVerbExplorerExperienceNavigation:{getExperience:id=>id==='shopping-for-dinner'?{id,toroidalNext:{nextExperience:'preparing-dinner'}}:null},
 SIYAYOVerbExplorerAdaptiveProfileSource:{getProfile:()=>({id:learner})},
 SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>active,clear(){active=null;clears++;}},
 SIYAYOVerbExplorerCanonicalSkillSource:{getDefinition:()=>definition,adopt(d){definition=d;return true;},clear(){}},
 SIYAYOVerbExplorerAdaptiveCoordinatorConfig:{configure(input){active=input;return true;}},
 SIYAYOLeafAssessmentTargetProvider:{select(){
  calls++;if(learner){definition={id:question.assessmentTarget.skill};
   const scope=Scope.create({learnerId:learner,skill:definition.id,language:state.experienceLanguage,originExperienceId:state.currentExperienceId});
   active={session:{decision:{skill:definition.id,experienceId:state.currentExperienceId,assessmentScope:scope},trace:[]},context:{assessmentScope:scope},profile:{id:learner}};}
  return true;
 }},
 SIYAYOVerbExplorerAdaptiveReadinessTrigger:{clear(){}},
 SIYAYOVerbExplorerAdaptiveLiveStart:{clear(){}},
 SIYAYOVerbExplorerCanonicalSkillLoader:{clear(){}},
 SIYAYOLeafAssessmentTargetAuthority:{clear(){}}};
 root.globalThis=root;
 vm.runInNewContext(fs.readFileSync('js/verb-explorer-thinking-mind-assessment-selection.js','utf8'),root);
 const selection=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
 await selection.select(question);
 state={...state,experienceLanguage:'es'};selection.invalidatePending();learner='learner';
 assert.equal(await selection.resumeForIdentity(),false,'LANGUAGE invalidates anonymous target');
 assert.equal(active,null);
 await selection.select(question);const spanish=active.session;
 spanish.trace.push({event:'preserved-spanish-progress'});
 state={...state,experienceLanguage:'en'};await selection.select(question);const english=active.session;
 assert.notEqual(english,spanish);assert.equal(english.decision.assessmentScope.language,'en');
 state={...state,experienceLanguage:'es'};await selection.select(question);
 assert.equal(active.session,spanish,'explicit ES selection restores its own Session');
 assert.equal(active.session.trace.length,1);
 state={...state,currentExperienceId:'preparing-dinner'};
 assert.equal(selection.invalidatePending(),false,'LANGUAGE does not erase identified assessment');
 assert.equal(await selection.select(question),true,'visiting keeps active circuit until explicit adoption');
 assert.equal(active.session,spanish);
 assert.equal(calls,3,'anonymous + ES birth + EN birth; recovery does not create a Session');
 assert.equal(clears,2);
 // Regression: language comparison while visiting S2 restores each existing S1 circuit.
 selection.clear();active=null;definition=null;learner='transfer learner';state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'};
 const sessions={};
 for(const language of ['en','es','pt']){
  state={...state,experienceLanguage:language};await selection.select(question);
  sessions[language]=active.session;sessions[language].trace.push({language,progress:'local evidence preserved'});
 }
 const births=calls;
 const s2Scope=Scope.create({learnerId:learner,skill:definition.id,language:'es',originExperienceId:'preparing-dinner'});
 const separateS2={session:{decision:{skill:definition.id,experienceId:'preparing-dinner',assessmentScope:s2Scope},trace:[]},context:{assessmentScope:s2Scope},profile:{id:learner}};
 assert.equal(selection.remember(separateS2,definition),true);

 state={currentExperienceId:'preparing-dinner',experienceLanguage:'es'};
 assert.equal(await selection.select(question),true);
 assert.equal(active.session,sessions.es);assert.equal(active.session.decision.experienceId,'shopping-for-dinner');
 for(const language of ['en','pt','es','en']){
  state={...state,experienceLanguage:language};
  assert.equal(await selection.select(question),true);
  assert.equal(active.session,sessions[language]);assert.equal(active.session.trace.length,1);
 }
 assert.equal(calls,births,'transfer recovery never invokes Session creation');
 // An unrelated visit cannot recover a different-language origin; current Session is untouched.
 state={currentExperienceId:'having-dinner',experienceLanguage:'es'};
 assert.equal(await selection.select(question),false);assert.equal(active.session,sessions.en);
 state={currentExperienceId:'preparing-dinner',experienceLanguage:'es'};learner='other learner';
 assert.equal(await selection.select(question),false);assert.equal(active.session,sessions.en);
 learner='transfer learner';
 const catalog=root.SIYAYOVerbExplorerExperienceNavigation;delete root.SIYAYOVerbExplorerExperienceNavigation;
 assert.equal(await selection.select(question),false);assert.equal(active.session,sessions.en);
 root.SIYAYOVerbExplorerExperienceNavigation=catalog;
 // No circuit in PT: preserve WAIT rather than inventing an assessment at S2.
 selection.clear();active=null;definition=null;state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'};
 await selection.select(question);const onlyEnglish=active.session,onlyBirths=calls;
 state={currentExperienceId:'preparing-dinner',experienceLanguage:'pt'};
 assert.equal(await selection.select(question),false);assert.equal(active.session,onlyEnglish);assert.equal(calls,onlyBirths);
 // Returning to origin recovers the saved language after a foreign-language transfer visit.
 state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'es'};await selection.select(question);const originSpanish=active.session;
 state={...state,experienceLanguage:'en'};await selection.select(question);
 state={currentExperienceId:'preparing-dinner',experienceLanguage:'es'};await selection.select(question);
 state={...state,currentExperienceId:'shopping-for-dinner'};
 assert.equal(await selection.select(question),true);assert.equal(active.session,originSpanish);
 // Deferred canonical load must not complete into another screen-language target.
 let resolveLoad,composed=0;
 const deferred={Object,Promise,AdaptiveAssessmentScope:Scope,
  SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>state},
  SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>learner},
  SIYAYOLeafAssessmentTargetAuthority:{getTarget:()=>question.assessmentTarget},
  SIYAYOLeafCanonicalSkillBridge:{loadTarget:()=>new Promise(resolve=>{resolveLoad=resolve;})},
  SIYAYOVerbExplorerAdaptiveComposer:{compose(){composed++;return true;}},
  SIYAYOVerbExplorerAdaptiveCoordinator:{snapshot:()=>null}};
 deferred.globalThis=deferred;
 vm.runInNewContext(fs.readFileSync('js/verb-explorer-adaptive-live-start.js','utf8'),deferred);
 state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'};
 const delayed=deferred.SIYAYOVerbExplorerAdaptiveLiveStart.tryCompose();
 state={...state,experienceLanguage:'pt'};resolveLoad(true);
 assert.equal(await delayed,false);assert.equal(composed,0);
 console.log('PASS: pending LANGUAGE invalidation, explicit language birth, retained scope recovery, free visit preservation and EN/ES/PT origin-owned transfer recovery with missing/unrelated/other-learner WAIT.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
