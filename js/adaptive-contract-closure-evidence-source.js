// Longitudinal recorder for one already-grounded Green Pass contract closure.
// It records the confirmed closure once in AdaptiveEvidenceProfile so later
// Decisions can snapshot prior evidence. It does not create Session/Attempt,
// decide progression, or authorize transition.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveContractClosureEvidenceSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function isDuplicate(profile,skill,experienceId,scope){
    return Array.isArray(profile&&profile.observations)&&profile.observations.some(function(entry){
      var context=entry&&entry.context||{};
      return entry&&
        entry.source==='green-pass-contract'&&
        entry.status==='transfer-confirmed'&&
        context.confirmed===true&&
        text(context.skill)===skill&&
        text(context.experienceId)===experienceId&&
        text(context.contractStatus)==='GREEN_PASS'&&
        (!scope||(context.assessmentScope&&context.assessmentScope.key===scope.key&&context.language===scope.language));
    });
  }

  function record(profileApi,profile,input){
    input=input||{};
    var cycleResult=input.cycleResult;
    var session=input.session;
    var context=input.context||{};

    if(!profileApi||typeof profileApi.record!=='function')return null;
    if(!profile||!Array.isArray(profile.observations))return null;
    if(!cycleResult||cycleResult.contractEligible!==true)return null;

    var contract=cycleResult.contractEvaluation;
    if(!contract||contract.status!=='GREEN_PASS'||contract.satisfied!==true)return null;

    var skill=text(session&&session.decision&&session.decision.skill);
    var experienceId=text(session&&session.decision&&session.decision.experienceId);
    if(!skill||!experienceId)return null;

    var scope=session.decision.assessmentScope;
    if(scope&&(!context.assessmentScope||context.assessmentScope.key!==scope.key||
      profile.id!==scope.learnerId||skill!==scope.skill||experienceId!==scope.originExperienceId||
      !cycleResult.evidencePacket||!cycleResult.evidencePacket.context||
      !cycleResult.evidencePacket.context.assessmentScope||cycleResult.evidencePacket.context.assessmentScope.key!==scope.key))return null;
    if(isDuplicate(profile,skill,experienceId,scope))return profile;

    return profileApi.record(profile,{
      source:'green-pass-contract',
      status:'transfer-confirmed',
      repeated:[],
      requiresReview:false,
      conflict:false,
      requiresReinforcement:false
    },{
      skill:skill,
      language:scope?scope.language:text(context.language)||'en',
      ...(scope?{assessmentScope:scope}:{}),
      chapter:text(context.chapter)||'question-words',
      confirmed:true,
      experienceId:experienceId,
      contractStatus:'GREEN_PASS'
    });
  }

  return Object.freeze({record:record});
});
