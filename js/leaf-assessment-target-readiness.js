// Leaf-owned integration boundary: accept only an explicit canonical Target through
// TargetAuthority, then signal adaptive readiness. It does not infer Skill, invent
// Identity/Experience, or decide whether a Session is ready.
(function(root){
'use strict';

function adopt(target,options){
  options=options||{};
  var authority=options.authority||root.SIYAYOLeafAssessmentTargetAuthority;
  var trigger=options.trigger||root.SIYAYOVerbExplorerAdaptiveReadinessTrigger;

  if(!authority||typeof authority.adopt!=='function')return Promise.resolve(false);
  if(authority.adopt(target)!==true)return Promise.resolve(false);
  if(!trigger||typeof trigger.signal!=='function')return Promise.resolve(false);

  try{
    return Promise.resolve(trigger.signal()).then(function(result){
      return result===true;
    },function(){
      return false;
    });
  }catch(error){
    return Promise.resolve(false);
  }
}

root.SIYAYOLeafAssessmentTargetReadiness=Object.freeze({adopt:adopt});
})(typeof globalThis!=='undefined'?globalThis:this);
