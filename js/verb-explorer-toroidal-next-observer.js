// Parallel observer for learner-owned Toroidal NEXT.
// It may prepare an adaptive progression decision when all pedagogical authorities
// already converge. It never owns, delays, cancels, or redirects navigation.
(function(root){
'use strict';
function observe(learnerEvent){
  var progression=root.AdaptiveProgressionDecision;
  var convergenceSource=root.SIYAYOVerbExplorerProgressionConvergenceSource;
  if(!progression||typeof progression.resolve!=='function')return null;
  if(typeof convergenceSource!=='function')return null;
  var convergence=null;
  try{convergence=convergenceSource();}catch(_error){return null;}
  if(!convergence)return null;
  var decision=progression.resolve({convergence:convergence,learnerEvent:learnerEvent});
  if(!decision)return null;
  var sink=root.SIYAYOVerbExplorerProgressionDecisionSink;
  if(typeof sink==='function'){
    try{sink(decision);}catch(_error){}
  }
  return decision;
}
root.SIYAYOVerbExplorerToroidalNextObserver=observe;
})(typeof globalThis!=='undefined'?globalThis:this);
