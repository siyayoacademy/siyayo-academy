// Receives a progression decision observed in parallel with learner-owned NEXT.
// It may authorize an S1 -> S2 pedagogical transition, but never navigates,
// creates S2, or gates the learner's already-independent movement.
(function(root){
'use strict';
function receive(decision){
  if(!decision||decision.status!=='PROGRESSION_DECISION_READY')return null;
  var boundary=root.AdaptiveSessionTransitionBoundary;
  var sessionSource=root.SIYAYOVerbExplorerActiveSessionSource;
  if(!boundary||typeof boundary.authorize!=='function')return null;
  if(typeof sessionSource!=='function')return null;
  var currentSession=null;
  try{currentSession=sessionSource();}catch(_error){return null;}
  if(!currentSession)return null;
  var authorization=boundary.authorize({
    currentSession:currentSession,
    advanceSelection:decision.advanceSelection,
    nextDecision:decision.nextDecision
  });
  if(!authorization)return null;
  var pending=root.SIYAYOVerbExplorerPendingTransitionAuthority;
  if(pending&&typeof pending.remember==='function'){
    try{pending.remember(authorization,decision.occurrenceId);}catch(_error){}
  }
  var trailSink=root.SIYAYOVerbExplorerTransitionTrailSink;
  if(typeof trailSink==='function'){
    try{trailSink(Object.freeze({
      type:'pedagogical-transition-authorized',
      occurrenceId:decision.occurrenceId||null,
      fromExperienceId:authorization.fromExperience,
      toExperienceId:authorization.toExperience,
      skill:authorization.nextDecision&&authorization.nextDecision.skill||null
    }));}catch(_error){}
  }
  return authorization;
}
root.SIYAYOVerbExplorerProgressionDecisionSink=receive;
})(typeof globalThis!=='undefined'?globalThis:this);
