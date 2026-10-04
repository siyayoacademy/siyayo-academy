// In-memory presentation memory for TORO Experience navigation.
// It remembers only UI/presentation state. It never stores or mutates Session,
// Evidence, Green Pass, learner identity, or assessment authority.
(function(root){
'use strict';
var states=Object.create(null);
function id(value){return typeof value==='string'&&value.trim()?value.trim():null;}
function clone(value){
  if(!value||typeof value!=='object')return null;
  return {
    questionWord:id(value.questionWord),
    perspective:id(value.perspective),
    choiceCandidate:id(value.choiceCandidate),
    wordType:id(value.wordType),
    nounId:id(value.nounId),
    adjectiveId:id(value.adjectiveId),
    lineOffset:Number.isInteger(value.lineOffset)&&value.lineOffset>=0?value.lineOffset:0,
    tense:id(value.tense),
    form:id(value.form)
  };
}
function remember(experienceId,state){
  var key=id(experienceId),snapshot=clone(state);
  if(!key||!snapshot)return false;
  states[key]=Object.freeze(snapshot);
  return true;
}
function recall(experienceId){
  var key=id(experienceId),snapshot=key&&states[key];
  return snapshot?Object.freeze(clone(snapshot)):null;
}
function forget(experienceId){
  var key=id(experienceId);
  if(!key||!states[key])return false;
  delete states[key];return true;
}
function clear(){states=Object.create(null);return true;}
root.SIYAYOVerbExplorerExperiencePresentationMemory=Object.freeze({
  remember:remember,recall:recall,forget:forget,clear:clear
});
})(typeof globalThis!=='undefined'?globalThis:this);
