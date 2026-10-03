(function(root){
  function run(result){
    var d=root.AdaptiveResumeRuntimeDispatch;
    var r=root.SIYAYOVerbExplorerResumeRuntime;
    if(!d||!r||typeof d.dispatch!=='function')return null;
    return d.dispatch(result,r);
  }

  function loadScript(src){
    return new Promise(function(resolve,reject){
      var s=document.createElement('script');
      s.src=src;
      s.onload=resolve;
      s.onerror=function(){reject(new Error('Verb Explorer adaptive bootstrap failed: '+src));};
      document.head.appendChild(s);
    });
  }

  function bootstrap(){
    if(typeof document==='undefined')return Promise.resolve(null);
    var runtimeReady=root.SIYAYOAdaptiveBrowserRuntime
      ? Promise.resolve()
      : loadScript('js/adaptive-browser-runtime.js');
    return runtimeReady.then(function(){
      return root.SIYAYOVerbExplorerAdaptiveReady
        ? root.SIYAYOVerbExplorerAdaptiveReady
        : loadScript('js/verb-explorer-adaptive-bootstrap.js').then(function(){return root.SIYAYOVerbExplorerAdaptiveReady||null;});
    });
  }

  root.SIYAYOVerbExplorerCycleResumeDispatch=Object.freeze({run:run,bootstrap:bootstrap});
  if(typeof document!=='undefined')bootstrap();
})(typeof globalThis!=='undefined'?globalThis:this);
