// Re-entrant, fail-closed startup hinge for a grounded Verb Explorer adaptive Session.
// It never invents learner identity or Skill, never infers Skill from Experience,
// and delegates active-Session preservation to the Composer.
(function(root){
'use strict';

var pending=null,generation=0;
function clear(){generation+=1;pending=null;}

function tryCompose(options){
  options=options||{};
  if(pending)return pending;

  var identitySource=options.identitySource||root.SIYAYOVerbExplorerLearnerIdentitySource;
  var targetAuthority=options.targetAuthority||root.SIYAYOLeafAssessmentTargetAuthority;
  var skillBridge=options.skillBridge||root.SIYAYOLeafCanonicalSkillBridge;
  var composer=options.composer||root.SIYAYOVerbExplorerAdaptiveComposer;
  var coordinator=options.coordinator||root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var documentRef=Object.prototype.hasOwnProperty.call(options,'document')?options.document:root.document;

  if(!identitySource||typeof identitySource.getId!=='function')return Promise.resolve(false);
  if(!targetAuthority||typeof targetAuthority.getTarget!=='function')return Promise.resolve(false);
  if(!skillBridge||typeof skillBridge.loadTarget!=='function')return Promise.resolve(false);
  if(!composer||typeof composer.compose!=='function')return Promise.resolve(false);
  if(!coordinator||typeof coordinator.snapshot!=='function')return Promise.resolve(false);

  // Check before loadTarget: the loader adopts the definition into a singleton.
  // A selected Thinking Mind question must not change that singleton while S is active.
  var active=coordinator.snapshot();
  if(active&&active.session)return Promise.resolve(false);

  var learnerId=identitySource.getId();
  var target=targetAuthority.getTarget();
  if(typeof learnerId!=='string'||!learnerId.trim())return Promise.resolve(false);
  if(!target||typeof target!=='object')return Promise.resolve(false);

  var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var selectedState=stateBridge&&stateBridge.getState&&stateBridge.getState();
  if(root.AdaptiveAssessmentScope&&(!selectedState||!['en','es','pt'].includes(selectedState.experienceLanguage)))return Promise.resolve(false);
  var version=generation;
  pending=Promise.resolve(skillBridge.loadTarget())
    .then(function(loaded){
      if(loaded!==true||version!==generation||identitySource.getId()!==learnerId)return false;
      var latestState=stateBridge&&stateBridge.getState&&stateBridge.getState();
      if(root.AdaptiveAssessmentScope&&(!latestState||latestState.currentExperienceId!==selectedState.currentExperienceId||
        latestState.experienceLanguage!==selectedState.experienceLanguage))return false;
      var latest=targetAuthority.getTarget();
      if(!latest||latest.skill!==target.skill||latest.definitionPath!==target.definitionPath)return false;
      return composer.compose({document:documentRef})===true;
    })
    .catch(function(){return false;})
    .then(function(result){
      if(version===generation)pending=null;
      return result;
    },function(){
      if(version===generation)pending=null;
      return false;
    });

  return pending;
}

root.SIYAYOVerbExplorerAdaptiveLiveStart=Object.freeze({tryCompose:tryCompose,clear:clear});
})(typeof globalThis!=='undefined'?globalThis:this);
