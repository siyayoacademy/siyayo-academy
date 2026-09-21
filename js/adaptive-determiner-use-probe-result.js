// Pure evaluator for one already-observed determiner-use learner selection.
// It compares a grounded learner event against a canonical local probe specification.
// It does not create learner events, Evidence/Attempt, support claims, transfer mode,
// mutate Session state, grant Green Pass, or authorize navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseProbeResult=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function evaluate(specification,learnerEvent){
    if(!specification||typeof specification!=='object')return null;
    if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;

    var skill=text(specification.skill);
    var experienceId=text(specification.experienceId);
    var dimension=text(specification.dimension);
    var targetForm=text(specification.targetForm);
    var targetNoun=text(specification.targetNoun);
    var expectedAlternativeId=text(specification.expectedAlternativeId);
    var alternatives=Array.isArray(specification.alternatives)?specification.alternatives:null;

    if(
      skill!=='which.use.determiner'||
      !experienceId||
      dimension!=='determiner-use'||
      targetForm!=='which'||
      !targetNoun||
      !expectedAlternativeId||
      !alternatives||
      alternatives.length<2
    )return null;

    if(text(learnerEvent.source)!=='determiner-use-probe-select')return null;

    var occurrenceId=text(learnerEvent.occurrenceId);
    var choice=text(learnerEvent.choice);
    var eventExperience=text(learnerEvent.experienceId);
    var eventDimension=text(learnerEvent.dimension);
    var eventTargetForm=text(learnerEvent.targetForm);
    var eventTargetNoun=text(learnerEvent.targetNoun);

    if(!occurrenceId||!choice)return null;
    if(eventExperience!==experienceId)return null;
    if(eventDimension!==dimension)return null;
    if(eventTargetForm!==targetForm)return null;
    if(eventTargetNoun!==targetNoun)return null;

    var selected=alternatives.find(function(item){
      return item&&text(item.id)===choice;
    });
    if(!selected)return null;

    return Object.freeze({
      occurrenceId:occurrenceId,
      experienceId:experienceId,
      skill:skill,
      dimension:dimension,
      targetForm:targetForm,
      targetNoun:targetNoun,
      selectedAlternativeId:choice,
      result:choice===expectedAlternativeId?'pass':'fail'
    });
  }

  return Object.freeze({evaluate:evaluate});
});
