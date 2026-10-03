// Authority-neutral readiness signal for re-entering grounded Verb Explorer Session startup.
// It does not decide readiness, invent Identity/Target/Skill/Experience, or poll state;
// it only coalesces concurrent signals and delegates the decision to AdaptiveLiveStart.
(function(root){
'use strict';

var pending=null,generation=0;
function clear(){generation+=1;pending=null;}

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

  var version=generation;
  pending=Promise.resolve(attempt).then(function(result){
    if(version!==generation)return false;
    pending=null;
    var ready=result===true;
    if(ready){
      var headProbeRuntime=root.SIYAYOVerbExplorerDependencyHeadProbeRuntime;
      if(headProbeRuntime&&typeof headProbeRuntime.render==='function'){
        headProbeRuntime.render();
      }

      var determiner=root.SIYAYOVerbExplorerDeterminerUseAssessmentLive;
      var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
      var bridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
      var state=bridge&&bridge.getState&&bridge.getState();
      var experience=state&&catalog&&catalog.getExperience&&catalog.getExperience(state.currentExperienceId);
      if(determiner&&typeof determiner.mount==='function'&&experience){
        determiner.mount({document:documentRef,experience:experience,language:state.experienceLanguage});
      }

      var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
      if(runtime&&typeof runtime.render==='function')runtime.render();
      var trailSurface=root.SIYAYOVerbExplorerLearnerTrailSurface;
      if(trailSurface&&typeof trailSurface.refresh==='function'){
        trailSurface.refresh({document:documentRef});
      }
    }
    return ready;
  },function(){
    if(version===generation)pending=null;
    return false;
  });

  return pending;
}

root.SIYAYOVerbExplorerAdaptiveReadinessTrigger=Object.freeze({signal:signal,clear:clear});
})(typeof globalThis!=='undefined'?globalThis:this);
