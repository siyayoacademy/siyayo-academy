// Surgical learner-event boundary for Verb Explorer pedagogical choices.
(function(root){
  var choiceOccurrenceSequence=0;

  function nextChoiceOccurrenceId(){
    choiceOccurrenceSequence+=1;
    return 'choice-select:'+choiceOccurrenceSequence;
  }

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
      occurrenceId:nextChoiceOccurrenceId(),
      choice:String(choice),
      experienceId:state.currentExperienceId||null,
      question:state.experienceQuestion==null?null:state.experienceQuestion,
      perspective:state.experiencePerspective||null,
      wordType:state.experienceWordType||null
    });
  }

  function fromSentenceBuilt(composition, state){
    composition=composition||{};
    state=state||{};
    if(composition.canonicalCandidate!==true||composition.systemStructure!==true) return null;
    if(!state.currentExperienceId||!state.experienceLanguage||state.experienceQuestion==null||!state.experienceChoiceCandidate) return null;
    return Object.freeze({
      observed:true,
      actor:'learner',
      type:'sentence-built',
      source:'build-sentence',
      canonicalCandidate:true,
      systemStructure:true,
      currentExperienceId:String(state.currentExperienceId),
      experienceLanguage:String(state.experienceLanguage),
      experienceQuestion:state.experienceQuestion,
      experienceChoiceCandidate:String(state.experienceChoiceCandidate)
    });
  }

  root.SIYAYOVerbExplorerLearnerEvent=Object.freeze({
    fromChoiceSelect:fromChoiceSelect,
    fromSentenceBuilt:fromSentenceBuilt
  });
})(typeof globalThis!=='undefined'?globalThis:this);
