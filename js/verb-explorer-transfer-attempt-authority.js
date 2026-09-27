// Explicit cross-Experience assessment boundary. A learner may visit freely;
// only a transfer probe for the current Session's canonical next Experience can
// submit an Attempt back to that Session. No Session adoption or navigation here.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOVerbExplorerTransferAttemptAuthority=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function id(value){return typeof value==='string'?value.trim():'';}
  function accepts(input){
    input=input||{};
    var decision=input.session&&input.session.decision;
    var attempt=input.attempt;
    var event=input.learnerEvent;
    var state=input.state;
    var items=input.context&&input.context.experiences;
    if(!decision||id(decision.skill)!=='which.use.determiner'||!Array.isArray(items))return false;
    if(!attempt||!event||!state||event.observed!==true||event.actor!=='learner')return false;
    if(id(event.source)!=='determiner-use-transfer-probe-select'||id(event.mode)!=='transfer'||id(attempt.mode)!=='transfer')return false;
    var from=id(decision.experienceId),to=id(state.currentExperienceId);
    if(!from||!to||from===to)return false;
    var origin=items.find(function(item){return item&&id(item.id)===from;});
    var destination=items.find(function(item){return item&&id(item.id)===to;});
    if(!origin||!destination||id(origin.toroidalNext&&origin.toroidalNext.nextExperience)!==to)return false;
    if(id(event.fromExperienceId)!==from||id(attempt.context&&attempt.context.fromExperienceId)!==from)return false;
    if(id(event.experienceId)!==to||id(attempt.context&&attempt.context.experienceId)!==to)return false;
    if(id(attempt.skill)!==id(decision.skill)||id(attempt.dimension)!=='determiner-use')return false;
    if(id(event.dimension)!=='determiner-use'||id(event.targetForm)!=='which'||id(attempt.context&&attempt.context.targetForm)!=='which')return false;
    if(!id(event.occurrenceId)||id(event.occurrenceId)!==id(attempt.occurrenceId)||id(event.occurrenceId)!==id(attempt.context&&attempt.context.occurrenceId))return false;
    if(!id(event.targetNoun)||id(event.targetNoun)!==id(attempt.context&&attempt.context.targetNoun))return false;
    if(!id(event.choice)||id(event.choice)!==id(attempt.context&&attempt.context.selectedAlternativeId))return false;
    return true;
  }
  return Object.freeze({accepts:accepts});
});
