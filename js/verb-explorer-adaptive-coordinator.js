// Live Verb Explorer adaptive coordinator. Owns evolving Cycle state; invents no pedagogical decisions.
(function(root){
  var current=null;

  function configure(input){
    input=input||{};
    if(!input.profile||!input.session||!input.context)return false;
    current={
      profile:input.profile,
      session:input.session,
      context:input.context,
      getState:input.getState,
      getAttempt:input.getAttempt,
      getResumeState:input.getResumeState
    };
    return true;
  }

  function clear(){current=null;}

  function submitChoice(choice,target){
    if(!current)return null;
    var controller=root.SIYAYOVerbExplorerAdaptiveController;
    if(!controller||typeof controller.submitChoice!=='function')return null;
    var state=typeof current.getState==='function'?current.getState(choice,target):null;
    if(!state)return null;
    var attempt=typeof current.getAttempt==='function'?current.getAttempt(choice,state,target):null;
    if(!attempt)return null;
    var resumeState=typeof current.getResumeState==='function'?current.getResumeState(state,target):state;
    if(!resumeState)return null;

    var result=controller.submitChoice({
      choice:choice,
      profile:current.profile,
      session:current.session,
      attempt:attempt,
      context:current.context,
      state:state,
      resumeState:resumeState
    });
    if(!result)return null;

    if(result.greenProfile)current.profile=result.greenProfile;
    if(result.nextContext)current.context=result.nextContext;

    var dispatch=root.SIYAYOVerbExplorerCycleResumeDispatch;
    var dispatchResult=dispatch&&typeof dispatch.run==='function'?dispatch.run(result):null;
    return {cycleResult:result,dispatchResult:dispatchResult};
  }

  function snapshot(){
    return current?{profile:current.profile,session:current.session,context:current.context}:null;
  }

  root.SIYAYOVerbExplorerAdaptiveCoordinator=Object.freeze({
    configure:configure,
    clear:clear,
    submitChoice:submitChoice,
    snapshot:snapshot
  });
})(typeof globalThis!=='undefined'?globalThis:this);
