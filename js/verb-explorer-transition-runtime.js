// Live Experience transition runtime.
// It consumes only an already-authorized transition and delegates movement to
// the canonical Verb Explorer goToExperience authority. It does not authorize
// progression, create Sessions, reuse Resume, or mutate pedagogical Decisions.
(function(root){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function execute(authorization){
    if(!authorization||authorization.status!=='transition-authorized')return null;

    var resumeRuntime=root.SIYAYOVerbExplorerResumeRuntime;
    var navigate=root.goToExperience;
    if(!resumeRuntime||typeof resumeRuntime.captureContext!=='function')return null;
    if(typeof navigate!=='function')return null;

    var before=resumeRuntime.captureContext();
    if(!before||typeof before!=='object')return null;

    var fromExperience=text(authorization.fromExperience);
    var toExperience=text(authorization.toExperience);
    var selected=authorization.advanceSelection||{};
    var nextDecision=authorization.nextDecision||{};

    if(!fromExperience||!toExperience||fromExperience===toExperience)return null;
    if(text(before.currentExperienceId)!==fromExperience)return null;
    if(selected.action!=='advance'||selected.status!=='selected')return null;
    if(text(selected.fromExperience)!==fromExperience)return null;
    if(text(selected.experienceId)!==toExperience)return null;
    if(nextDecision.action!=='advance')return null;
    if(text(nextDecision.experienceId)!==toExperience)return null;

    navigate(toExperience);

    var after=resumeRuntime.captureContext();
    if(!after||text(after.currentExperienceId)!==toExperience)return null;

    return Object.freeze({
      status:'TRANSITION_EXECUTED',
      fromExperience:fromExperience,
      toExperience:toExperience,
      state:Object.freeze(Object.assign({},after))
    });
  }

  root.SIYAYOVerbExplorerTransitionRuntime=Object.freeze({execute:execute});
})(typeof globalThis!=='undefined'?globalThis:this);
