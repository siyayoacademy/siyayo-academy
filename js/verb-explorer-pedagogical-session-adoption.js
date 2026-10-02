// Explicit pedagogical-session adoption boundary.
// Visiting an Experience is navigation. A transition authorization is only a
// candidate for S2. Activation requires a separate learner event that explicitly
// opts into continuing the pedagogical assessment in the already-visited target.
(function(root){
'use strict';
function text(v){return typeof v==='string'&&v.trim()?v.trim():null;}
function activate(input){
  input=input||{};
  var authorization=input.transitionAuthorization;
  var learnerEvent=input.learnerEvent;
  if(!authorization||authorization.status!=='transition-authorized')return null;
  if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;
  if(learnerEvent.intent!=='continue-assessment'||learnerEvent.source!=='pedagogical-session-adopt')return null;
  var to=text(authorization.toExperience), eventTo=text(learnerEvent.experienceId);
  if(!to||eventTo!==to)return null;

  var activation=root.SIYAYOVerbExplorerNextSessionActivation;
  if(!activation||typeof activation.activate!=='function')return null;
  return activation.activate({
    transitionAuthorization:authorization,
    previousSession:input.previousSession,
    previousDefinition:input.previousDefinition,
    passContract:input.passContract,
    language:input.language,
    chapter:input.chapter,
    document:input.document
  });
}
root.SIYAYOVerbExplorerPedagogicalSessionAdoption=Object.freeze({activate:activate});
})(typeof globalThis!=='undefined'?globalThis:this);
