// Grounded getAttempt seam for Choice: observed resolution + contextual support + real learner event -> Attempt.
// It does not call the resolver, invent support, borrow sentence mode, or submit to the Cycle.
(function(root){
'use strict';

function getAttempt(choice,state,target,learnerEvent,doc){
  var evidenceBridge=root.SIYAYOVerbExplorerChoiceEvidenceBridge;
  var supportSensor=root.SIYAYOChoiceSupportSensor;
  var factory=root.SIYAYOVerbExplorerChoiceAttemptFactory;

  if(!state||!learnerEvent||!evidenceBridge||typeof evidenceBridge.read!=='function')return null;
  if(!supportSensor||typeof supportSensor.support!=='function')return null;
  if(!factory||typeof factory.create!=='function')return null;
  if(String(learnerEvent.choice)!==String(choice))return null;

  var evidence=evidenceBridge.read(state,doc);
  if(!evidence)return null;

  var support=supportSensor.support(state);
  if(typeof support!=='string'||!support)return null;

  return factory.create({
    learnerEvent:learnerEvent,
    state:state,
    evidence:evidence,
    support:Object.freeze({value:support,context:evidence.context})
  });
}

root.SIYAYOVerbExplorerChoiceAttemptProvider=Object.freeze({getAttempt:getAttempt});
})(typeof globalThis!=='undefined'?globalThis:this);
