// Explicit destination Skill switch at learner-owned S2 adoption.
// A previously authorized S1 transition and S2's canonical WHAT target are both required.
(function(root){
'use strict';
function text(value){return typeof value==='string'?value.trim():'';}
function prepare(input){
  input=input||{};
  var original=input.authorization,session=input.previousSession,language=text(input.language),event=input.learnerEvent;
  var catalog=root.SIYAYOVerbExplorerExperienceNavigation;
  var loader=root.SIYAYOVerbExplorerCanonicalSkillLoader;
  var source=root.SIYAYOVerbExplorerCanonicalSkillSource;
  var probes=root.AdaptiveWhatObjectQuestionProbeSpecificationSource;
  var boundary=root.AdaptiveSessionTransitionBoundary;
  var live=root.SIYAYOVerbExplorerWhatAssessmentLive;
  if(!event||event.observed!==true||event.actor!=='learner'||
    event.intent!=='continue-assessment'||event.source!=='pedagogical-session-adopt'||
    !text(event.occurrenceId)||!original||original.status!=='transition-authorized'||!session||!session.decision||
    !['en','es','pt'].includes(language)||!catalog||!loader||!source||!probes||!boundary||!live||
    typeof catalog.getExperience!=='function'||typeof catalog.getNouns!=='function'||
    typeof loader.load!=='function'||typeof source.getDefinition!=='function'||
    typeof source.adopt!=='function'||typeof probes.resolve!=='function'||
    typeof boundary.authorize!=='function'||typeof live.mount!=='function')return Promise.resolve(null);
  var from=text(original.fromExperience),to=text(original.toExperience);
  var previous=text(session.decision.skill),selected=original.advanceSelection||{};
  if(from!=='shopping-for-dinner'||to!=='preparing-dinner'||text(event.experienceId)!==to||
    from!==text(session.decision.experienceId)||previous!=='which.use.determiner'||
    text(original.nextDecision&&original.nextDecision.skill)!==previous||
    text(selected.fromExperience)!==from||text(selected.experienceId)!==to)return Promise.resolve(null);
  var destination=catalog.getExperience(to),next=destination&&catalog.getExperience(text(destination.toroidalNext&&destination.toroidalNext.nextExperience));
  var candidates=destination&&Array.isArray(destination.thinkingMind)
    ?destination.thinkingMind.filter(function(entry){return entry&&entry.questionWord==='what'&&entry.assessmentTarget;})
    :[];
  if(candidates.length!==1||!next)return Promise.resolve(null);
  var target=candidates[0].assessmentTarget;
  if(!target||target.skill!=='what.use.object-question'||
    target.definitionPath!=='data/learning/skills/what.json')return Promise.resolve(null);
  var previousDefinition=source.getDefinition();
  if(!previousDefinition||previousDefinition.id!==previous)return Promise.resolve(null);
  return Promise.resolve(loader.load(target.definitionPath)).then(function(loaded){
    if(loaded!==true)return null;
    var definition=source.getDefinition();
    var valid=definition&&definition.id===target.skill&&definition.passContract&&
      ['en','es','pt'].every(function(locale){return !!probes.resolve(definition,destination,next,catalog.getNouns(),locale);});
    if(!valid){source.adopt(previousDefinition);return null;}
    var authorization=boundary.authorize({currentSession:session,advanceSelection:selected,
      nextDecision:Object.freeze({action:'advance',experienceId:to,skill:target.skill,focus:'assessment'})});
    if(!authorization){source.adopt(previousDefinition);return null;}
    return Object.freeze({authorization:authorization,passContract:definition.passContract,
      previousDefinition:previousDefinition,target:target});
  }).catch(function(){source.adopt(previousDefinition);return null;});
}
root.SIYAYOVerbExplorerNextAssessmentTarget=Object.freeze({prepare:prepare});
})(typeof globalThis!=='undefined'?globalThis:this);
