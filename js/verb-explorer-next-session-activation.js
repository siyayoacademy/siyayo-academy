// Grounded activation boundary for a transition-authorized next Session.
// It composes existing authorities: retained Green Profile, canonical S2 birth,
// learner-owned arrival in S2, grounded State, and Coordinator configuration.
// S1 operational evidence packets never cross this boundary.
(function(root){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function activate(input){
    input=input||{};
    var authorization=input.transitionAuthorization;
    var previousSession=input.previousSession;
    var passContract=input.passContract;

    if(!authorization||authorization.status!=='transition-authorized')return null;
    if(!previousSession||!previousSession.decision)return null;
    if(!passContract||typeof passContract!=='object')return null;

    var nextSessionSource=root.SIYAYOVerbExplorerNextSessionSource;
    var profileSource=root.SIYAYOVerbExplorerAdaptiveProfileSource;
    var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var coordinatorConfig=root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;

    if(!nextSessionSource||typeof nextSessionSource.begin!=='function')return null;
    if(!profileSource||typeof profileSource.getProfile!=='function')return null;
    if(!stateBridge||typeof stateBridge.getState!=='function')return null;
    if(!coordinatorConfig||typeof coordinatorConfig.configure!=='function')return null;

    // The learner has already navigated. Adoption never moves the Experience.
    var state=stateBridge.getState();
    if(!state||text(state.currentExperienceId)!==text(authorization.toExperience))return null;

    var greenProfile=profileSource.getProfile();
    if(!greenProfile||typeof greenProfile!=='object')return null;

    var session=nextSessionSource.begin({
      transitionAuthorization:authorization,
      previousSession:previousSession,
      language:input.language,
      chapter:input.chapter
    });
    if(!session||!session.decision)return null;

    var skill=text(session.decision.skill);
    var experienceId=text(session.decision.experienceId);
    if(!skill||!experienceId)return null;
    if(experienceId!==text(authorization.toExperience))return null;
    if(skill!==text(authorization.nextDecision&&authorization.nextDecision.skill))return null;
    if(skill==='what.use.object-question'||skill==='why.use.contextual-reason'){
      var skillSource=root.SIYAYOVerbExplorerCanonicalSkillSource;
      var canonicalDefinition=skillSource&&typeof skillSource.getDefinition==='function'
        ?skillSource.getDefinition():null;
      if(!canonicalDefinition||canonicalDefinition.id!==skill||
        canonicalDefinition.passContract!==passContract)return null;
    }

    if(text(state.currentExperienceId)!==experienceId)return null;

    var evidencePackets=Object.freeze([]);
    var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
    var experiences=catalog&&typeof catalog.getExperiences==='function'
      ?catalog.getExperiences():Object.freeze([]);
    var scope=session.decision.assessmentScope,scopeApi=root.AdaptiveAssessmentScope;
    if(scopeApi&&(!scopeApi.valid(scope)||scope.learnerId!==greenProfile.id||scope.language!==text(input.language)))return null;
    var context=Object.freeze(Object.assign({},scope?{assessmentScope:scope,language:scope.language}:{},{
      skill:skill,
      currentExperience:experienceId,
      passContract:passContract,
      experiences:experiences,
      evidencePackets:evidencePackets
    }));

    var retention=root.SIYAYOVerbExplorerThinkingMindAssessmentSelection;
    var coordinator=root.SIYAYOVerbExplorerAdaptiveCoordinator;
    var previous=coordinator&&coordinator.snapshot&&coordinator.snapshot();
    var oldDefinition=input.previousDefinition;
    if(retention&&previous&&oldDefinition&&typeof retention.remember==='function')retention.remember(previous,oldDefinition);
    var configured=coordinatorConfig.configure({
      profile:greenProfile,
      session:session,
      context:context,
      getState:stateBridge.getState,
      getResumeState:typeof stateBridge.getResumeState==='function'
        ? stateBridge.getResumeState
        : stateBridge.getState,
      document:input.document
    });
    if(configured!==true)return null;

    return Object.freeze({
      status:experienceId==='preparing-dinner'?'S2_ACTIVE':
        experienceId==='having-dinner'?'S3_ACTIVE':'NEXT_SESSION_ACTIVE',
      session:session,
      experienceId:experienceId,
      skill:skill,
      state:state,
      context:context
    });
  }

  root.SIYAYOVerbExplorerNextSessionActivation=Object.freeze({activate:activate});
})(typeof globalThis!=='undefined'?globalThis:this);
