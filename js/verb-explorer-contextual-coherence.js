// JAGUAR 90C.2 · Future-proof WHAT→HOW contextual coherence gate.
// Read-only authoring and presentation check; NOT an assessment engine.
(function(root,factory){
  var a=factory();
  if(typeof module==='object'&&module.exports)module.exports=a;
  else root.SIYAYOVerbExplorerContextualCoherence=a;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  var LANGS=['en','es','pt'];
  var pending={
    en:'Contextual WHY dialogue has not been authored for this tense and mode.',
    es:'El diálogo contextual de POR QUÉ aún no está redactado para este tiempo y modo.',
    pt:'O diálogo contextual de POR QUE ainda não foi elaborado para este tempo e modo.'
  };
  function value(x){return typeof x==='string'?x.trim():'';}
  function resolve({question,language,tense,form}={}){
    if(!question||question.questionWord!=='why'||!LANGS.includes(language))return null;
    var questionText=value(question.question&&question.question[language]);
    if(!questionText)return Object.freeze({status:'corpus-gap',reason:'missing-question'});
    if(tense!=='present'||form!=='affirmative')return Object.freeze({
      status:'not-authored',reason:'tense-mode-unsupported',notice:pending[language],
      tense:tense||'',form:form||''
    });
    // 90C.6: separate authored exploratory reference, never an assessment target.
    var presentation=question.presentationGrounding;
    if(presentation){
      if(presentation.kind!=='exploratory-causal-dialogue'||presentation.groundedIn!=='situation'||
        presentation.assessmentAuthority!==false||presentation.assessmentEvidence!==false||
        question.assessmentTarget||question.assessmentResumeTarget||
        presentation.tense!=='present'||presentation.form!=='affirmative')
        return Object.freeze({status:'corpus-gap',reason:'invalid-exploration-boundary'});
      var alternatives=presentation.alternatives||[],selected=alternatives.filter(function(a){return a&&a.id===presentation.referenceReasonId;});
      if(!Array.isArray(alternatives)||alternatives.length<2||new Set(alternatives.map(function(a){return a.id;})).size!==alternatives.length||selected.length!==1)
        return Object.freeze({status:'corpus-gap',reason:'invalid-exploration-reason'});
      var localized=alternatives.every(function(a){return value(a.response&&a.response[language]);});
      if(!localized)return Object.freeze({status:'corpus-gap',reason:'missing-exploration-translation'});
      return Object.freeze({status:'grounded',question:value(presentation.questionOverride&&presentation.questionOverride[language])||questionText,
        response:value(selected[0].response[language]),source:'presentationGrounding.referenceReasonId',
        reasonId:presentation.referenceReasonId,assessmentEvidence:false,greenPass:false,exploratory:true});
    }
    var ground=question.reasonGrounding,answers=ground&&ground.alternatives;
    if(!ground||ground.groundedIn!=='situation'||!Array.isArray(answers)||!value(ground.acceptedReasonId))
      return Object.freeze({status:'corpus-gap',reason:'missing-grounding'});
    var matches=answers.filter(function(a){return a&&a.id===ground.acceptedReasonId;});
    if(matches.length!==1)return Object.freeze({status:'corpus-gap',reason:'ambiguous-accepted-reason'});
    var responseText=value(matches[0].response&&matches[0].response[language]);
    if(!responseText)return Object.freeze({status:'corpus-gap',reason:'missing-localized-answer'});
    return Object.freeze({status:'grounded',question:questionText,response:responseText,
      source:'reasonGrounding.acceptedReasonId',reasonId:ground.acceptedReasonId,
      assessmentEvidence:false,greenPass:false});
  }
  function auditExperiences(experiences){
    var findings=[];
    for(var experience of experiences||[]){
      for(var question of experience.thinkingMind||[]){
        if(question.questionWord!=='why')continue;
        for(var language of LANGS){
          var result=resolve({question,language,tense:'present',form:'affirmative'});
          if(!result||result.status!=='grounded'||!result.response||!result.question)
            findings.push({experienceId:experience.id,language,reason:result&&result.reason||'invalid'});
          else if(!/^because\b/i.test(result.response)&&!/^porque\b/i.test(result.response))
            findings.push({experienceId:experience.id,language,reason:'reason-answer-does-not-start-with-causal-connector'});
        }
      }
    }
    return Object.freeze(findings);
  }
  return Object.freeze({resolve:resolve,auditExperiences:auditExperiences});
});
