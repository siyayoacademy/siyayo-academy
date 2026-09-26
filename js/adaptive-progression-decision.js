// Explicit progression decision boundary.
// Grounded convergence plus explicit learner NEXT intent may prepare an advance
// selection and next Decision. It does not release the active Session or mutate it.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveProgressionDecision=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function freezeTitle(value){
    if(!value||typeof value!=='object')return null;
    return Object.freeze({
      en:value.en||null,
      es:value.es||null,
      pt:value.pt||null
    });
  }

  function resolve(input){
    input=input||{};
    var convergence=input.convergence;
    var learnerEvent=input.learnerEvent;

    if(!convergence||convergence.status!=='CANDIDATE_SUPPORTED_FOR_CONSIDERATION')return null;
    if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;
    if(learnerEvent.relevantToProgression!==true)return null;
    if(text(learnerEvent.intent)!=='advance')return null;
    if(text(learnerEvent.source)!=='toroidal-next-select')return null;

    var open=convergence.openConditions||{};
    if(open.contractEvidencePending||open.waitActive||open.resumeActive)return null;

    var candidate=convergence.candidate;
    if(!candidate||typeof candidate!=='object')return null;

    var fromExperienceId=text(convergence.experienceId);
    var skill=text(convergence.skill);
    var candidateFrom=text(candidate.fromExperience);
    var toExperienceId=text(candidate.experienceId);

    if(!fromExperienceId||!toExperienceId||fromExperienceId===toExperienceId)return null;
    if(candidateFrom!==fromExperienceId)return null;
    if(text(learnerEvent.fromExperienceId)!==fromExperienceId)return null;
    if(text(learnerEvent.toExperienceId)!==toExperienceId)return null;

    var occurrenceId=text(learnerEvent.occurrenceId);
    if(!occurrenceId)return null;

    var title=freezeTitle(candidate.title);

    var advanceSelection=Object.freeze({
      action:'advance',
      status:'selected',
      experienceId:toExperienceId,
      fromExperience:fromExperienceId,
      entryVerb:candidate.entryVerb||null,
      title:title
    });

    var nextDecision=Object.freeze({
      action:'advance',
      experienceId:toExperienceId,
      skill:skill||null,
      focus:'assessment'
    });

    return Object.freeze({
      status:'PROGRESSION_DECISION_READY',
      reason:'grounded-convergence-and-learner-advance-intent',
      occurrenceId:occurrenceId,
      fromExperienceId:fromExperienceId,
      toExperienceId:toExperienceId,
      advanceSelection:advanceSelection,
      nextDecision:nextDecision
    });
  }

  return Object.freeze({resolve:resolve});
});
