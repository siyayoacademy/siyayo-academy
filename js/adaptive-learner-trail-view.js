(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveLearnerTrailView=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function freezeFootprint(entry){
    var context=entry&&entry.context||{};
    return Object.freeze({
      source:entry.source||null,
      status:entry.status||null,
      experienceId:text(context.experienceId)||null,
      language:text(context.language)||null,
      chapter:text(context.chapter)||null,
      confirmed:context.confirmed===true,
      contractStatus:text(context.contractStatus)||null,
      requiresReview:entry.requiresReview===true,
      conflict:entry.conflict===true,
      requiresReinforcement:entry.requiresReinforcement===true
    });
  }

  function project(profile,skill,filter){
    skill=text(skill);
    if(!profile||!Array.isArray(profile.observations)||!skill)return null;

    if(filter&&!['en','es','pt'].includes(text(filter.language)))return null;
    var legacyFootprints=profile.observations.filter(function(entry){return text(entry&&entry.context&&entry.context.skill)===skill&&!(entry.context&&entry.context.assessmentScope);}).length;
    var footprints=profile.observations
      .filter(function(entry){
        var context=entry&&entry.context||{},scope=context.assessmentScope;
        return text(context.skill)===skill&&(!filter||(
          scope&&scope.learnerId===profile.id&&scope.skill===skill&&scope.language===filter.language&&
          context.language===filter.language&&scope.key===JSON.stringify([scope.learnerId,scope.skill,scope.language,scope.originExperienceId])&&
          (!filter.originExperienceId||scope.originExperienceId===filter.originExperienceId)));
      })
      .map(freezeFootprint);

    var greenPassClosures=footprints.filter(function(item){
      return item.source==='green-pass-contract'&&
        item.status==='transfer-confirmed'&&
        item.confirmed===true&&
        item.contractStatus==='GREEN_PASS';
    }).length;

    var state='UNOBSERVED';
    if(footprints.length){
      state=greenPassClosures>0?'GREEN_PASS_CONFIRMED':'OBSERVED';
    }

    return Object.freeze({
      status:footprints.length?'TRAIL_AVAILABLE':'TRAIL_EMPTY',
      skill:skill,
      state:state,
      counts:Object.freeze({
        ...(filter?{legacyFootprints:legacyFootprints,language:filter.language}:{}),
        footprints:footprints.length,
        greenPassClosures:greenPassClosures
      }),
      footprints:Object.freeze(footprints)
    });
  }

  return Object.freeze({project:project});
});
