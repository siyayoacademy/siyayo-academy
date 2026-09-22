// Verb Explorer bootstrap: make the adaptive Cycle available, then load the live observation/choice bridge modules in order.
(function(root){
  const runtime = root.SIYAYOAdaptiveBrowserRuntime;
  if (!runtime || typeof runtime.load !== 'function') return;

  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.onload=resolve;
      s.onerror=function(){reject(new Error('Verb Explorer adaptive bridge failed: '+src));};
      document.head.appendChild(s);
    });
  }

  function ensureGlobal(name,src){
    return root[name] ? Promise.resolve(root[name]) : loadScript(src).then(function(){return root[name]||null;});
  }

  root.SIYAYOVerbExplorerAdaptiveReady = runtime.load().then(function(cycle){
    if(!cycle||typeof cycle.submit!=='function')return null;
    if(typeof document==='undefined')return cycle;
    return ensureGlobal('SIYAYOVerbExplorerLearnerEvent','js/verb-explorer-learner-event.js')
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveController','js/verb-explorer-adaptive-controller.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveInputProvider','js/verb-explorer-adaptive-input-provider.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveStateBridge','js/verb-explorer-adaptive-state-bridge.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerChoiceResolutionReader','js/verb-explorer-choice-resolution-reader.js');})
      .then(function(){return ensureGlobal('AdaptiveProgressionEligibility','js/adaptive-progression-eligibility.js');})
      .then(function(){return ensureGlobal('AdaptivePedagogicalCompletion','js/adaptive-pedagogical-completion.js');})
      .then(function(){return ensureGlobal('AdaptiveConvergenceResolver','js/adaptive-convergence-resolver.js');})
      .then(function(){return ensureGlobal('AdaptiveContractClosureEvidenceSource','js/adaptive-contract-closure-evidence-source.js');})
      .then(function(){return ensureGlobal('AdaptiveLearnerTrailView','js/adaptive-learner-trail-view.js');})
      .then(function(){return ensureGlobal('AdaptiveProgressionDecision','js/adaptive-progression-decision.js');})
      .then(function(){return ensureGlobal('AdaptiveSessionTransitionBoundary','js/adaptive-session-transition-boundary.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveCoordinator','js/verb-explorer-adaptive-coordinator.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerChoiceAdaptiveWire','js/verb-explorer-choice-adaptive-wire.js');})
      .then(function(wire){
        if(wire&&typeof wire.install==='function')wire.install();
        return ensureGlobal('SIYAYOChoiceSupportSensor','js/choice-support-sensor.js');
      })
      .then(function(sensorApi){
        if(sensorApi&&typeof sensorApi.create==='function')root.SIYAYOChoiceSupportSensor=sensorApi.create();
        return ensureGlobal('SIYAYOVerbExplorerChoiceSupportObserver','js/verb-explorer-choice-support-observer.js');
      })
      .then(function(supportObserver){
        if(supportObserver&&typeof supportObserver.install==='function')supportObserver.install();
        return ensureGlobal('SIYAYOChoiceModeSensor','js/choice-mode-sensor.js');
      })
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerChoiceModeBridge','js/verb-explorer-choice-mode-bridge.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerSentenceBuiltObserver','js/verb-explorer-sentence-built-observer.js');})
      .then(function(observer){
        if(observer&&typeof observer.install==='function'){
          observer.install({
            onObserved:function(observation){
              var bridge=root.SIYAYOVerbExplorerChoiceModeBridge;
              if(!bridge||typeof bridge.fromObservation!=='function')return null;
              return bridge.fromObservation(observation);
            }
          });
        }
      })
      // Grounded Session startup authorities. Loading them does not create Identity,
      // choose a Leaf Target, infer Skill from Experience, or force a Session.
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerLearnerIdentitySource','js/verb-explorer-learner-identity-source.js');})
      .then(function(){return ensureGlobal('SIYAYOLeafAssessmentTargetAuthority','js/leaf-assessment-target-authority.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerCanonicalSkillSource','js/verb-explorer-canonical-skill-source.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerCanonicalSkillLoader','js/verb-explorer-canonical-skill-loader.js');})
      .then(function(){return ensureGlobal('SIYAYOLeafCanonicalSkillBridge','js/leaf-canonical-skill-bridge.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveProfileSource','js/verb-explorer-adaptive-profile-source.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveEvidenceProfileSource','js/verb-explorer-adaptive-evidence-profile-source.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveSessionSource','js/verb-explorer-adaptive-session-source.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerNextSessionSource','js/verb-explorer-next-session-source.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerSessionStateBoundary','js/verb-explorer-session-state-boundary.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveContextSource','js/verb-explorer-adaptive-context-source.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerChoiceAttemptProvider','js/verb-explorer-choice-attempt-provider.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveCoordinatorConfig','js/verb-explorer-adaptive-coordinator-config.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerTransitionRuntime','js/verb-explorer-transition-runtime.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerNextSessionActivation','js/verb-explorer-next-session-activation.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerLiveNextWire','js/verb-explorer-live-next-wire.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveComposer','js/verb-explorer-adaptive-composer.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveLiveStart','js/verb-explorer-adaptive-live-start.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveReadinessTrigger','js/verb-explorer-adaptive-readiness-trigger.js');})
      .then(function(){return ensureGlobal('SIYAYOLeafAssessmentTargetReadiness','js/leaf-assessment-target-readiness.js');})
      .then(function(){
        var liveStart=root.SIYAYOVerbExplorerAdaptiveLiveStart;
        if(!liveStart||typeof liveStart.tryCompose!=='function')return cycle;
        return Promise.resolve(liveStart.tryCompose({document:document})).then(function(){
          var nextWire=root.SIYAYOVerbExplorerLiveNextWire;
          if(nextWire&&typeof nextWire.install==='function')nextWire.install({document:document});
          return cycle;
        });
      });
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
