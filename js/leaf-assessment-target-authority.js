// Leaf owns the explicit assessment Target boundary.
// It does not infer a Skill from an Experience, learner evidence, or runtime state.
(function(root){
'use strict';
var current=null;

function normalize(value){
  if(typeof value!=='string')return null;
  var normalized=value.trim();
  return normalized||null;
}

function adopt(target){
  if(!target||typeof target!=='object')return false;
  var skill=normalize(target.skill);
  var definitionPath=normalize(target.definitionPath);
  if(!skill||!definitionPath)return false;

  var policy=root.GreenPassAuthorityPolicy;
  if(!policy||!Array.isArray(policy.contractAuthoritySkills))return false;
  if(!policy.contractAuthoritySkills.includes(skill))return false;

  current=Object.freeze({skill:skill,definitionPath:definitionPath});
  return true;
}

function getTarget(){return current;}
function getSkill(){return current&&current.skill||null;}
function getDefinitionPath(){return current&&current.definitionPath||null;}
function clear(){current=null;}

root.SIYAYOLeafAssessmentTargetAuthority=Object.freeze({
  adopt:adopt,
  getTarget:getTarget,
  getSkill:getSkill,
  getDefinitionPath:getDefinitionPath,
  clear:clear
});
})(typeof globalThis!=='undefined'?globalThis:this);
