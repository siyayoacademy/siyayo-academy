// Minimal composition seam: grounded P/S/C configure the existing Coordinator;
// A remains event-time and is produced only by the Choice Attempt Provider.
(function(root){
'use strict';

function configure(input){
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
  var context=contextSource.compose(input.session,initialState,input.context||{});
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

root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig=Object.freeze({configure:configure});
})(typeof globalThis!=='undefined'?globalThis:this);
