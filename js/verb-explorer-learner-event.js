// Surgical learner-event boundary for Verb Explorer pedagogical choices.
(function(root){
  function fromChoiceSelect(choice, state){
    if(!choice) return null;
    state=state||{};
    return Object.freeze({
      observed:true,
      actor:'learner',
      relevantToWait:true,
      intent:'continue',
      type:'learner-response',
      source:'choice-select',
      choice:String(choice),
      experienceId:state.currentExperienceId||null,
      question:state.experienceQuestion==null?null:state.experienceQuestion,
      perspective:state.experiencePerspective||null,
      wordType:state.experienceWordType||null
    });
  }
  root.SIYAYOVerbExplorerLearnerEvent=Object.freeze({fromChoiceSelect:fromChoiceSelect});
})(typeof globalThis!=='undefined'?globalThis:this);
