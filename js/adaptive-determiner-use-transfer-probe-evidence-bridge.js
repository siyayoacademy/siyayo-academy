// Read-only bridge from a grounded determiner-use transfer ProbeResult plus
// occurrence-scoped transfer support to explicit transfer Evidence.
// It does not create LearnerEvent/Attempt, mutate Session state,
// grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseTransferProbeEvidenceBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function fromResult(input){
    input=input||{};
    var result=input.result;
    var learnerEvent=input.learnerEvent;
    var supportSensor=input.supportSensor;

    if(!result||!learnerEvent)return null;
    if(!supportSensor||typeof supportSensor.support!=='function')return null;

    var occurrenceId=text(result.occurrenceId);
    var eventOccurrenceId=text(learnerEvent.occurrenceId);
    if(!occurrenceId||occurrenceId!==eventOccurrenceId)return null;

    if(text(result.skill)!=='which.use.determiner')return null;
    if(text(result.dimension)!=='determiner-use'||text(learnerEvent.dimension)!=='determiner-use')return null;
    if(text(result.mode)!=='transfer'||text(learnerEvent.mode)!=='transfer')return null;

    var fromExperienceId=text(result.fromExperienceId);
    var eventFromExperienceId=text(learnerEvent.fromExperienceId);
    var experienceId=text(result.experienceId);
    var eventExperienceId=text(learnerEvent.experienceId);

    if(!fromExperienceId||fromExperienceId!==eventFromExperienceId)return null;
    if(!experienceId||experienceId!==eventExperienceId)return null;
    if(fromExperienceId===experienceId)return null;

    if(text(result.targetForm)!=='which'||text(learnerEvent.targetForm)!=='which')return null;
    if(text(result.targetNoun)!==text(learnerEvent.targetNoun))return null;
    if(text(result.selectedAlternativeId)!==text(learnerEvent.choice))return null;

    var outcome=text(result.result);
    if(outcome!=='pass'&&outcome!=='fail')return null;

    var support=text(supportSensor.support(learnerEvent));
    if(!support)return null;

    return Object.freeze({
      skill:'which.use.determiner',
      dimension:'determiner-use',
      result:outcome,
      mode:'transfer',
      support:support,
      context:Object.freeze({
        occurrenceId:occurrenceId,
        fromExperienceId:fromExperienceId,
        experienceId:experienceId,
        targetForm:'which',
        targetNoun:text(result.targetNoun),
        selectedAlternativeId:text(result.selectedAlternativeId)
      })
    });
  }

  return Object.freeze({fromResult:fromResult});
});
