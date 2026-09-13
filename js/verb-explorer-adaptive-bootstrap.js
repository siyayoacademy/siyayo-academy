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
        return cycle;
      });
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
