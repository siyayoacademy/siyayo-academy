// Verb Explorer adaptive input provider. Owns no pedagogical decisions; it snapshots already-grounded runtime inputs.
(function(root){
  var current=null;

  function configure(input){
    if(!input||!input.profile||!input.session||!input.attempt||!input.context)return false;
    current=input;
    return true;
  }

  function clear(){current=null;}

  function provide(choice,target){
    if(!current)return null;
    var state=typeof current.getState==='function'?current.getState(choice,target):current.state;
    if(!state)return null;
    var attempt=typeof current.getAttempt==='function'?current.getAttempt(choice,state,target):current.attempt;
    if(!attempt)return null;
    var context=typeof current.getContext==='function'?current.getContext(choice,state,target):current.context;
    if(!context)return null;
    var resumeState=typeof current.getResumeState==='function'?current.getResumeState(state,target):state;
    if(!resumeState)return null;
    return {
      profile:current.profile,
      session:current.session,
      attempt:attempt,
      context:context,
      state:state,
      resumeState:resumeState
    };
  }

  root.SIYAYOVerbExplorerAdaptiveInputProvider=provide;
  root.SIYAYOVerbExplorerAdaptiveInputProvider.configure=configure;
  root.SIYAYOVerbExplorerAdaptiveInputProvider.clear=clear;
})(typeof globalThis!=='undefined'?globalThis:this);
