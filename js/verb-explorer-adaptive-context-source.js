// Grounded adaptive Context source for Verb Explorer.
// Session owns pedagogical skill; Explorer state owns observed location.
// Existing caller context is preserved only when it does not conflict with either source.
// Contract evaluation accepts only skills explicitly adopted by the canonical Green Pass authority policy;
// legacy/general contexts remain free to carry their operational fallback skill.
(function(root){
'use strict';

function isContractSkill(skill){
  var policy=root.GreenPassAuthorityPolicy;
  return !!(policy&&Array.isArray(policy.contractAuthoritySkills)&&policy.contractAuthoritySkills.includes(skill));
}

function compose(session,state,baseContext){
  var boundary=root.SIYAYOVerbExplorerSessionStateBoundary;
  if(!boundary||typeof boundary.align!=='function')return null;

  var aligned=boundary.align(session,state);
  if(!aligned)return null;

  var base=baseContext||{};
  if(base.skill!=null&&String(base.skill)!==String(aligned.skill))return null;
  if(base.currentExperience!=null&&String(base.currentExperience)!==String(aligned.currentExperience))return null;
  if(base.passContract&&!isContractSkill(aligned.skill))return null;

  return Object.freeze(Object.assign({},base,{
    skill:aligned.skill,
    currentExperience:aligned.currentExperience
  }));
}

root.SIYAYOVerbExplorerAdaptiveContextSource=Object.freeze({compose:compose});
})(typeof globalThis!=='undefined'?globalThis:this);
