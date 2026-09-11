// Surgical controller: submit a grounded Verb Explorer learner event to the adaptive Cycle.
(function(root){
  function submitChoice(input){
    input=input||{};
    var events=root.SIYAYOVerbExplorerLearnerEvent;
    var cycle=input.cycle||root.AdaptiveLearningCycle;
    if(!events||typeof events.fromChoiceSelect!=='function'||!cycle||typeof cycle.submit!=='function')return null;

    var learnerEvent=events.fromChoiceSelect(input.choice,input.state);
    if(!learnerEvent)return null;

    var context=Object.assign({},input.context||{}, {
      learnerEvent:learnerEvent,
      resumeState:input.resumeState||input.state||null
    });

    return cycle.submit(input.profile,input.session,input.attempt,context);
  }

  root.SIYAYOVerbExplorerAdaptiveController=Object.freeze({submitChoice:submitChoice});
})(typeof globalThis!=='undefined'?globalThis:this);
