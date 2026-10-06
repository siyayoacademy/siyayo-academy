// Explicit cross-Experience assessment boundary. A learner may visit freely;
// only a transfer probe for the current Session's canonical next Experience can
// submit an Attempt back to that Session. No Session adoption or navigation here.
(function(root,factory){
  var api=factory(typeof module==='object'&&module.exports
    ?require('./adaptive-assessment-scope.js'):root.AdaptiveAssessmentScope);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOVerbExplorerTransferAttemptAuthority=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(AssessmentScope){
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
    if(skill!=='which.use.determiner'&&skill!=='what.use.object-question'&&skill!=='why.use.contextual-reason'&&skill!=='where.use.location-question')return false;
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
    if(skill==='why.use.contextual-reason'&&(
      id(event.source)!=='why-contextual-reason-probe-select'||id(event.intent)!=='answer'||
      id(event.dimension)!=='reason-answer'||id(attempt.dimension)!=='reason-answer'||
      !['en','es','pt'].includes(id(event.language))||
      id(event.language)!==id(attempt.context&&attempt.context.language)
    ))return false;
    var scope=decision.assessmentScope;
    if(skill==='where.use.location-question'&&(
      !AssessmentScope||!AssessmentScope.valid(scope)||scope.skill!==skill||
      scope.originExperienceId!==id(decision.experienceId)||
      (decision.learnerId!=null&&id(decision.learnerId)!==scope.learnerId)||
      (decision.language!=null&&id(decision.language)!==scope.language)||
      (attempt.language!=null&&id(attempt.language)!==scope.language)||
      id(event.skill)!==skill||id(event.source)!=='where-location-probe-select'||
      id(event.intent)!=='answer'||id(event.dimension)!=='location-answer'||
      id(attempt.dimension)!=='location-answer'||
      !['pass','fail'].includes(id(attempt.result))||!id(attempt.support)||
      (attempt.context&&attempt.context.assessmentScope&&!AssessmentScope.ownsPacket(scope,attempt))
    ))return false;
    if(scope&&(id(event.language)!==scope.language||id(attempt.context&&attempt.context.language)!==scope.language||
      id(state.experienceLanguage)!==scope.language))return false;
    var from=id(decision.experienceId),to=id(state.currentExperienceId);
    if(!from||!to||from===to)return false;
    var origin=catalog.getExperience(from);
    var destination=catalog.getExperience(to);
    if(!origin||!destination||id(origin.toroidalNext&&origin.toroidalNext.nextExperience)!==to)return false;
    if(skill==='where.use.location-question'){
      // This pilot admits only the grounded Shopping -> Preparing location circuit.
      // A scoped Session is required; corpus target declaration is the next stage.
      if(from!=='shopping-for-dinner'||to!=='preparing-dinner'||id(origin.id)!==from||id(destination.id)!==to)return false;
      var here=(origin.thinkingMind||[]).filter(function(entry){return entry&&entry.questionWord==='where';});
      var later=(destination.thinkingMind||[]).filter(function(entry){return entry&&entry.questionWord==='where';});
      if(here.length!==1||later.length!==1||here[0].intention!=='place'||later[0].intention!=='place')return false;
      for(var entry of [here[0],later[0]]){
        for(var name of ['assessmentTarget','assessmentResumeTarget']){
          var target=entry[name];
          if(target&&(target.skill!==skill||target.definitionPath!=='data/learning/skills/where.json'))return false;
        }
      }
      if(!['grounded-location','non-location'].includes(id(event.choice)))return false;
    }
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
    if(skill==='why.use.contextual-reason'){
      var originWhy=(origin.thinkingMind||[]).filter(function(entry){
        return entry&&entry.questionWord==='why'&&entry.assessmentTarget&&
          entry.assessmentTarget.skill===skill&&
          entry.assessmentTarget.definitionPath==='data/learning/skills/why.json';
      });
      var targetWhy=(destination.thinkingMind||[]).filter(function(entry){
        return entry&&entry.questionWord==='why'&&entry.reasonGrounding&&
          Array.isArray(entry.reasonGrounding.alternatives)&&
          entry.reasonGrounding.alternatives.some(function(option){return option.id===id(event.choice);});
      });
      if(originWhy.length!==1||targetWhy.length!==1)return false;
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
