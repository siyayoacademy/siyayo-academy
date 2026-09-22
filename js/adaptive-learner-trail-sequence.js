(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveLearnerTrailSequence=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function isConfirmedClosure(item){
    return !!item&&
      item.source==='green-pass-contract'&&
      item.status==='transfer-confirmed'&&
      item.confirmed===true&&
      item.contractStatus==='GREEN_PASS';
  }

  function project(trail){
    if(!trail||!Array.isArray(trail.footprints))return null;

    var skill=text(trail.skill);
    if(!skill)return null;

    var order=[];
    var byExperience=Object.create(null);

    trail.footprints.forEach(function(item){
      var experienceId=text(item&&item.experienceId);
      if(!experienceId)return;

      if(!byExperience[experienceId]){
        byExperience[experienceId]={
          experienceId:experienceId,
          footprints:0,
          greenPassClosures:0
        };
        order.push(experienceId);
      }

      var aggregate=byExperience[experienceId];
      aggregate.footprints+=1;
      if(isConfirmedClosure(item))aggregate.greenPassClosures+=1;
    });

    var segments=order.map(function(experienceId){
      var aggregate=byExperience[experienceId];
      var confirmed=aggregate.greenPassClosures>0;
      return Object.freeze({
        experienceId:experienceId,
        state:confirmed?'CONFIRMED':'IN_PROGRESS',
        marker:confirmed?'FILLED_DOT':'PARTIAL_DOT',
        footprints:aggregate.footprints,
        greenPassClosures:aggregate.greenPassClosures
      });
    });

    return Object.freeze({
      status:segments.length?'TRAIL_SEQUENCE_AVAILABLE':'TRAIL_SEQUENCE_EMPTY',
      skill:skill,
      segments:Object.freeze(segments)
    });
  }

  return Object.freeze({project:project});
});
