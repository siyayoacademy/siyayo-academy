// Transition-authorized next Session source.
// It consumes an already-authorized S1 -> S2 transition, reuses the retained
// longitudinal AdaptiveEvidenceProfile, and delegates S2 creation to the
// canonical Verb Explorer AdaptiveSessionSource. It does not rewrite S1,
// fabricate priorEvidence, or authorize transition itself.
(function(root){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function begin(input){
    input=input||{};
    var authorization=input.transitionAuthorization;
    var previousSession=input.previousSession;
    var evidenceProfileSource=root.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
    var sessionSource=root.SIYAYOVerbExplorerAdaptiveSessionSource;

    if(!authorization||authorization.status!=='transition-authorized')return null;
    if(!previousSession||!previousSession.decision)return null;
    if(!evidenceProfileSource||typeof evidenceProfileSource.getProfile!=='function')return null;
    if(!sessionSource||typeof sessionSource.begin!=='function')return null;

    var fromExperience=text(authorization.fromExperience);
    var toExperience=text(authorization.toExperience);
    var previousExperience=text(previousSession.decision.experienceId);
    var nextDecision=authorization.nextDecision||{};
    var selected=authorization.advanceSelection||{};

    if(!fromExperience||!toExperience||fromExperience===toExperience)return null;
    if(previousExperience!==fromExperience)return null;
    if(text(selected.fromExperience)!==fromExperience)return null;
    if(text(selected.experienceId)!==toExperience)return null;
    if(nextDecision.action!=='advance')return null;
    if(text(nextDecision.experienceId)!==toExperience)return null;

    var skill=text(nextDecision.skill);
    if(!skill)return null;

    var profile=evidenceProfileSource.getProfile();
    if(!profile||!Array.isArray(profile.observations))return null;

    var context={
      currentExperience:toExperience,
      skill:skill
    };

    var language=text(input.language);
    var chapter=text(input.chapter);
    if(language)context.language=language;
    if(chapter)context.chapter=chapter;

    return sessionSource.begin(profile,context);
  }

  root.SIYAYOVerbExplorerNextSessionSource=Object.freeze({begin:begin});
})(typeof globalThis!=='undefined'?globalThis:this);
