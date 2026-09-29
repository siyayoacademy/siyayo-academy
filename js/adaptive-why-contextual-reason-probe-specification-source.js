// Read-only S3 WHY specifications. No learner response or Evidence is created here.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhyContextualReasonProbeSpecificationSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function one(experience,word){
    var entries=experience&&Array.isArray(experience.thinkingMind)
      ?experience.thinkingMind.filter(function(entry){return entry&&entry.questionWord===word;}):[];
    return entries.length===1?entries[0]:null;
  }
  function options(alternatives,language){
    return Object.freeze(alternatives.map(function(item){
      return Object.freeze({id:item.id,label:item.response[language]});
    }));
  }
  function reason(question,experience,origin,mode,language,skill){
    var grounding=question.reasonGrounding;
    if(!grounding||grounding.groundedIn!=='situation'||
      !text(experience.situation&&experience.situation[language])||
      !text(grounding.acceptedReasonId)||!Array.isArray(grounding.alternatives)||
      grounding.alternatives.length<2)return null;
    var alternatives=grounding.alternatives,ids=alternatives.map(function(item){return text(item&&item.id);});
    if(ids.some(function(id){return !id;})||new Set(ids).size!==ids.length||
      !ids.includes(grounding.acceptedReasonId)||
      alternatives.some(function(item){return !text(item.response&&item.response[language]);}))return null;
    return Object.freeze({skill:skill.id,language:language,experienceId:experience.id,
      fromExperienceId:mode==='transfer'?origin.id:null,dimension:'reason-answer',mode:mode,
      question:question.question[language],context:experience.situation[language],
      expectedAlternativeId:grounding.acceptedReasonId,alternatives:options(alternatives,language)});
  }
  function resolve(skill,local,transfer,language){
    if(!skill||skill.id!=='why.use.contextual-reason'||!['en','es','pt'].includes(language)||
      !Array.isArray(skill.observes)||!skill.observes.includes('question-function')||
      !skill.observes.includes('reason-answer'))return null;
    var requires=skill.passContract&&skill.passContract.requires;
    if(!Array.isArray(requires)||requires.length!==3||
      requires[0].dimension!=='question-function'||requires[0].result!=='pass'||
      requires[1].dimension!=='reason-answer'||requires[1].result!=='pass'||requires[1].support!=='none'||
      requires[2].dimension!=='reason-answer'||requires[2].result!=='pass'||
      requires[2].mode!=='transfer'||requires[2].support!=='none')return null;
    if(!local||!transfer||!text(local.id)||!text(transfer.id)||local.id===transfer.id||
      !local.toroidalNext||local.toroidalNext.nextExperience!==transfer.id)return null;
    var why=one(local,'why'),how=one(local,'how'),later=one(transfer,'why');
    if(!why||!how||!later||why.intention!=='reason'||how.intention!=='manner'||later.intention!=='reason'||
      !why.assessmentTarget||why.assessmentTarget.skill!==skill.id||
      why.assessmentTarget.definitionPath!=='data/learning/skills/why.json'||
      later.assessmentTarget)return null;
    if(!text(why.question&&why.question[language])||!text(how.question&&how.question[language])||
      !text(later.question&&later.question[language])||
      !text(why.questionWordLabel&&why.questionWordLabel[language])||
      !text(how.questionWordLabel&&how.questionWordLabel[language]))return null;
    var situated=reason(why,local,local,'local',language,skill);
    var cross=reason(later,transfer,local,'transfer',language,skill);
    if(!situated||!cross||situated.expectedAlternativeId===cross.expectedAlternativeId)return null;
    return Object.freeze({
      functionProbe:Object.freeze({skill:skill.id,language:language,experienceId:local.id,
        fromExperienceId:null,dimension:'question-function',mode:'local',
        question:why.question[language],context:local.situation[language],expectedAlternativeId:'why',
        alternatives:Object.freeze([Object.freeze({id:'why',label:why.questionWordLabel[language]}),
          Object.freeze({id:'how',label:how.questionWordLabel[language]})])}),
      localProbe:situated,transferProbe:cross
    });
  }
  return Object.freeze({resolve:resolve});
});
