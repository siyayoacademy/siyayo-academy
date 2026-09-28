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
    var catalog=input.catalog;
    if(!decision||!catalog||typeof catalog.getExperience!=='function')return false;
    if(!attempt||!event||!state||event.observed!==true||event.actor!=='learner')return false;
    var skill=id(decision.skill);
    if(skill!=='which.use.determiner'&&skill!=='what.use.object-question')return false;
    if(id(event.mode)!=='transfer'||id(attempt.mode)!=='transfer')return false;
    if(skill==='which.use.determiner'&&id(event.source)!=='determiner-use-transfer-probe-select')return false;
    if(skill==='what.use.object-question'&&(
      id(event.source)!=='what-object-question-probe-select'||
      id(event.intent)!=='answer'||
      id(event.dimension)!=='object-answer'||
      id(attempt.dimension)!=='object-answer'||
      !['en','es','pt'].includes(id(event.language))||
      id(event.language)!==id(attempt.context&&attempt.context.language)
    ))return false;
    var from=id(decision.experienceId),to=id(state.currentExperienceId);
    if(!from||!to||from===to)return false;
    var origin=catalog.getExperience(from);
    var destination=catalog.getExperience(to);
    if(!origin||!destination||id(origin.toroidalNext&&origin.toroidalNext.nextExperience)!==to)return false;
    if(skill==='what.use.object-question'){
      var originWhat=(origin.thinkingMind||[]).filter(function(entry){
        return entry&&entry.questionWord==='what'&&entry.assessmentTarget&&
          entry.assessmentTarget.skill===skill&&
          entry.assessmentTarget.definitionPath==='data/learning/skills/what.json';
      });
      var targetWhat=(destination.thinkingMind||[]).filter(function(entry){
        return entry&&entry.questionWord==='what'&&entry.answerGrounding&&
          Array.isArray(entry.answerGrounding.acceptedVocabularyIds)&&
          entry.answerGrounding.acceptedVocabularyIds.includes(id(event.choice));
      });
      if(originWhat.length!==1||targetWhat.length!==1)return false;
    }
    if(id(event.fromExperienceId)!==from||id(attempt.context&&attempt.context.fromExperienceId)!==from)return false;
    if(id(event.experienceId)!==to||id(attempt.context&&attempt.context.experienceId)!==to)return false;
    if(id(attempt.skill)!==skill)return false;
    if(skill==='which.use.determiner'&&(
      id(attempt.dimension)!=='determiner-use'||id(event.dimension)!=='determiner-use'||
      id(event.targetForm)!=='which'||id(attempt.context&&attempt.context.targetForm)!=='which'
    ))return false;
    if(!id(event.occurrenceId)||id(event.occurrenceId)!==id(attempt.occurrenceId)||id(event.occurrenceId)!==id(attempt.context&&attempt.context.occurrenceId))return false;
    if(skill==='which.use.determiner'&&(
      !id(event.targetNoun)||id(event.targetNoun)!==id(attempt.context&&attempt.context.targetNoun)
    ))return false;
    if(!id(event.choice)||id(event.choice)!==id(attempt.context&&attempt.context.selectedAlternativeId))return false;
    return true;
  }
  return Object.freeze({accepts:accepts});
});
