// Canonical skill definition boundary for the Verb Explorer adaptive runtime.
// Definitions are supplied explicitly by a trusted loader; this source does not infer a skill from an Experience.
(function(root){
'use strict';
var current=null;

function adopt(definition){
  if(!definition||typeof definition!=='object')return false;
  if(typeof definition.id!=='string'||!definition.id.trim())return false;
  if(!definition.passContract||typeof definition.passContract!=='object')return false;
  var policy=root.GreenPassAuthorityPolicy;
  if(!policy||!Array.isArray(policy.contractAuthoritySkills))return false;
  if(!policy.contractAuthoritySkills.includes(definition.id.trim()))return false;
  current=definition;
  return true;
}

function getDefinition(){return current;}
function getSkill(){return current&&typeof current.id==='string'?current.id:null;}
function getPassContract(){return current&&current.passContract||null;}
function clear(){current=null;}

root.SIYAYOVerbExplorerCanonicalSkillSource=Object.freeze({
  adopt:adopt,
  getDefinition:getDefinition,
  getSkill:getSkill,
  getPassContract:getPassContract,
  clear:clear
});
})(typeof globalThis!=='undefined'?globalThis:this);
