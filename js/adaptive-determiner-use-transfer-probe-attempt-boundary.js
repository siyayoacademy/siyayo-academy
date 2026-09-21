// Fail-closed ownership boundary for one determiner-use transfer Attempt.
// One observed cross-Experience learner occurrence may own only explicit transfer
// Evidence grounded in the same origin/destination/target/selection.
// It does not mutate Session state, grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseTransferProbeAttemptBoundary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function assemble(input){
    input=input||{};
    var event=input.learnerEvent;
    var evidence=input.evidence;

    if(!event||!evidence)return null;
    if(event.observed!==true||event.actor!=='learner')return null;
    if(text(event.source)!=='determiner-use-transfer-probe-select')return null;
    if(text(event.mode)!=='transfer'||text(evidence.mode)!=='transfer')return null;

    var occurrenceId=text(event.occurrenceId);
    var evidenceOccurrence=text(evidence.context&&evidence.context.occurrenceId);
    if(!occurrenceId||occurrenceId!==evidenceOccurrence)return null;

    if(text(evidence.skill)!=='which.use.determiner')return null;
    if(text(event.dimension)!=='determiner-use'||text(evidence.dimension)!=='determiner-use')return null;

    var fromExperienceId=text(event.fromExperienceId);
    var evidenceFrom=text(evidence.context&&evidence.context.fromExperienceId);
    var experienceId=text(event.experienceId);
    var evidenceExperience=text(evidence.context&&evidence.context.experienceId);

    if(!fromExperienceId||fromExperienceId!==evidenceFrom)return null;
    if(!experienceId||experienceId!==evidenceExperience)return null;
    if(fromExperienceId===experienceId)return null;

    var targetForm=text(event.targetForm);
    var evidenceTargetForm=text(evidence.context&&evidence.context.targetForm);
    if(targetForm!=='which'||targetForm!==evidenceTargetForm)return null;

    var targetNoun=text(event.targetNoun);
    var evidenceTargetNoun=text(evidence.context&&evidence.context.targetNoun);
    if(!targetNoun||targetNoun!==evidenceTargetNoun)return null;

    var choice=text(event.choice);
    var selected=text(evidence.context&&evidence.context.selectedAlternativeId);
    if(!choice||choice!==selected)return null;

    var result=text(evidence.result);
    if(result!=='pass'&&result!=='fail')return null;

    var support=text(evidence.support);
    if(!support)return null;

    var context=Object.freeze({
      occurrenceId:occurrenceId,
      fromExperienceId:fromExperienceId,
      experienceId:experienceId,
      targetForm:'which',
      targetNoun:targetNoun,
      selectedAlternativeId:selected
    });

    return Object.freeze({
      occurrenceId:occurrenceId,
      skill:'which.use.determiner',
      dimension:'determiner-use',
      result:result,
      mode:'transfer',
      support:support,
      context:context
    });
  }

  return Object.freeze({assemble:assemble});
});
