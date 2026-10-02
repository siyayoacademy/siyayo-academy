const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const Scope=require('../js/adaptive-assessment-scope.js');
async function run(){
 let learner=null,state={currentExperienceId:'shopping-for-dinner',experienceLanguage:'en'},active=null,definition=null,calls=0,clears=0;
 const question={questionWord:'what',assessmentTarget:{skill:'what.use.object-question',definitionPath:'data/learning/skills/what.json'}};
 const root={Promise,Object,AdaptiveAssessmentScope:Scope,
 SIYAYOVerbExplorerLearnerIdentitySource:{getId:()=>learner},
 SIYAYOVerbExplorerAdaptiveStateBridge:{getState:()=>state},
 SIYAYOVerbExplorerExperienceRuntime:{activeQuestionWord:()=> 'what',activeExperienceId:()=>state.currentExperienceId,activeLanguage:()=>state.experienceLanguage},
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
 console.log('PASS: pending LANGUAGE invalidation, explicit language birth, retained scope recovery, free visit preservation.');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
