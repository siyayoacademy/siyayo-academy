// Read-only bridge from the live Verb Explorer lexical state into the adaptive layer.
// It deliberately does not create profile, session, attempt, or pedagogical context.
(function(root){
  function capture(){
    var runtime=root.SIYAYOVerbExplorerResumeRuntime;
    if(!runtime||typeof runtime.captureContext!=='function')return null;
    var state=runtime.captureContext();
    if(!state||typeof state!=='object'||typeof state.currentExperienceId!=='string'||!state.currentExperienceId)return null;
    return Object.freeze(Object.assign({},state));
  }

  function getState(){
    return capture();
  }

  function getResumeState(){
    return capture();
  }

  root.SIYAYOVerbExplorerAdaptiveStateBridge=Object.freeze({
    capture:capture,
    getState:getState,
    getResumeState:getResumeState
  });
})(typeof globalThis!=='undefined'?globalThis:this);
