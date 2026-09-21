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

  function releaseTransition(advanceSelection,nextDecision){
    if(!current||!current.session)return false;
    var boundary=root.AdaptiveSessionTransitionBoundary;
    if(!boundary||typeof boundary.authorize!=='function')return false;
    var authorization=boundary.authorize({
      currentSession:current.session,
      advanceSelection:advanceSelection,
      nextDecision:nextDecision
    });
    if(!authorization||authorization.status!=='transition-authorized')return false;
    current=null;
    return authorization;
  }

  function releaseProgression(progressionDecision){
    if(!current||!current.session)return false;
    if(!progressionDecision||progressionDecision.status!=='PROGRESSION_DECISION_READY')return false;
    return releaseTransition(
      progressionDecision.advanceSelection,
      progressionDecision.nextDecision
    );
  }

  function resolveConvergence(session,sourceContext,result){
    var selector=root.AdaptiveAdvanceSelector;
    var grounding=root.AdaptiveProgressionEligibility;
    var pedagogicalState=root.AdaptivePedagogicalCompletion;
    var convergence=root.AdaptiveConvergenceResolver;
    if(!selector||typeof selector.resolveCandidate!=='function'||
       !grounding||typeof grounding.evaluateCandidateGrounding!=='function'||
       !pedagogicalState||typeof pedagogicalState.evaluatePedagogicalState!=='function'||
       !convergence||typeof convergence.resolve!=='function')return null;

    var candidate=selector.resolveCandidate(Object.assign({},sourceContext||{}, {
      currentExperience:session&&session.decision?session.decision.experienceId:null
    }));
    var candidateGrounding=grounding.evaluateCandidateGrounding({session:session,candidate:candidate});
    var observedState=pedagogicalState.evaluatePedagogicalState({
      session:session,
      contractResult:result.contractEvaluation,
      pedagogicalDisposition:result.routeInspection||result.recommendation||null,
      waitState:result.waitClassification,
      resumeState:result.resumeEvaluation
    });
    return convergence.resolve({candidateGrounding:candidateGrounding,pedagogicalState:observedState});
  }

  function submitChoice(choice,target,observedLearnerEvent){
    if(!current)return null;
    var controller=root.SIYAYOVerbExplorerAdaptiveController;
    var events=root.SIYAYOVerbExplorerLearnerEvent;
    if(!controller||typeof controller.submitChoice!=='function'||!events||typeof events.fromChoiceSelect!=='function')return null;
    var state=typeof current.getState==='function'?current.getState(choice,target):null;
    if(!state)return null;
    var learnerEvent=observedLearnerEvent||events.fromChoiceSelect(choice,state);
    if(!learnerEvent)return null;
    if(learnerEvent.source!=='choice-select'||!learnerEvent.occurrenceId)return null;
    if(String(learnerEvent.choice)!==String(choice))return null;
    var attempt=typeof current.getAttempt==='function'?current.getAttempt(choice,state,target,learnerEvent):null;
    if(!attempt)return null;
    var resumeState=typeof current.getResumeState==='function'?current.getResumeState(state,target):state;
    if(!resumeState)return null;
    var sourceContext=current.context;

    var result=controller.submitChoice({
      choice:choice,
      profile:current.profile,
      session:current.session,
      attempt:attempt,
      context:sourceContext,
      state:state,
      learnerEvent:learnerEvent,
      resumeState:resumeState
    });
    if(!result)return null;

    var convergenceResult=resolveConvergence(current.session,sourceContext,result);

    if(result.greenProfile)current.profile=result.greenProfile;
    if(result.nextContext)current.context=result.nextContext;

    var dispatch=root.SIYAYOVerbExplorerCycleResumeDispatch;
    var dispatchResult=dispatch&&typeof dispatch.run==='function'?dispatch.run(result):null;
    return {cycleResult:result,convergenceResult:convergenceResult,dispatchResult:dispatchResult};
  }

  function snapshot(){
    return current?{profile:current.profile,session:current.session,context:current.context}:null;
  }

  root.SIYAYOVerbExplorerAdaptiveCoordinator=Object.freeze({
    configure:configure,
    clear:clear,
    releaseTransition:releaseTransition,
    releaseProgression:releaseProgression,
    submitChoice:submitChoice,
    snapshot:snapshot
  });
})(typeof globalThis!=='undefined'?globalThis:this);
