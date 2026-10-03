// Minimal composition seam: grounded P/S/C configure the existing Coordinator;
// A remains event-time and is produced only by the Choice Attempt Provider.
(function(root){
'use strict';

function configure(input,recover){
  input=input||{};
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var attemptProvider=root.SIYAYOVerbExplorerChoiceAttemptProvider;
  var contextSource=root.SIYAYOVerbExplorerAdaptiveContextSource;

  if(!coordinator||typeof coordinator.configure!=='function')return false;
  if(!attemptProvider||typeof attemptProvider.getAttempt!=='function')return false;
  if(!contextSource||typeof contextSource.compose!=='function')return false;
  if(!input.profile||!input.session||typeof input.getState!=='function')return false;

  var initialState=input.getState(null,null);
  if(!initialState)return false;
  var context;
  if(recover){
    // Restore an existing origin-owned circuit; observed location remains live.
    var decision=input.session.decision,scope=decision&&decision.assessmentScope;
    var api=root.AdaptiveAssessmentScope;
    var navigation=root.SIYAYOVerbExplorerExperienceNavigation;
    var origin=navigation&&navigation.getExperience&&decision&&navigation.getExperience(decision.experienceId);
    if(!api||!api.valid(scope)||scope.language!==initialState.experienceLanguage||
       scope.originExperienceId!==decision.experienceId||
       !input.context||!api.same(scope,input.context.assessmentScope))return false;
    if(initialState.currentExperienceId!==decision.experienceId&&
       (!origin||!origin.toroidalNext||origin.toroidalNext.nextExperience!==initialState.currentExperienceId))return false;
    context=contextSource.compose(input.session,{currentExperienceId:decision.experienceId},input.context);
  }else context=contextSource.compose(input.session,initialState,input.context||{});
  if(!context)return false;

  return coordinator.configure({
    profile:input.profile,
    session:input.session,
    context:context,
    getState:input.getState,
    getResumeState:input.getResumeState,
    getAttempt:function(choice,state,target,learnerEvent){
      return attemptProvider.getAttempt(choice,state,target,learnerEvent,input.document);
    }
  });
}

root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig=Object.freeze({configure:configure,restore:function(input){return configure(input,true);}});
})(typeof globalThis!=='undefined'?globalThis:this);
