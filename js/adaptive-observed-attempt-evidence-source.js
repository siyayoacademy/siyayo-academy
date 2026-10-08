// Longitudinal recorder for one learner-owned Attempt already accepted by the adaptive Cycle.
// It creates an idempotent, non-confirmatory footprint in AdaptiveEvidenceProfile.
// It does not infer mastery, close a Pass Contract, authorize Green Pass/NEXT, or create a Session.
(function(root,factory){
  var api=factory(typeof module==='object'&&module.exports
    ?require('./adaptive-assessment-scope.js'):root.AdaptiveAssessmentScope);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveObservedAttemptEvidenceSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(AssessmentScope){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function isDuplicate(profile,skill,occurrenceId,scope){
    return Array.isArray(profile&&profile.observations)&&profile.observations.some(function(entry){
      var context=entry&&entry.context||{};
      return entry&&
        entry.source==='learner-attempt'&&
        text(context.skill)===skill&&
        text(context.occurrenceId)===occurrenceId&&
        (!scope||(context.assessmentScope&&context.assessmentScope.key===scope.key&&context.language===scope.language));
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
    var scope=session.decision.assessmentScope;
    var whichTransfer=skill==='which.use.determiner'&&
      text(learnerEvent.source)==='determiner-use-transfer-probe-select'&&dimension==='determiner-use';
    var whatTransfer=skill==='what.use.object-question'&&
      text(learnerEvent.source)==='what-object-question-probe-select'&&
      text(learnerEvent.intent)==='answer'&&dimension==='object-answer'&&
      text(learnerEvent.language)===text(packet&&packet.context&&packet.context.language)&&
      text(learnerEvent.language)===text(attempt&&attempt.context&&attempt.context.language);
    var whyTransfer=skill==='why.use.contextual-reason'&&
      text(learnerEvent.source)==='why-contextual-reason-probe-select'&&
      text(learnerEvent.intent)==='answer'&&dimension==='reason-answer'&&
      text(learnerEvent.language)===text(packet&&packet.context&&packet.context.language)&&
      text(learnerEvent.language)===text(attempt&&attempt.context&&attempt.context.language);
    var whereTransfer=skill==='where.use.location-question'&&
      AssessmentScope&&AssessmentScope.valid(scope)&&scope.skill===skill&&
      scope.originExperienceId===experienceId&&profile.id===scope.learnerId&&
      AssessmentScope.ownsPacket(scope,attempt)&&AssessmentScope.ownsPacket(scope,packet)&&
      experienceId==='shopping-for-dinner'&&attemptExperience==='preparing-dinner'&&
      text(learnerEvent.source)==='where-location-probe-select'&&
      text(learnerEvent.intent)==='answer'&&text(learnerEvent.mode)==='transfer'&&
      text(learnerEvent.skill)===skill&&dimension==='location-answer'&&
      text(attempt.dimension)===dimension&&text(learnerEvent.dimension)===dimension&&
      text(learnerEvent.language)===scope.language&&
      text(attempt.context.occurrenceId)===occurrenceId&&
      text(attempt.result)===result&&['pass','fail'].includes(result)&&
      text(attempt.support)===text(packet.support)&&!!text(packet.support)&&
      ['grounded-location','non-location'].includes(text(learnerEvent.choice))&&
      text(learnerEvent.choice)===text(attempt.context.selectedAlternativeId)&&
      text(learnerEvent.choice)===text(packet.context.selectedAlternativeId);
    var transfer=attempt.mode==='transfer'&&packet.mode==='transfer'&&
      (whichTransfer||whatTransfer||whyTransfer||whereTransfer)&&
      text(learnerEvent.fromExperienceId)===experienceId&&
      text(attempt&&attempt.context&&attempt.context.fromExperienceId)===experienceId&&
      text(packet&&packet.context&&packet.context.fromExperienceId)===experienceId&&
      attemptExperience&&attemptExperience!==experienceId&&
      attemptExperience===eventExperience&&attemptExperience===packetExperience;
    if(skill==='where.use.location-question'&&
      (attempt.mode==='transfer'||packet.mode==='transfer'||learnerEvent.mode==='transfer')&&!transfer)return null;
    if(!transfer){
      if(attemptExperience&&attemptExperience!==experienceId)return null;
      if(eventExperience&&eventExperience!==experienceId)return null;
      if(packetExperience&&packetExperience!==experienceId)return null;
    }

    if(scope&&(profile.id!==scope.learnerId||!packet.context.assessmentScope||
      packet.context.assessmentScope.key!==scope.key||text(packet.context.language)!==scope.language))return null;
    if(isDuplicate(profile,skill,occurrenceId,skill==='where.use.location-question'?scope:null))return profile;

    return profileApi.record(profile,{
      source:'learner-attempt',
      status:'attempt-observed',
      repeated:[],
      requiresReview:false,
      conflict:false,
      requiresReinforcement:false
    },{
      skill:skill,
      language:scope?scope.language:text(packet&&packet.context&&packet.context.language)||text(sourceContext.language)||'en',
      ...(scope?{assessmentScope:scope}:{}),
      chapter:text(sourceContext.chapter)||'question-words',
      confirmed:false,
      experienceId:transfer?attemptExperience:experienceId,
      fromExperienceId:transfer?experienceId:null,
      occurrenceId:occurrenceId,
      dimension:dimension,
      result:result,
      support:text(packet.support)||'none'
    });
  }

  return Object.freeze({record:record});
});
