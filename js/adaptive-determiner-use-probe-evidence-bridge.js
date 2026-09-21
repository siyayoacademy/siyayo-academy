// Read-only bridge from a grounded determiner-use ProbeResult plus
// occurrence-scoped support observation to local determiner-use Evidence.
// It does not create LearnerEvent/Attempt, invent transfer mode,
// mutate Session state, grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseProbeEvidenceBridge=api;
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

    if(text(result.experienceId)!==text(learnerEvent.experienceId))return null;
    if(text(result.dimension)!=='determiner-use'||text(learnerEvent.dimension)!=='determiner-use')return null;
    if(text(result.targetForm)!=='which'||text(learnerEvent.targetForm)!=='which')return null;
    if(text(result.targetNoun)!==text(learnerEvent.targetNoun))return null;
    if(text(result.selectedAlternativeId)!==text(learnerEvent.choice))return null;
    if(text(result.skill)!=='which.use.determiner')return null;

    var outcome=text(result.result);
    if(outcome!=='pass'&&outcome!=='fail')return null;

    var support=text(supportSensor.support(learnerEvent));
    if(!support)return null;

    return Object.freeze({
      skill:'which.use.determiner',
      dimension:'determiner-use',
      result:outcome,
      support:support,
      context:Object.freeze({
        occurrenceId:occurrenceId,
        experienceId:text(result.experienceId),
        targetForm:'which',
        targetNoun:text(result.targetNoun),
        selectedAlternativeId:text(result.selectedAlternativeId)
      })
    });
  }

  return Object.freeze({fromResult:fromResult});
});
