// Explicit Thinking Mind assessment selection boundary.
// A learner's click may forward only an assessmentTarget already declared by the
// selected question. It never infers Skill from questionWord, Experience,
// choiceContext, target words, or Dependency Focus.
(function(root){
'use strict';
var retained=Object.create(null),pendingSelection=null,pendingStart=null,generation=0;
function clearStartup(){
  ['SIYAYOVerbExplorerAdaptiveReadinessTrigger','SIYAYOVerbExplorerAdaptiveLiveStart',
    'SIYAYOVerbExplorerCanonicalSkillLoader'].forEach(function(name){
    var api=root[name];if(api&&typeof api.clear==='function')api.clear();
  });
}
function clear(){
  generation+=1;if(pendingStart)clearStartup();
  retained=Object.create(null);pendingSelection=null;pendingStart=null;
}
function recoverPrevious(previous){
  if(!previous||!previous.snapshot||!previous.snapshot.session||!previous.definition)return false;
  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var now=coordinator&&coordinator.snapshot&&coordinator.snapshot();
  if(!identity||identity.getId()!==previous.learnerId||now&&now.session)return false;
  var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var config=root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;
  var state=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var profiles=root.SIYAYOVerbExplorerAdaptiveProfileSource;
  if(!source||!config||!state||typeof config.restore!=='function')return false;
  try{
    if(source.adopt(previous.definition)!==true)return false;
    var recover=config.recoverAfterStartFailure||config.restore;
    return recover({profile:profiles&&profiles.getProfile&&profiles.getProfile()||previous.snapshot.profile,
      session:previous.snapshot.session,context:previous.snapshot.context,getState:state.getState,
      getResumeState:state.getResumeState||state.getState,document:previous.document})===true;
  }catch(error){return false;}
}

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
function retainedTransfer(learnerId,skill,language,destinationId){
  var api=root.AdaptiveAssessmentScope;
  var navigation=root.SIYAYOVerbExplorerExperienceNavigation;
  if(!api||!learnerId||!skill||!language||!destinationId||!navigation||typeof navigation.getExperience!=='function')return null;
  var matches=Object.keys(retained).map(function(cacheKey){
    var entry=retained[cacheKey],decision=entry&&entry.snapshot&&entry.snapshot.session&&entry.snapshot.session.decision;
    var scope=decision&&decision.assessmentScope;
    if(!entry||!api.valid(scope)||scope.learnerId!==learnerId||scope.skill!==skill||scope.language!==language)return null;
    var origin=navigation.getExperience(scope.originExperienceId);
    return origin&&text(origin.toroidalNext&&origin.toroidalNext.nextExperience)===destinationId?entry:null;
  }).filter(Boolean);
  return matches.length===1?matches[0]:null;
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
    return progress&&Object.freeze({scopeKey:scope.key,language:scope.language,
      originExperienceId:scope.originExperienceId,progress:progress});
  }).filter(Boolean);
  return Object.freeze(records);
}
// Read-only witness summaries for the WORD PATH. A retained snapshot must
// remain owned by this NICK and its exact Skill × Language × origin scope.
function getRetainedEvidence(skill,language){
  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var learnerId=identity&&identity.getId&&identity.getId();
  var api=root.AdaptiveAssessmentScope;
  var detail=root.SIYAYOVerbExplorerWordPathWitnessView;
  if(!learnerId||!api||!detail||typeof detail.project!=='function'||
     !['en','es','pt'].includes(language)||!text(skill))return Object.freeze([]);
  var records=Object.keys(retained).map(function(cacheKey){
    var entry=retained[cacheKey],snap=entry&&entry.snapshot;
    var decision=snap&&snap.session&&snap.session.decision;
    var scope=decision&&decision.assessmentScope,context=snap&&snap.context;
    if(!api.valid(scope)||scope.key!==cacheKey||scope.learnerId!==learnerId||
       scope.skill!==skill||scope.language!==language||!context)return null;
    var projection=detail.project({scope:scope,context:context,
      scopeApi:api,evaluator:root.GreenPassProfile,
      progressView:root.AdaptivePassContractProgressView});
    return projection&&Object.freeze({scopeKey:scope.key,language:scope.language,
      originExperienceId:scope.originExperienceId,detail:projection});
  }).filter(Boolean);
  return Object.freeze(records);
}
// A destination may declare a separate entry from a named origin circuit.
// This is an explicit QWord selection, not transfer credit or a Green-based NEXT.
function independentEntryAllowed(question,target,decision,learnerId,state){
  var api=root.AdaptiveAssessmentScope,navigation=root.SIYAYOVerbExplorerExperienceNavigation;
  var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
  if(runtime&&typeof runtime.activeQuestionWord==='function'&&runtime.activeQuestionWord()!==question.questionWord)return false;
  var scope=decision&&decision.assessmentScope;
  if(!api||!api.valid(scope)||scope.learnerId!==learnerId||
    scope.originExperienceId!==decision.experienceId||!navigation||typeof navigation.getExperience!=='function')return false;
  // Independent start changes QW and may change language. The old language
  // belongs ONLY to the retained origin contract; target authority is separately
  // checked against the destination's explicit assessmentEntryFrom declaration.
  if(!['en','es','pt'].includes(state.experienceLanguage))return false;
  var destination=navigation.getExperience(state.currentExperienceId);
  var canonical=destination&&(destination.thinkingMind||[]).find(function(item){return item.questionWord===question.questionWord;});
  var declared=canonical&&canonical.assessmentTarget;
  if(!declared||declared.skill!==target.skill||declared.definitionPath!==target.definitionPath||
    !Array.isArray(canonical.assessmentEntryFrom))return false;
  var origin=navigation.getExperience(scope.originExperienceId);
  var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var definition=source&&source.getDefinition&&source.getDefinition();
  if(!origin||!definition||definition.id!==scope.skill)return false;
  var direct=text(origin.toroidalNext&&origin.toroidalNext.nextExperience)===destination.id;
  function declaredRoute(rule){
    if(direct)return true;
    if(rule.entryMode!=='explicit-independent-start'||rule.allowCanonicalMultiHop!==true)return false;
    var next=navigation.getExperience(text(origin.toroidalNext&&origin.toroidalNext.nextExperience));
    return !!next&&text(next.toroidalNext&&next.toroidalNext.nextExperience)===destination.id;
  }
  return canonical.assessmentEntryFrom.some(function(rule){
    return rule.originExperienceId===scope.originExperienceId&&rule.skill===scope.skill&&declaredRoute(rule)&&
      (origin.thinkingMind||[]).some(function(item){return item.assessmentTarget&&item.assessmentTarget.skill===rule.skill;});
  });
}
function select(question,options){
  options=options||{};
  var version=++generation;
  if(pendingStart){
    var interrupted=pendingStart;pendingStart=null;
    clearStartup();
    var authority=root.SIYAYOLeafAssessmentTargetAuthority;
    if(authority&&typeof authority.clear==='function')authority.clear();
    recoverPrevious(interrupted);
  }
  // A new anonymous selection supersedes the previous pending target, even
  // when this question has no declared contract. Identified Sessions are retained.
  invalidatePending();
  var provider=options.provider||root.SIYAYOLeafAssessmentTargetProvider;
  if(!question||typeof question!=='object')return Promise.resolve(false);

  var contractApi=root.SIYAYOQuestionWordAssessmentContract;
  var target=contractApi&&typeof contractApi.targetForSelection==='function'
    ?contractApi.targetForSelection(question,null):null;
  if(!target)return Promise.resolve(false);
  var resumeOnly=target.resumeOnly===true;
  var skill=text(target.skill);
  var definitionPath=text(target.definitionPath);
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
  if(!learnerId&&resumeOnly)return Promise.resolve(false);
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
  // Recover a unique retained origin before considering a separate new entry.
  // Returning among QWords must not replace a started Shopping WHAT circuit.
  if(!saved&&learnerId&&liveState&&(resumeOnly||active&&active.session&&
    active.session.decision.experienceId!==liveState.currentExperienceId)){
    saved=retainedTransfer(learnerId,skill,liveState.experienceLanguage,liveState.currentExperienceId);
    if(saved){
      var savedScope=saved.snapshot.session.decision.assessmentScope;
      requestedKey=savedScope&&savedScope.key;
    }
  }
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
    active.session.decision.experienceId!==liveState.currentExperienceId&&!saved&&
    !independentEntryAllowed(question,target,activeDecision,learnerId,liveState))return Promise.resolve(false);
  var previousDefinition=null;
  if(learnerId&&active&&active.session){
    var oldSkill=active.session.decision&&active.session.decision.skill;
    var skillSource=root.SIYAYOVerbExplorerCanonicalSkillSource;
    var definition=skillSource&&skillSource.getDefinition&&skillSource.getDefinition();
    previousDefinition=definition&&definition.id===oldSkill?definition:null;
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
  if(resumeOnly)return Promise.resolve(false);
  if(learnerId&&active&&coordinator&&typeof coordinator.clear==='function')coordinator.clear();
  if(learnerId)clearStartup();
  pendingStart={
    snapshot:active,definition:previousDefinition,learnerId:learnerId,document:options.document||root.document
  };

  var leaf=Object.freeze({
    assessmentTarget:Object.freeze({
      skill:skill,
      definitionPath:definitionPath
    })
  });
  function finish(result){
    if(version!==generation)return false;
    var previous=pendingStart;pendingStart=null;
    if(result===true)return true;
    if(!learnerId)return false; // anonymous target waits for explicit nick entry
    // A failed/cancelled load must leave the original circuit reviewable.
    var authority=root.SIYAYOLeafAssessmentTargetAuthority;
    if(authority&&typeof authority.clear==='function')authority.clear();
    var recovered=recoverPrevious(previous);
    var now=coordinator&&coordinator.snapshot&&coordinator.snapshot();
    if(!recovered&&(!now||!now.session)){
      var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
      if(source&&typeof source.clear==='function')source.clear();
    }
    return false;
  }
  try{
    return Promise.resolve(provider.select(leaf)).then(finish,function(){return finish(false);});
  }catch(error){
    return Promise.resolve(finish(false));
  }
}



