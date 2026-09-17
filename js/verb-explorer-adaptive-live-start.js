// Re-entrant, fail-closed startup hinge for a grounded Verb Explorer adaptive Session.
// It never invents learner identity or Skill, never infers Skill from Experience,
// and delegates active-Session preservation to the Composer.
(function(root){
'use strict';

var pending=null;

function tryCompose(options){
  options=options||{};
  if(pending)return pending;

  var identitySource=options.identitySource||root.SIYAYOVerbExplorerLearnerIdentitySource;
  var targetAuthority=options.targetAuthority||root.SIYAYOLeafAssessmentTargetAuthority;
  var skillBridge=options.skillBridge||root.SIYAYOLeafCanonicalSkillBridge;
  var composer=options.composer||root.SIYAYOVerbExplorerAdaptiveComposer;
  var documentRef=Object.prototype.hasOwnProperty.call(options,'document')?options.document:root.document;

  if(!identitySource||typeof identitySource.getId!=='function')return Promise.resolve(false);
  if(!targetAuthority||typeof targetAuthority.getTarget!=='function')return Promise.resolve(false);
  if(!skillBridge||typeof skillBridge.loadTarget!=='function')return Promise.resolve(false);
  if(!composer||typeof composer.compose!=='function')return Promise.resolve(false);

  var learnerId=identitySource.getId();
  var target=targetAuthority.getTarget();
  if(typeof learnerId!=='string'||!learnerId.trim())return Promise.resolve(false);
  if(!target||typeof target!=='object')return Promise.resolve(false);

  pending=Promise.resolve(skillBridge.loadTarget())
    .then(function(loaded){
      if(loaded!==true)return false;
      return composer.compose({document:documentRef})===true;
    })
    .catch(function(){return false;})
    .then(function(result){
      pending=null;
      return result;
    },function(){
      pending=null;
      return false;
    });

  return pending;
}

root.SIYAYOVerbExplorerAdaptiveLiveStart=Object.freeze({tryCompose:tryCompose});
})(typeof globalThis!=='undefined'?globalThis:this);
