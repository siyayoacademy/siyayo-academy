// Bridges an already-resolved Leaf assessment Target to the canonical Skill loader.
// No Target means WAIT; this bridge does not infer, select, or mutate a Target.
(function(root){
'use strict';

function loadTarget(){
  var authority=root.SIYAYOLeafAssessmentTargetAuthority;
  var loader=root.SIYAYOVerbExplorerCanonicalSkillLoader;
  if(!authority||typeof authority.getTarget!=='function')return Promise.resolve(false);
  if(!loader||typeof loader.load!=='function')return Promise.resolve(false);

  var target=authority.getTarget();
  if(!target||typeof target!=='object')return Promise.resolve(false);
  if(typeof target.skill!=='string'||!target.skill.trim())return Promise.resolve(false);
  if(typeof target.definitionPath!=='string'||!target.definitionPath.trim())return Promise.resolve(false);

  var expectedSkill=target.skill.trim();
  var path=target.definitionPath.trim();

  return Promise.resolve(loader.load(path)).then(function(loaded){
    if(loaded!==true)return false;
    var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
    if(!source||typeof source.getSkill!=='function')return false;
    return source.getSkill()===expectedSkill;
  }).catch(function(){return false;});
}

root.SIYAYOLeafCanonicalSkillBridge=Object.freeze({loadTarget:loadTarget});
})(typeof globalThis!=='undefined'?globalThis:this);