function resumeRetainedForVisibleSelection(question,options){
  options=options||{};
  if(!question||question.questionWord!=='why')return Promise.resolve(false);
  var identity=root.SIYAYOVerbExplorerLearnerIdentitySource;
  var learnerId=identity&&identity.getId&&identity.getId();
  var runtime=root.SIYAYOVerbExplorerExperienceRuntime;
  var stateApi=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var state=stateApi&&stateApi.getState&&stateApi.getState();
  var scopeApi=root.AdaptiveAssessmentScope;
  var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
  var skill='why.use.contextual-reason';
  if(!learnerId||!state||!scopeApi||!coordinator||!runtime||
    runtime.activeQuestionWord()!=='why'||runtime.activeLanguage()!==state.experienceLanguage||
    runtime.activeExperienceId()!==state.currentExperienceId)return Promise.resolve(false);
  // S3 owns the origin; S4 may only resume that exact S3 origin.
  if(!['having-dinner','after-dinner-conversation'].includes(state.currentExperienceId))return Promise.resolve(false);
  var saved=state.currentExperienceId==='having-dinner'
    ?retained[key(learnerId,skill,state)]
    :retainedTransfer(learnerId,skill,state.experienceLanguage,state.currentExperienceId);
  if(!saved||!saved.snapshot||!saved.snapshot.session||!saved.definition)return Promise.resolve(false);
  var savedDecision=saved.snapshot.session.decision,scope=savedDecision&&savedDecision.assessmentScope;
  if(!scopeApi.valid(scope)||scope.learnerId!==learnerId||scope.skill!==skill||
    scope.language!==state.experienceLanguage||scope.originExperienceId!=='having-dinner'||
    savedDecision.skill!==skill||savedDecision.experienceId!=='having-dinner'||
    saved.definition.id!==skill)return Promise.resolve(false);
  var active=coordinator.snapshot&&coordinator.snapshot();
  var liveDecision=active&&active.session&&active.session.decision;
  if(liveDecision&&liveDecision.assessmentScope&&liveDecision.assessmentScope.key===scope.key)return Promise.resolve(true);
  // A S4 WHY transfer question deliberately has NO assessmentTarget.
  // Restore its pre-existing S3 owner directly; never call targetForSelection
  // or provider.select here, and never create a fresh Session in S4.
  var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var config=root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;
  var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var profiles=root.SIYAYOVerbExplorerAdaptiveProfileSource;
  if(!source||!config||typeof config.restore!=='function'||!stateBridge)return Promise.resolve(false);
  var previousDef=source.getDefinition&&source.getDefinition();
  if(active&&active.session&&previousDef&&previousDef.id===active.session.decision.skill)
    remember(active,previousDef);
  if(source.adopt(saved.definition)!==true)return Promise.resolve(false);
  var restored=false;
  try{
    restored=config.restore({
      profile:profiles&&profiles.getProfile&&profiles.getProfile()||saved.snapshot.profile,
      session:saved.snapshot.session,context:saved.snapshot.context,
      getState:stateBridge.getState,getResumeState:stateBridge.getResumeState||stateBridge.getState,
      document:options.document||root.document
    })===true;
  }catch(error){restored=false;}
  if(!restored){
    if(previousDef)source.adopt(previousDef);else if(source.clear)source.clear();
    // Never claim a successful switch when restoration failed.
    return Promise.resolve(false);
  }
  return Promise.resolve(true);
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

root.SIYAYOVerbExplorerThinkingMindAssessmentSelection=Object.freeze({select:select,clear:clear,invalidatePending:invalidatePending,resumeForIdentity:resumeForIdentity,resumeRetainedForVisibleSelection:resumeRetainedForVisibleSelection,remember:remember,getRetainedProgress:getRetainedProgress,getRetainedEvidence:getRetainedEvidence});
})(typeof globalThis!=='undefined'?globalThis:this);
