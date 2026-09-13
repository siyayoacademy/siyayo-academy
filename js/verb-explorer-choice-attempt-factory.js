// Event-aware Choice Attempt factory. It receives the real learner footprint
// and delegates ownership/assembly without changing Controller or Cycle.
(function(root){
'use strict';
function create(input){
 input=input||{};
 var ownership=input.ownership||root.SIYAYOChoiceAttemptOwnership;
 var boundary=input.boundary||root.SIYAYOChoiceAttemptBoundary;
 if(!ownership||typeof ownership.contextFromChoice!=='function'||!boundary||typeof boundary.assemble!=='function')return null;
 var owner=ownership.contextFromChoice(input.learnerEvent,input.state);
 if(!owner)return null;
 return boundary.assemble({
  owner:owner,
  evidence:input.evidence,
  support:input.support,
  context:owner.context,
  ownership:ownership
 });
}
root.SIYAYOVerbExplorerChoiceAttemptFactory=Object.freeze({create:create});
})(typeof globalThis!=='undefined'?globalThis:this);
