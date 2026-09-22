(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveLearnerProgressMarker=api;
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

  function resolve(trail){
    if(!trail||!Array.isArray(trail.footprints))return null;

    var skill=text(trail.skill);
    if(!skill)return null;

    var confirmedExperiences=[];
    trail.footprints.forEach(function(item){
      if(!isConfirmedClosure(item))return;
      var experienceId=text(item.experienceId);
      if(!experienceId)return;
      if(!confirmedExperiences.includes(experienceId))confirmedExperiences.push(experienceId);
    });

    var state='UNOBSERVED';
    var marker='EMPTY_DOT';

    if(trail.footprints.length>0){
      state='IN_PROGRESS';
      marker='PARTIAL_DOT';
    }

    if(confirmedExperiences.length===1){
      state='CONFIRMED';
      marker='FILLED_DOT';
    }

    if(confirmedExperiences.length>=2){
      state='CONSOLIDATED_EVIDENCE';
      marker='MILESTONE';
    }

    return Object.freeze({
      status:'PROGRESS_MARKER_READY',
      skill:skill,
      state:state,
      marker:marker,
      confirmedExperiences:confirmedExperiences.length
    });
  }

  return Object.freeze({resolve:resolve});
});
