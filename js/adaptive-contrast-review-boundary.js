// Fail-closed correlation boundary for a contrast-review Decision, one identified
// longitudinal pattern, and one already-observed learner event.
// It does not create learner events, evaluate correctness, mutate Profile/Session,
// grant Green Pass, or authorize navigation/transition.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOAdaptiveContrastReviewBoundary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function normalize(value){
    return String(value||'').trim();
  }

  function open(decision,candidate){
    if(!decision||decision.action!=='continue-assessment'||decision.focus!=='contrast-review')return null;
    if(!candidate||!Array.isArray(candidate.repeated)||candidate.repeated.length!==1)return null;

    var repeated=candidate.repeated[0]||{};
    var key=normalize(repeated.key);
    var occurrences=Number(repeated.occurrences||0);
    if(!key||!Number.isFinite(occurrences)||occurrences<2)return null;

    return Object.freeze({
      pattern:Object.freeze({key:key,occurrences:occurrences}),
      experienceId:normalize(decision.experienceId)||null
    });
  }

  function correlate(probeContext,learnerEvent){
    if(!probeContext||!probeContext.pattern||!normalize(probeContext.pattern.key))return null;
    if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;
    if(!normalize(learnerEvent.occurrenceId))return null;

    var experienceId=normalize(probeContext.experienceId);
    var eventExperienceId=normalize(learnerEvent.experienceId||learnerEvent.currentExperienceId);
    if(experienceId&&eventExperienceId&&experienceId!==eventExperienceId)return null;
    if(experienceId&&!eventExperienceId)return null;

    return Object.freeze({
      pattern:probeContext.pattern,
      learnerEvent:learnerEvent
    });
  }

  return Object.freeze({open:open,correlate:correlate});
});
