// Surgical learner-event boundary for Verb Explorer pedagogical choices.
(function(root){
  var choiceOccurrenceSequence=0;
  var contrastProbeOccurrenceSequence=0;
  var determinerUseProbeOccurrenceSequence=0;
  var determinerUseTransferProbeOccurrenceSequence=0;
  var whatObjectQuestionProbeOccurrenceSequence=0;
  var whyContextualReasonProbeOccurrenceSequence=0;
  var whereLocationProbeOccurrenceSequence=0;
  var dependencyHeadProbeOccurrenceSequence=0;
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

  function nextDependencyHeadProbeOccurrenceId(){
    dependencyHeadProbeOccurrenceSequence+=1;
    return 'dependency-head-probe-select:'+dependencyHeadProbeOccurrenceSequence;
  }

  function fromWhatObjectQuestionProbeSelect(choice,state){
    state=state||{};
    if(typeof choice!=='string'||!choice.trim()||
      state.skill!=='what.use.object-question'||
      !['question-function','object-answer'].includes(state.dimension)||
      !['local','transfer'].includes(state.mode)||
      !['en','es','pt'].includes(state.language)||
      !state.currentExperienceId)return null;
    var from=state.fromExperienceId||null;
    if(state.mode==='transfer'&&(!from||from===state.currentExperienceId||state.dimension!=='object-answer'))return null;
    if(state.mode==='local'&&from)return null;
    whatObjectQuestionProbeOccurrenceSequence+=1;
    return Object.freeze({
      observed:true,actor:'learner',intent:'answer',type:'learner-response',
      relevantToWait:true,source:'what-object-question-probe-select',
      occurrenceId:'what-object-question-probe-select:'+whatObjectQuestionProbeOccurrenceSequence,
      skill:'what.use.object-question',dimension:state.dimension,mode:state.mode,
      language:state.language,choice:choice.trim(),
      fromExperienceId:from,experienceId:state.currentExperienceId
    });
  }

  function fromWhyContextualReasonProbeSelect(choice,state){
    state=state||{};
    if(typeof choice!=='string'||!choice.trim()||
      state.skill!=='why.use.contextual-reason'||
      !['question-function','reason-answer'].includes(state.dimension)||
      !['local','transfer'].includes(state.mode)||
      !['en','es','pt'].includes(state.language)||!state.currentExperienceId)return null;
    var from=state.fromExperienceId||null;
    if(state.mode==='transfer'&&(!from||from===state.currentExperienceId||state.dimension!=='reason-answer'))return null;
    if(state.mode==='local'&&from)return null;
    whyContextualReasonProbeOccurrenceSequence+=1;
    return Object.freeze({
      observed:true,actor:'learner',intent:'answer',type:'learner-response',
      relevantToWait:true,source:'why-contextual-reason-probe-select',
      occurrenceId:'why-contextual-reason-probe-select:'+whyContextualReasonProbeOccurrenceSequence,
      skill:'why.use.contextual-reason',dimension:state.dimension,mode:state.mode,
      language:state.language,choice:choice.trim(),
      fromExperienceId:from,experienceId:state.currentExperienceId
    });
  }

  function fromWhereLocationProbeSelect(choice,state){
    state=state||{};
    if(typeof choice!=='string'||!choice.trim()||
      state.skill!=='where.use.location-question'||
      !['spatial-function','location-answer'].includes(state.dimension)||
      !['local','transfer'].includes(state.mode)||
      !['en','es','pt'].includes(state.language)||
      typeof state.currentExperienceId!=='string'||!state.currentExperienceId.trim())return null;
    var from=state.fromExperienceId||null;
    if(state.mode==='transfer'&&(typeof from!=='string'||!from.trim()||
      from===state.currentExperienceId||state.dimension!=='location-answer'))return null;
    if(state.mode==='local'&&from)return null;
    whereLocationProbeOccurrenceSequence+=1;
    return Object.freeze({
      observed:true,actor:'learner',intent:'answer',type:'learner-response',relevantToWait:true,
      source:'where-location-probe-select',
      occurrenceId:'where-location-probe-select:'+whereLocationProbeOccurrenceSequence,
      skill:'where.use.location-question',dimension:state.dimension,mode:state.mode,
      language:state.language,choice:choice.trim(),fromExperienceId:from,
      experienceId:state.currentExperienceId
    });
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
      ...(state.experienceLanguage?{language:state.experienceLanguage}:{}),
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
      ...(state.language?{language:state.language}:{}),
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
      ...(state.language?{language:state.language}:{}),
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

  function fromDependencyHeadProbeSelect(choice, state){
    if(!choice)return null;
    state=state||{};
    if(
      !state.currentExperienceId||
      !state.structureId||
      !state.language||
      state.dimension!=='head-identification'||
      !state.targetTokenId
    )return null;

    return Object.freeze({
      observed:true,
      actor:'learner',
      relevantToWait:true,
      intent:'continue',
      type:'learner-response',
      source:'dependency-head-probe-select',
      occurrenceId:nextDependencyHeadProbeOccurrenceId(),
      choice:String(choice),
      experienceId:String(state.currentExperienceId),
      structureId:String(state.structureId),
      language:String(state.language),
      dimension:'head-identification',
      targetTokenId:String(state.targetTokenId)
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
    fromWhatObjectQuestionProbeSelect:fromWhatObjectQuestionProbeSelect,
    fromWhyContextualReasonProbeSelect:fromWhyContextualReasonProbeSelect,
    fromWhereLocationProbeSelect:fromWhereLocationProbeSelect,
    fromDependencyHeadProbeSelect:fromDependencyHeadProbeSelect,
    fromToroidalNextSelect:fromToroidalNextSelect,
    fromSentenceBuilt:fromSentenceBuilt
  });
})(typeof globalThis!=='undefined'?globalThis:this);
