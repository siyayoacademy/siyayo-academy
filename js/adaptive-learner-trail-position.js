(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveLearnerTrailPosition=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function resolve(sequence,currentExperienceId){
    if(!sequence||!Array.isArray(sequence.segments))return null;

    var skill=text(sequence.skill);
    var current=text(currentExperienceId);
    if(!skill||!current)return null;

    var index=-1;
    for(var i=0;i<sequence.segments.length;i+=1){
      if(text(sequence.segments[i]&&sequence.segments[i].experienceId)===current){
        index=i;
        break;
      }
    }

    return Object.freeze({
      status:'TRAIL_POSITION_READY',
      skill:skill,
      currentExperienceId:current,
      visited:index>=0,
      segmentIndex:index
    });
  }

  return Object.freeze({resolve:resolve});
});
