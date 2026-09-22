// Authority-neutral readiness signal for re-entering grounded Verb Explorer Session startup.
// It does not decide readiness, invent Identity/Target/Skill/Experience, or poll state;
// it only coalesces concurrent signals and delegates the decision to AdaptiveLiveStart.
(function(root){
'use strict';

var pending=null;

function signal(options){
  options=options||{};
  if(pending)return pending;

  var liveStart=options.liveStart||root.SIYAYOVerbExplorerAdaptiveLiveStart;
  var documentRef=Object.prototype.hasOwnProperty.call(options,'document')?options.document:root.document;

  if(!liveStart||typeof liveStart.tryCompose!=='function')return Promise.resolve(false);

  var attempt;
  try{
    attempt=liveStart.tryCompose({document:documentRef});
  }catch(error){
    return Promise.resolve(false);
  }

  pending=Promise.resolve(attempt).then(function(result){
    pending=null;
    var ready=result===true;
    if(ready){
      var headProbeRuntime=root.SIYAYOVerbExplorerDependencyHeadProbeRuntime;
      if(headProbeRuntime&&typeof headProbeRuntime.render==='function'){
        headProbeRuntime.render();
      }
    }
    return ready;
  },function(){
    pending=null;
    return false;
  });

  return pending;
}

root.SIYAYOVerbExplorerAdaptiveReadinessTrigger=Object.freeze({signal:signal});
})(typeof globalThis!=='undefined'?globalThis:this);
