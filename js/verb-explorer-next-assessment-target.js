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
  var whatProbes=root.AdaptiveWhatObjectQuestionProbeSpecificationSource;
  var whyProbes=root.AdaptiveWhyContextualReasonProbeSpecificationSource;
  var boundary=root.AdaptiveSessionTransitionBoundary;
  var whatLive=root.SIYAYOVerbExplorerWhatAssessmentLive;
  var whyLive=root.SIYAYOVerbExplorerWhyAssessmentLive;
  if(!event||event.observed!==true||event.actor!=='learner'||
    event.intent!=='continue-assessment'||event.source!=='pedagogical-session-adopt'||
    !text(event.occurrenceId)||!original||original.status!=='transition-authorized'||!session||!session.decision||
    !['en','es','pt'].includes(language)||!catalog||!loader||!source||!boundary||
    typeof catalog.getExperience!=='function'||typeof catalog.getNouns!=='function'||
    typeof loader.load!=='function'||typeof source.getDefinition!=='function'||
    typeof source.adopt!=='function'||typeof boundary.authorize!=='function')return Promise.resolve(null);
  var from=text(original.fromExperience),to=text(original.toExperience);
  var previous=text(session.decision.skill),selected=original.advanceSelection||{};
  var s2=from==='shopping-for-dinner'&&to==='preparing-dinner'&&(previous==='which.use.determiner'||previous==='what.use.object-question');
  var s3=from==='preparing-dinner'&&to==='having-dinner'&&previous==='what.use.object-question';
  if((!s2&&!s3)||text(event.experienceId)!==to||
    from!==text(session.decision.experienceId)||
    text(original.nextDecision&&original.nextDecision.skill)!==previous||
    text(selected.fromExperience)!==from||text(selected.experienceId)!==to)return Promise.resolve(null);
  var destination=catalog.getExperience(to),next=destination&&catalog.getExperience(text(destination.toroidalNext&&destination.toroidalNext.nextExperience));
  var word=s2?'what':'why',skill=s2?'what.use.object-question':'why.use.contextual-reason';
  var path=s2?'data/learning/skills/what.json':'data/learning/skills/why.json';
  var probes=s2?whatProbes:whyProbes,live=s2?whatLive:whyLive;
  if(!probes||!live||typeof probes.resolve!=='function'||typeof live.mount!=='function')return Promise.resolve(null);
  var candidates=destination&&Array.isArray(destination.thinkingMind)
    ?destination.thinkingMind.filter(function(entry){return entry&&entry.questionWord===word&&entry.assessmentTarget;})
    :[];
  if(candidates.length!==1||!next)return Promise.resolve(null);
  var target=candidates[0].assessmentTarget;
  if(!target||target.skill!==skill||target.definitionPath!==path)return Promise.resolve(null);
  var previousDefinition=source.getDefinition();
  if(!previousDefinition||previousDefinition.id!==previous)return Promise.resolve(null);
  return Promise.resolve(loader.load(target.definitionPath)).then(function(loaded){
    if(loaded!==true)return null;
    var definition=source.getDefinition();
    var valid=definition&&definition.id===target.skill&&definition.passContract&&
      ['en','es','pt'].every(function(locale){return !!(s2
        ?probes.resolve(definition,destination,next,catalog.getNouns(),locale)
        :probes.resolve(definition,destination,next,locale));});
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
