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
  if(!learnerId){
    var bridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var state=bridge&&bridge.getState&&bridge.getState();
    pendingSelection=Object.freeze({question:question,experienceId:state&&state.currentExperienceId});
  }
  if(active&&active.session&&active.session.decision&&active.session.decision.skill===skill)
    return Promise.resolve(true);
  var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
  var liveState=stateBridge&&stateBridge.getState&&stateBridge.getState();
  if(learnerId&&active&&active.session&&liveState&&
    active.session.decision.experienceId!==liveState.currentExperienceId)return Promise.resolve(false);
  if(learnerId&&active&&active.session){
    var oldSkill=active.session.decision&&active.session.decision.skill;
    var skillSource=root.SIYAYOVerbExplorerCanonicalSkillSource;
    var definition=skillSource&&skillSource.getDefinition&&skillSource.getDefinition();
    if(oldSkill&&definition&&definition.id===oldSkill)
      retained[learnerId+'|'+oldSkill]={snapshot:active,definition:definition};
  }
  if(learnerId&&active&&coordinator&&typeof coordinator.clear==='function')coordinator.clear();
  if(learnerId)['SIYAYOVerbExplorerAdaptiveReadinessTrigger','SIYAYOVerbExplorerAdaptiveLiveStart',
    'SIYAYOVerbExplorerCanonicalSkillLoader'].forEach(function(name){
    var api=root[name];if(api&&typeof api.clear==='function')api.clear();
  });
  var saved=learnerId&&retained[learnerId+'|'+skill];
  if(saved){
    var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
    var config=root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;
    var state=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var profiles=root.SIYAYOVerbExplorerAdaptiveProfileSource;
    if(!source||!config||!state||source.adopt(saved.definition)!==true)return Promise.resolve(false);
    return Promise.resolve(config.configure({
      profile:profiles&&profiles.getProfile&&profiles.getProfile()||saved.snapshot.profile,
      session:saved.snapshot.session,context:saved.snapshot.context,
      getState:state.getState,getResumeState:state.getResumeState||state.getState,
      document:options.document||root.document
    })===true);
  }

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
    runtime.activeExperienceId()!==pending.experienceId)return Promise.resolve(false);
  pendingSelection=null;
  return select(pending.question);
}

root.SIYAYOVerbExplorerThinkingMindAssessmentSelection=Object.freeze({select:select,clear:clear,invalidatePending:invalidatePending,resumeForIdentity:resumeForIdentity});
})(typeof globalThis!=='undefined'?globalThis:this);
