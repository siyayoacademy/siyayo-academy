// Pure ownership boundary for a learner's language-specific assessment circuit.
// No evaluation, translation, routing, Session creation or navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveAssessmentScope=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(v){return typeof v==='string'?v.trim():'';}
  function create(input){
    input=input||{};
    var learnerId=text(input.learnerId),skill=text(input.skill),
      language=text(input.language),originExperienceId=text(input.originExperienceId);
    if(!learnerId||!skill||!['en','es','pt'].includes(language)||!originExperienceId)return null;
    return Object.freeze({learnerId:learnerId,skill:skill,language:language,
      originExperienceId:originExperienceId,
      key:JSON.stringify([learnerId,skill,language,originExperienceId])});
  }
  function valid(scope){
    var canonical=create(scope);
    return !!canonical&&canonical.key===scope.key;
  }
  function same(a,b){return valid(a)&&valid(b)&&a.key===b.key;}
  function ownsContext(scope,context){
    return valid(scope)&&!!context&&same(scope,context.assessmentScope)&&
      text(context.language)===scope.language;
  }
  function ownsPacket(scope,packet){
    return !!packet&&text(packet.skill)===scope.skill&&ownsContext(scope,packet.context);
  }
  function bindAttempt(input){
    input=input||{};
    var scope=input.scope,attempt=input.attempt,event=input.learnerEvent,state=input.state;
    if(!valid(scope)||text(input.learnerId)!==scope.learnerId||!attempt||!event||!state)return null;
    if(event.observed!==true||event.actor!=='learner'||text(attempt.skill)!==scope.skill)return null;
    var details=attempt.context||{};
    var language=text(details.language)||text(details.experienceLanguage);
    var eventLanguage=text(event.language)||text(event.experienceLanguage);
    if(language!==scope.language||eventLanguage!==scope.language||
      text(state.experienceLanguage)!==scope.language)return null;
    if(attempt.language!=null&&text(attempt.language)!==scope.language)return null;
    if(details.assessmentScope&&!same(scope,details.assessmentScope))return null;
    if(!text(event.occurrenceId)||text(attempt.occurrenceId)!==text(event.occurrenceId))return null;
    return Object.freeze(Object.assign({},attempt,{language:scope.language,
      context:Object.freeze(Object.assign({},details,{language:scope.language,assessmentScope:scope}))}));
  }
  function profileView(profile,scope){
    if(!profile||!valid(scope)||profile.id!==scope.learnerId)return null;
    function select(entries){return (Array.isArray(entries)?entries:[]).filter(function(entry){
      return entry&&ownsContext(scope,entry.context);
    });}
    return Object.assign({},profile,{observations:select(profile.observations),
      patterns:select(profile.patterns),reinforcementCandidates:select(profile.reinforcementCandidates),
      confirmedReinforcements:select(profile.confirmedReinforcements)});
  }
  return Object.freeze({create:create,valid:valid,same:same,ownsContext:ownsContext,
    ownsPacket:ownsPacket,bindAttempt:bindAttempt,profileView:profileView});
});
