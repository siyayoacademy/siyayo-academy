// Longitudinal recorder for one learner-owned Attempt already accepted by the adaptive Cycle.
// It creates an idempotent, non-confirmatory footprint in AdaptiveEvidenceProfile.
// It does not infer mastery, close a Pass Contract, authorize Green Pass/NEXT, or create a Session.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveObservedAttemptEvidenceSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function isDuplicate(profile,skill,occurrenceId){
    return Array.isArray(profile&&profile.observations)&&profile.observations.some(function(entry){
      var context=entry&&entry.context||{};
      return entry&&
        entry.source==='learner-attempt'&&
        text(context.skill)===skill&&
        text(context.occurrenceId)===occurrenceId;
    });
  }

  function record(profileApi,profile,input){
    input=input||{};
    var cycleResult=input.cycleResult;
    var session=input.session;
    var attempt=input.attempt;
    var learnerEvent=input.learnerEvent;
    var sourceContext=input.context||{};

    if(!profileApi||typeof profileApi.record!=='function')return null;
    if(!profile||!Array.isArray(profile.observations))return null;
    if(!cycleResult||!cycleResult.evidencePacket)return null;
    if(!attempt||!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;

    var skill=text(session&&session.decision&&session.decision.skill);
    var experienceId=text(session&&session.decision&&session.decision.experienceId);
    var occurrenceId=text(attempt.occurrenceId);
    var eventOccurrenceId=text(learnerEvent.occurrenceId);
    var packet=cycleResult.evidencePacket||{};
    var packetOccurrenceId=text(packet&&packet.context&&packet.context.occurrenceId);
    var packetSkill=text(packet.skill);
    var dimension=text(packet.dimension);
    var result=text(packet.result);

    if(!skill||!experienceId||!occurrenceId||!eventOccurrenceId||!packetOccurrenceId)return null;
    if(occurrenceId!==eventOccurrenceId||occurrenceId!==packetOccurrenceId)return null;
    if(packetSkill!==skill||text(attempt.skill)!==skill)return null;
    if(!dimension||!result)return null;

    var attemptExperience=text(attempt&&attempt.context&&attempt.context.experienceId);
    var eventExperience=text(learnerEvent.experienceId);
    var packetExperience=text(packet&&packet.context&&packet.context.experienceId);
    if(attemptExperience&&attemptExperience!==experienceId)return null;
    if(eventExperience&&eventExperience!==experienceId)return null;
    if(packetExperience&&packetExperience!==experienceId)return null;

    if(isDuplicate(profile,skill,occurrenceId))return profile;

    return profileApi.record(profile,{
      source:'learner-attempt',
      status:'attempt-observed',
      repeated:[],
      requiresReview:false,
      conflict:false,
      requiresReinforcement:false
    },{
      skill:skill,
      language:text(packet&&packet.context&&packet.context.language)||text(sourceContext.language)||'en',
      chapter:text(sourceContext.chapter)||'question-words',
      confirmed:false,
      experienceId:experienceId,
      occurrenceId:occurrenceId,
      dimension:dimension,
      result:result,
      support:text(packet.support)||'none'
    });
  }

  return Object.freeze({record:record});
});
