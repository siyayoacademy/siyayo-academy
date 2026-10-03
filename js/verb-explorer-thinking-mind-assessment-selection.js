// Explicit Thinking Mind assessment selection boundary.
// A learner's click may forward only an assessmentTarget already declared by the
// selected question. It never infers Skill from questionWord, Experience,
// choiceContext, target words, or Dependency Focus.
(function(root){
'use strict';
var retained=Object.create(null),pendingSelection=null;
function clear(){retained=Object.create(null);pendingSelection=null;}

function invalidatePending(){
  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  if(identity&&identity.getId&&identity.getId())return false;
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var active=coordinator&&coordinator.snapshot&&coordinator.snapshot();
  if(active&&active.session)return false;
  pendingSelection=null;
  ['SIYAYOVerbExplorerAdaptiveReadinessTrigger','SIYAYOVerbExplorerAdaptiveLiveStart',
    'SIYAYOVerbExplorerCanonicalSkillLoader','SIYAYOVerbExplorerCanonicalSkillSource',
    'SIYAYOLeafAssessmentTargetAuthority'].forEach(function(name){
    var api=root[name];if(api&&typeof api.clear==='function')api.clear();
  });
  return true;
}

function text(value){
  return typeof value==='string'?value.trim():'';
}

function key(learnerId,skill,state){
  var api=root.AdaptiveAssessmentScope;
  if(!api)return learnerId+'|'+skill; // compatibility for non-live unscoped consumers
  var scope=api.create({learnerId:learnerId,skill:skill,language:state&&state.experienceLanguage,
    originExperienceId:state&&state.currentExperienceId});
  return scope&&scope.key;
}
function remember(snapshot,definition){
  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var learnerId=identity&&identity.getId&&identity.getId();
  var decision=snapshot&&snapshot.session&&snapshot.session.decision;
  if(!learnerId||!decision||!definition||definition.id!==decision.skill)return false;
  var api=root.AdaptiveAssessmentScope,scope=decision.assessmentScope;
  if(api&&(!api.valid(scope)||scope.learnerId!==learnerId))return false;
  var cacheKey=api?scope.key:learnerId+'|'+decision.skill;
  retained[cacheKey]={snapshot:snapshot,definition:definition};
  return true;
}
// Read-only summaries: no Session adoption, Evidence creation or routing.
function getRetainedProgress(skill,language){
  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var learnerId=identity&&identity.getId&&identity.getId();
  var api=root.AdaptiveAssessmentScope,view=root.AdaptivePassContractProgressView;
  if(!learnerId||!api||!view||typeof view.project!=='function')return Object.freeze([]);
  var records=Object.keys(retained).map(function(cacheKey){
    var entry=retained[cacheKey],snapshot=entry.snapshot;
    var scope=snapshot.session.decision.assessmentScope;
    if(!api.valid(scope)||scope.learnerId!==learnerId||scope.skill!==skill||scope.language!==language)return null;
    var context=snapshot.context||{};
    var progress=view.project(context.passContract,context.evidencePackets,root.GreenPassProfile);
    return progress&&Object.freeze({originExperienceId:scope.originExperienceId,progress:progress});
  }).filter(Boolean);
  return Object.freeze(records);
}
function select(question,options){
  options=options||{};
  // A new anonymous selection supersedes the previous pending target, even
  // when this question has no declared contract. Identified Sessions are retained.
  invalidatePending();
  var provider=options.provider||root.SIYAYOLeafAssessmentTargetProvider;
  if(!question||typeof question!=='object')return Promise.resolve(false);

  var declared=question.assessmentTarget;
  if(!declared||typeof declared!=='object')return Promise.resolve(false);

  var skill=text(declared.skill);
  var definitionPath=text(declared.definitionPath);
  if(!skill||!definitionPath)return Promise.resolve(false);
  if(!provider||typeof provider.select!=='function')return Promise.resolve(false);

  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var learnerId=identity&&typeof identity.getId==='function'?identity.getId():null;
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var active=coordinator&&typeof coordinator.snapshot==='function'?coordinator.snapshot():null;
  var scopeApi=root.AdaptiveAssessmentScope;
  var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var liveState=stateBridge&&stateBridge.getState&&stateBridge.getState();
  if(scopeApi&&(!liveState||!['en','es','pt'].includes(liveState.experienceLanguage)))return Promise.resolve(false);
  if(!learnerId){
    var bridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var state=bridge&&bridge.getState&&bridge.getState();
    pendingSelection=Object.freeze({question:question,experienceId:state&&state.currentExperienceId,
      language:state&&state.experienceLanguage});
  }
  if(active&&active.session&&active.session.decision&&active.session.decision.skill===skill&&
    (!scopeApi||(scopeApi.valid(active.session.decision.assessmentScope)&&
      active.session.decision.assessmentScope.learnerId===learnerId&&
      active.session.decision.assessmentScope.language===liveState.experienceLanguage)))
    return Promise.resolve(true);
  var requestedKey=learnerId&&key(learnerId,skill,liveState);
  var saved=requestedKey&&retained[requestedKey];
  // A transfer visit retains the circuit's origin. Recover only the same
  // learner/skill/origin in the explicitly selected language; never create S2 here.
  var activeDecision=active&&active.session&&active.session.decision;
  var transferVisit=scopeApi&&learnerId&&activeDecision&&activeDecision.skill===skill&&
    scopeApi.valid(activeDecision.assessmentScope)&&activeDecision.assessmentScope.learnerId===learnerId&&
    activeDecision.experienceId!==liveState.currentExperienceId;
  if(transferVisit){
    var navigation=root.SIYAYOVerbExplorerExperienceNavigation;
    var origin=navigation&&typeof navigation.getExperience==='function'&&navigation.getExperience(activeDecision.experienceId);
    if(!origin||text(origin.toroidalNext&&origin.toroidalNext.nextExperience)!==liveState.currentExperienceId)return Promise.resolve(false);
    requestedKey=key(learnerId,skill,{experienceLanguage:liveState.experienceLanguage,currentExperienceId:activeDecision.experienceId});
    saved=requestedKey&&retained[requestedKey];
    if(!saved)return Promise.resolve(false);
  }
  if(learnerId&&active&&active.session&&liveState&&
    active.session.decision.experienceId!==liveState.currentExperienceId&&!saved)return Promise.resolve(false);
  if(learnerId&&active&&active.session){
    var oldSkill=active.session.decision&&active.session.decision.skill;
    var skillSource=root.SIYAYOVerbExplorerCanonicalSkillSource;
    var definition=skillSource&&skillSource.getDefinition&&skillSource.getDefinition();
    if(oldSkill&&definition&&definition.id===oldSkill)
      remember(active,definition);
  }
  if(scopeApi&&learnerId&&!requestedKey)return Promise.resolve(false);
  if(saved){
    var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
    var config=root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;
    var state=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var profiles=root.SIYAYOVerbExplorerAdaptiveProfileSource;
    if(!source||!config||!state)return Promise.resolve(false);
    var previous=source.getDefinition&&source.getDefinition();
    if(source.adopt(saved.definition)!==true)return Promise.resolve(false);
    var restored=false;
    try{
      var restore=config.restore||config.configure;
      restored=restore({
        profile:profiles&&profiles.getProfile&&profiles.getProfile()||saved.snapshot.profile,
        session:saved.snapshot.session,context:saved.snapshot.context,
        getState:state.getState,getResumeState:state.getResumeState||state.getState,
        document:options.document||root.document
      })===true;
    }catch(error){restored=false;}
    if(!restored){if(previous)source.adopt(previous);else if(source.clear)source.clear();}
    return Promise.resolve(restored);
  }
  if(learnerId&&active&&coordinator&&typeof coordinator.clear==='function')coordinator.clear();
  if(learnerId)['SIYAYOVerbExplorerAdaptiveReadinessTrigger','SIYAYOVerbExplorerAdaptiveLiveStart',
    'SIYAYOVerbExplorerCanonicalSkillLoader'].forEach(function(name){
    var api=root[name];if(api&&typeof api.clear==='function')api.clear();
  });

  var leaf=Object.freeze({
    assessmentTarget:Object.freeze({
      skill:skill,
      definitionPath:definitionPath
    })
  });

  try{
    return Promise.resolve(provider.select(leaf)).then(function(result){
      return result===true;
    },function(){return false;});
  }catch(error){
    return Promise.resolve(false);
  }
}


function resumeForIdentity(){
  var pending=pendingSelection;
  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var active=coordinator&&coordinator.snapshot&&coordinator.snapshot();
  var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
  if(!pending||!identity||!identity.getId()||(active&&active.session))return Promise.resolve(false);
  if(!runtime||typeof runtime.activeQuestionWord!=='function'||typeof runtime.activeExperienceId!=='function'||
    runtime.activeQuestionWord()!==pending.question.questionWord||
    runtime.activeExperienceId()!==pending.experienceId||
    (root.AdaptiveAssessmentScope&&runtime.activeLanguage&&runtime.activeLanguage()!==pending.language))return Promise.resolve(false);
  pendingSelection=null;
  return select(pending.question);
}

root.SIYAYOVerbExplorerThinkingMindAssessmentSelection=Object.freeze({select:select,clear:clear,invalidatePending:invalidatePending,resumeForIdentity:resumeForIdentity,remember:remember,getRetainedProgress:getRetainedProgress});
})(typeof globalThis!=='undefined'?globalThis:this);
