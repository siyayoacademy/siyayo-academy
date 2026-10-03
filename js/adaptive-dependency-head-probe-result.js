// Pure evaluator for one already-observed Dependency Head Probe selection.
// It compares a grounded learner event against the canonical head definition.
// It does not create learner events, Evidence/Attempt, support claims, score,
// mastery, Green Pass, progression, or browser state.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDependencyHeadProbeResult=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function evaluate(definition,learnerEvent){
    if(!definition||typeof definition!=='object')return null;
    if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;

    var status=text(definition.status);
    var experienceId=text(definition.experienceId);
    var structureId=text(definition.structureId);
    var language=text(definition.language);
    var dimension=text(definition.dimension);
    var targetTokenId=text(definition.targetToken&&definition.targetToken.id);
    var expectedHeadTokenId=text(definition.expectedHeadTokenId);
    var alternatives=Array.isArray(definition.alternatives)?definition.alternatives:null;

    if(
      status!=='DEPENDENCY_HEAD_PROBE_READY'||
      !experienceId||
      !structureId||
      !language||
      dimension!=='head-identification'||
      !targetTokenId||
      !expectedHeadTokenId||
      !alternatives||
      alternatives.length<2
    )return null;

    if(text(learnerEvent.source)!=='dependency-head-probe-select')return null;

    var occurrenceId=text(learnerEvent.occurrenceId);
    var choice=text(learnerEvent.choice);
    var eventExperience=text(learnerEvent.experienceId);
    var eventStructure=text(learnerEvent.structureId);
    var eventLanguage=text(learnerEvent.language);
    var eventDimension=text(learnerEvent.dimension);
    var eventTarget=text(learnerEvent.targetTokenId);

    if(!occurrenceId||!choice)return null;
    if(eventExperience!==experienceId)return null;
    if(eventStructure!==structureId)return null;
    if(eventLanguage!==language)return null;
    if(eventDimension!==dimension)return null;
    if(eventTarget!==targetTokenId)return null;

    var selected=alternatives.find(function(item){
      return item&&text(item.id)===choice;
    });
    if(!selected)return null;

    return Object.freeze({
      occurrenceId:occurrenceId,
      experienceId:experienceId,
      structureId:structureId,
      language:language,
      dimension:dimension,
      targetTokenId:targetTokenId,
      selectedAlternativeId:choice,
      result:choice===expectedHeadTokenId?'pass':'fail'
    });
  }

  return Object.freeze({evaluate:evaluate});
});
