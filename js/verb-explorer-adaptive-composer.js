// Grounded Verb Explorer adaptive composer.
// Resolves only P/S/C from explicit authorities; A remains learner-event-time in CoordinatorConfig.
(function(root){
'use strict';

function compose(input){
  input=input||{};
  var identitySource=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var skillSource=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var greenProfileSource=root.SIYAYOVerbExplorerAdaptiveProfileSource;
  var evidenceProfileSource=root.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
  var sessionSource=root.SIYAYOVerbExplorerAdaptiveSessionSource;
  var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var coordinatorConfig=root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;

  if(!identitySource||typeof identitySource.getId!=='function')return false;
  if(!skillSource||typeof skillSource.getSkill!=='function'||typeof skillSource.getPassContract!=='function')return false;
  if(!greenProfileSource||typeof greenProfileSource.begin!=='function')return false;
  if(!evidenceProfileSource||typeof evidenceProfileSource.begin!=='function')return false;
  if(!sessionSource||typeof sessionSource.begin!=='function')return false;
  if(!stateBridge||typeof stateBridge.getState!=='function')return false;
  if(!coordinatorConfig||typeof coordinatorConfig.configure!=='function')return false;

  var learnerId=identitySource.getId();
  var skill=skillSource.getSkill();
  var passContract=skillSource.getPassContract();
  var state=stateBridge.getState();
  if(typeof learnerId!=='string'||!learnerId.trim())return false;
  learnerId=learnerId.trim();
  if(typeof skill!=='string'||!skill.trim()||!passContract)return false;
  if(!state||typeof state.currentExperienceId!=='string'||!state.currentExperienceId.trim())return false;

  var context=Object.freeze({
    skill:skill,
    currentExperience:state.currentExperienceId,
    passContract:passContract,
    evidencePackets:Object.freeze([])
  });

  var greenProfile=greenProfileSource.getProfile&&greenProfileSource.getProfile();
  if(greenProfile&&greenProfile.id!==learnerId)return false;
  if(!greenProfile)greenProfile=greenProfileSource.begin(learnerId);
  if(!greenProfile||greenProfile.id!==learnerId)return false;

  var evidenceProfile=evidenceProfileSource.getProfile&&evidenceProfileSource.getProfile();
  if(evidenceProfile&&evidenceProfile.id!==learnerId)return false;
  if(!evidenceProfile)evidenceProfile=evidenceProfileSource.begin(learnerId);
  if(!evidenceProfile||evidenceProfile.id!==learnerId)return false;

  var session=sessionSource.begin(evidenceProfile,context);
  if(!session||!session.decision)return false;

  return coordinatorConfig.configure({
    profile:greenProfile,
    session:session,
    context:context,
    getState:stateBridge.getState,
    getResumeState:stateBridge.getResumeState,
    document:input.document
  });
}

root.SIYAYOVerbExplorerAdaptiveComposer=Object.freeze({compose:compose});
})(typeof globalThis!=='undefined'?globalThis:this);
