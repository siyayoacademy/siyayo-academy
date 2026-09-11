// Verb Explorer bootstrap: make the adaptive Cycle available without wiring learner events yet.
(function(root){
  const runtime = root.SIYAYOAdaptiveBrowserRuntime;
  if (!runtime || typeof runtime.load !== 'function') return;

  root.SIYAYOVerbExplorerAdaptiveReady = runtime.load().then(function(cycle){
    return cycle && typeof cycle.submit === 'function' ? cycle : null;
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
