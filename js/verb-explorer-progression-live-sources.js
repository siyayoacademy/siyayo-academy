// Read-only sources for a grounded NEXT progression observation.
(function(root){
'use strict';
function snapshot(){
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  return coordinator&&typeof coordinator.snapshot==='function'?coordinator.snapshot():null;
}
function activeSession(){
  var current=snapshot();
  return current&&current.session||null;
}
function convergence(){
  var current=snapshot();
  var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  if(!current||!current.session||!current.session.decision||!current.lastConvergenceResult)return null;
  if(!stateBridge||typeof stateBridge.getState!=='function')return null;
  var state=stateBridge.getState(),decision=current.session.decision;
  var result=current.lastConvergenceResult;
  if(!state||state.currentExperienceId!==decision.experienceId)return null;
  if(result.experienceId!==decision.experienceId||result.skill!==decision.skill)return null;
  return result;
}
root.SIYAYOVerbExplorerActiveSessionSource=activeSession;
root.SIYAYOVerbExplorerProgressionConvergenceSource=convergence;
})(typeof globalThis!=='undefined'?globalThis:this);
