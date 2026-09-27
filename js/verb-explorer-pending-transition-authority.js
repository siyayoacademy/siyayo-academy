// Remembers an authorized transition after learner-owned navigation.
// This record cannot activate a Session or navigate to an Experience.
(function(root){
'use strict';
var pending=null;
function text(value){return typeof value==='string'&&value.trim()?value.trim():null;}
function remember(authorization,occurrenceId){
  var occurrence=text(occurrenceId);
  if(!authorization||authorization.status!=='transition-authorized'||!occurrence)return null;
  var from=text(authorization.fromExperience),to=text(authorization.toExperience);
  if(!from||!to||from===to)return null;
  var selected=authorization.advanceSelection||{},next=authorization.nextDecision||{};
  if(selected.action!=='advance'||selected.status!=='selected'||text(selected.fromExperience)!==from||text(selected.experienceId)!==to)return null;
  if(next.action!=='advance'||text(next.experienceId)!==to)return null;
  pending=Object.freeze({status:'S2_ACTIVATION_PENDING',occurrenceId:occurrence,fromExperience:from,toExperience:to,authorization:authorization,activationAuthorized:false});
  return pending;
}
function get(){return pending;}
function clear(occurrenceId){
  if(occurrenceId!==undefined&&(!pending||text(occurrenceId)!==pending.occurrenceId))return false;
  pending=null;return true;
}
root.SIYAYOVerbExplorerPendingTransitionAuthority=Object.freeze({remember:remember,get:get,clear:clear});
})(typeof globalThis!=='undefined'?globalThis:this);
