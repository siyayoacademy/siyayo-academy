// Fail-closed handshake between canonical adaptive Session and grounded Verb Explorer state.
// Session owns pedagogical skill; Explorer state owns the observed interaction location.
(function(root){
'use strict';

function align(session,state){
  if(!session||!session.decision||!state)return null;

  var skill=session.decision.skill;
  var sessionExperience=session.decision.experienceId;
  var stateExperience=state.currentExperienceId;

  if(typeof skill!=='string'||!skill.trim())return null;
  if(typeof sessionExperience!=='string'||!sessionExperience.trim())return null;
  if(typeof stateExperience!=='string'||!stateExperience.trim())return null;
  if(sessionExperience!==stateExperience)return null;

  return Object.freeze({
    skill:skill,
    currentExperience:stateExperience
  });
}

root.SIYAYOVerbExplorerSessionStateBoundary=Object.freeze({align:align});
})(typeof globalThis!=='undefined'?globalThis:this);
