// Surgical learner-event boundary for Verb Explorer pedagogical choices.
(function(root){
  var choiceOccurrenceSequence=0;
  var contrastProbeOccurrenceSequence=0;
  var determinerUseProbeOccurrenceSequence=0;
  var determinerUseTransferProbeOccurrenceSequence=0;
  var toroidalNextOccurrenceSequence=0;

  function nextChoiceOccurrenceId(){
    choiceOccurrenceSequence+=1;
    return 'choice-select:'+choiceOccurrenceSequence;
  }

  function nextContrastProbeOccurrenceId(){
    contrastProbeOccurrenceSequence+=1;
    return 'contrast-probe-select:'+contrastProbeOccurrenceSequence;
  }

  function nextDeterminerUseProbeOccurrenceId(){
    determinerUseProbeOccurrenceSequence+=1;
    return 'determiner-use-probe-select:'+determinerUseProbeOccurrenceSequence;
  }

  function nextDeterminerUseTransferProbeOccurrenceId(){
    determinerUseTransferProbeOccurrenceSequence+=1;
    return 'determiner-use-transfer-probe-select:'+determinerUseTransferProbeOccurrenceSequence;
  }

  function nextToroidalNextOccurrenceId(){
    toroidalNextOccurrenceSequence+=1;
    return 'toroidal-next-select:'+toroidalNextOccurrenceSequence;
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

  function fromContrastProbeSelect(choice, state){
    if(!choice) return null;
    state=state||{};
    return Object.freeze({
      observed:true,
      actor:'learner',
      relevantToWait:true,
      intent:'continue',
      type:'learner-response',
      source:'contrast-probe-select',
      occurrenceId:nextContrastProbeOccurrenceId(),
      choice:String(choice),
      experienceId:state.currentExperienceId||state.experienceId||null
    });
  }

  function fromDeterminerUseProbeSelect(choice, state){
    if(!choice) return null;
    state=state||{};
    if(
      !state.currentExperienceId||
      state.dimension!=='determiner-use'||
      state.targetForm!=='which'||
      !state.targetNoun
    ) return null;

    return Object.freeze({
      observed:true,
      actor:'learner',
      relevantToWait:true,
      intent:'continue',
      type:'learner-response',
      source:'determiner-use-probe-select',
      occurrenceId:nextDeterminerUseProbeOccurrenceId(),
      choice:String(choice),
      experienceId:String(state.currentExperienceId),
      dimension:'determiner-use',
      targetForm:'which',
      targetNoun:String(state.targetNoun)
    });
  }

  function fromDeterminerUseTransferProbeSelect(choice, state){
    if(!choice) return null;
    state=state||{};
    if(
      !state.fromExperienceId||
      !state.currentExperienceId||
      state.fromExperienceId===state.currentExperienceId||
      state.dimension!=='determiner-use'||
      state.mode!=='transfer'||
      state.targetForm!=='which'||
      !state.targetNoun
    ) return null;

    return Object.freeze({
      observed:true,
      actor:'learner',
      relevantToWait:true,
      intent:'continue',
      type:'learner-response',
      source:'determiner-use-transfer-probe-select',
      occurrenceId:nextDeterminerUseTransferProbeOccurrenceId(),
      choice:String(choice),
      fromExperienceId:String(state.fromExperienceId),
      experienceId:String(state.currentExperienceId),
      dimension:'determiner-use',
      mode:'transfer',
      targetForm:'which',
      targetNoun:String(state.targetNoun)
    });
  }

  function fromToroidalNextSelect(toExperienceId, state){
    state=state||{};
    var fromExperienceId=state.currentExperienceId||state.experienceId||null;
    if(!fromExperienceId||!toExperienceId)return null;
    fromExperienceId=String(fromExperienceId).trim();
    toExperienceId=String(toExperienceId).trim();
    if(!fromExperienceId||!toExperienceId||fromExperienceId===toExperienceId)return null;
    return Object.freeze({
      observed:true,
      actor:'learner',
      relevantToWait:false,
      relevantToProgression:true,
      intent:'advance',
      type:'learner-progression',
      source:'toroidal-next-select',
      occurrenceId:nextToroidalNextOccurrenceId(),
      fromExperienceId:fromExperienceId,
      toExperienceId:toExperienceId
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
    fromContrastProbeSelect:fromContrastProbeSelect,
    fromDeterminerUseProbeSelect:fromDeterminerUseProbeSelect,
    fromDeterminerUseTransferProbeSelect:fromDeterminerUseTransferProbeSelect,
    fromToroidalNextSelect:fromToroidalNextSelect,
    fromSentenceBuilt:fromSentenceBuilt
  });
})(typeof globalThis!=='undefined'?globalThis:this);
