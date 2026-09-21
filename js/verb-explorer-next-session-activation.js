// Grounded activation boundary for a transition-authorized next Session.
// It composes existing authorities: retained Green Profile, canonical S2 birth,
// live Experience movement, grounded State, and Coordinator configuration.
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

    var transitionRuntime=root.SIYAYOVerbExplorerTransitionRuntime;
    var nextSessionSource=root.SIYAYOVerbExplorerNextSessionSource;
    var profileSource=root.SIYAYOVerbExplorerAdaptiveProfileSource;
    var stateBridge=root.SIYAYOVerbExplorerAdaptiveStateBridge;
    var coordinatorConfig=root.SIYAYOVerbExplorerAdaptiveCoordinatorConfig;

    if(!transitionRuntime||typeof transitionRuntime.execute!=='function')return null;
    if(!nextSessionSource||typeof nextSessionSource.begin!=='function')return null;
    if(!profileSource||typeof profileSource.getProfile!=='function')return null;
    if(!stateBridge||typeof stateBridge.getState!=='function')return null;
    if(!coordinatorConfig||typeof coordinatorConfig.configure!=='function')return null;

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

    var execution=transitionRuntime.execute(authorization);
    if(!execution||execution.status!=='TRANSITION_EXECUTED')return null;

    var state=stateBridge.getState();
    if(!state||text(state.currentExperienceId)!==experienceId)return null;

    var evidencePackets=Object.freeze([]);
    var context=Object.freeze({
      skill:skill,
      currentExperience:experienceId,
      passContract:passContract,
      evidencePackets:evidencePackets
    });

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
      status:'S2_ACTIVE',
      session:session,
      experienceId:experienceId,
      skill:skill,
      state:execution.state||state,
      context:context
    });
  }

  root.SIYAYOVerbExplorerNextSessionActivation=Object.freeze({activate:activate});
})(typeof globalThis!=='undefined'?globalThis:this);
