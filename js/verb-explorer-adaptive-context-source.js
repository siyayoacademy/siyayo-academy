// Grounded adaptive Context source for Verb Explorer.
// Session owns pedagogical skill; Explorer state owns observed location.
// Existing caller context is preserved only when it does not conflict with either source.
(function(root){
'use strict';

function compose(session,state,baseContext){
  var boundary=root.SIYAYOVerbExplorerSessionStateBoundary;
  if(!boundary||typeof boundary.align!=='function')return null;

  var aligned=boundary.align(session,state);
  if(!aligned)return null;

  var base=baseContext||{};
  if(base.skill!=null&&String(base.skill)!==String(aligned.skill))return null;
  if(base.currentExperience!=null&&String(base.currentExperience)!==String(aligned.currentExperience))return null;

  return Object.freeze(Object.assign({},base,{
    skill:aligned.skill,
    currentExperience:aligned.currentExperience
  }));
}

root.SIYAYOVerbExplorerAdaptiveContextSource=Object.freeze({compose:compose});
})(typeof globalThis!=='undefined'?globalThis:this);
