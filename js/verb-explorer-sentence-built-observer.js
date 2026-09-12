// Read-only observer for the real Verb Explorer BUILD SENTENCE boundary.
// It records a grounded learner observation only; it does not submit Cycle, NEXT, resume, or Green Pass.
(function(root){
  var installed=false;

  function install(options){
    options=options||{};
    if(installed||typeof document==='undefined')return false;
    installed=true;

    document.addEventListener('click',function(event){
      var target=event.target&&typeof event.target.closest==='function'
        ? event.target.closest('#buildSentence')
        : null;
      if(!target)return;

      // Observe only after the existing Verb Explorer handler has completed its state transition.
      Promise.resolve().then(function(){
        var events=options.events||root.SIYAYOVerbExplorerLearnerEvent;
        var bridge=options.stateBridge||root.SIYAYOVerbExplorerAdaptiveStateBridge;
        if(!events||typeof events.fromSentenceBuilt!=='function'||!bridge||typeof bridge.capture!=='function')return;

        var state=bridge.capture();
        if(!state||state.experienceWordType!=='sentence')return;

        var observation=events.fromSentenceBuilt({
          canonicalCandidate:true,
          systemStructure:true
        },state);
        if(!observation)return;

        if(typeof options.onObserved==='function')options.onObserved(observation,target);
      });
    });
    return true;
  }

  root.SIYAYOVerbExplorerSentenceBuiltObserver=Object.freeze({install:install});
})(typeof globalThis!=='undefined'?globalThis:this);
