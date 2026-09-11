// Verb Explorer bootstrap: make the adaptive Cycle available, then load the live choice bridge modules in order.
(function(root){
  const runtime = root.SIYAYOAdaptiveBrowserRuntime;
  if (!runtime || typeof runtime.load !== 'function') return;

  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.onload=resolve;
      s.onerror=function(){reject(new Error('Verb Explorer adaptive choice bridge failed: '+src));};
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
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerAdaptiveCoordinator','js/verb-explorer-adaptive-coordinator.js');})
      .then(function(){return ensureGlobal('SIYAYOVerbExplorerChoiceAdaptiveWire','js/verb-explorer-choice-adaptive-wire.js');})
      .then(function(wire){
        if(wire&&typeof wire.install==='function')wire.install();
        return cycle;
      });
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
