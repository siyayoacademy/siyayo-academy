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

  function project(profile,skill){
    skill=text(skill);
    if(!profile||!Array.isArray(profile.observations)||!skill)return null;

    var footprints=profile.observations
      .filter(function(entry){
        return text(entry&&entry.context&&entry.context.skill)===skill;
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
        footprints:footprints.length,
        greenPassClosures:greenPassClosures
      }),
      footprints:Object.freeze(footprints)
    });
  }

  return Object.freeze({project:project});
});
