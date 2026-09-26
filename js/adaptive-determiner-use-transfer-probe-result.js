// Pure evaluator for one already-observed cross-Experience determiner-use selection.
// It compares a grounded transfer learner event against canonical transfer authority.
// It does not create learner events, support claims, Evidence/Attempt, mutate Session,
// grant Green Pass, or authorize navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseTransferProbeResult=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function evaluate(specification,learnerEvent){
    if(!specification||typeof specification!=='object')return null;
    if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;

    var skill=text(specification.skill);
    var fromExperienceId=text(specification.fromExperienceId);
    var experienceId=text(specification.experienceId);
    var dimension=text(specification.dimension);
    var mode=text(specification.mode);
    var targetForm=text(specification.targetForm);
    var targetNoun=text(specification.targetNoun);
    var expectedAlternativeId=text(specification.expectedAlternativeId);
    var alternatives=Array.isArray(specification.alternatives)?specification.alternatives:null;

    if(
      skill!=='which.use.determiner'||
      !fromExperienceId||
      !experienceId||
      fromExperienceId===experienceId||
      dimension!=='determiner-use'||
      mode!=='transfer'||
      targetForm!=='which'||
      !targetNoun||
      !expectedAlternativeId||
      !alternatives||
      alternatives.length<2
    )return null;

    if(text(learnerEvent.source)!=='determiner-use-transfer-probe-select')return null;
    if(text(learnerEvent.mode)!=='transfer')return null;

    var occurrenceId=text(learnerEvent.occurrenceId);
    var choice=text(learnerEvent.choice);
    if(!occurrenceId||!choice)return null;

    if(text(learnerEvent.fromExperienceId)!==fromExperienceId)return null;
    if(text(learnerEvent.experienceId)!==experienceId)return null;
    if(text(learnerEvent.dimension)!==dimension)return null;
    if(text(learnerEvent.targetForm)!==targetForm)return null;
    if(text(learnerEvent.targetNoun)!==targetNoun)return null;

    var selected=alternatives.find(function(item){
      return item&&text(item.id)===choice;
    });
    if(!selected)return null;

    return Object.freeze({
      occurrenceId:occurrenceId,
      fromExperienceId:fromExperienceId,
      experienceId:experienceId,
      skill:skill,
      dimension:dimension,
      mode:'transfer',
      targetForm:targetForm,
      targetNoun:targetNoun,
      selectedAlternativeId:choice,
      result:choice===expectedAlternativeId?'pass':'fail'
    });
  }

  return Object.freeze({evaluate:evaluate});
});
