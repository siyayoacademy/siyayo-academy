// Live learner-owned NEXT boundary for Verb Explorer.
// Consumes only the convergence already produced by the adaptive Choice Cycle.
// It never authorizes progression itself and never calls goToExperience directly.
(function(root){
  'use strict';

  var installed=false;

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function install(options){
    options=options||{};
    if(installed)return false;

    var doc=options.document||root.document;
    if(!doc||typeof doc.getElementById!=='function')return false;

    var nextElement=doc.getElementById('nextExperience');
    if(!nextElement)return false;

    nextElement.onclick=function(event){
      var target=event&&event.currentTarget?event.currentTarget:nextElement;
      var toExperienceId=text(target&&target.dataset?target.dataset.nextExperience:null);
      if(!toExperienceId)return null;

      var coordinator=options.coordinator||root.SIYAYOVerbExplorerAdaptiveCoordinator;
      var events=options.events||root.SIYAYOVerbExplorerLearnerEvent;
      var progressionAuthority=options.progressionDecision||root.AdaptiveProgressionDecision;
      var activation=options.nextSessionActivation||root.SIYAYOVerbExplorerNextSessionActivation;

      if(!coordinator||typeof coordinator.snapshot!=='function'||typeof coordinator.releaseProgression!=='function')return null;
      if(!events||typeof events.fromToroidalNextSelect!=='function')return null;
      if(!progressionAuthority||typeof progressionAuthority.resolve!=='function')return null;
      if(!activation||typeof activation.activate!=='function')return null;

      var snapshot=coordinator.snapshot();
      if(!snapshot||!snapshot.session||!snapshot.context)return null;

      var convergence=snapshot.lastConvergenceResult;
      if(!convergence||convergence.status!=='CANDIDATE_SUPPORTED_FOR_CONSIDERATION')return null;

      var fromExperienceId=snapshot.session&&snapshot.session.decision
        ? text(snapshot.session.decision.experienceId)
        : '';
      if(!fromExperienceId)return null;

      var learnerEvent=events.fromToroidalNextSelect(toExperienceId,{
        currentExperienceId:fromExperienceId
      });
      if(!learnerEvent)return null;

      var progression=progressionAuthority.resolve({
        convergence:convergence,
        learnerEvent:learnerEvent
      });
      if(!progression||progression.status!=='PROGRESSION_DECISION_READY')return null;

      var authorization=coordinator.releaseProgression(progression);
      if(!authorization||authorization.status!=='transition-authorized')return null;

      var activationResult=activation.activate({
        transitionAuthorization:authorization,
        previousSession:snapshot.session,
        passContract:snapshot.context.passContract,
        language:snapshot.context.language,
        chapter:snapshot.context.chapter,
        document:doc
      });
      if(!activationResult||activationResult.status!=='S2_ACTIVE')return null;

      return Object.freeze({
        learnerEvent:learnerEvent,
        progressionDecision:progression,
        transitionAuthorization:authorization,
        activation:activationResult
      });
    };

    installed=true;
    return true;
  }

  root.SIYAYOVerbExplorerLiveNextWire=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
