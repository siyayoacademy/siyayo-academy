(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhereLocationProbeSpecificationSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  var skillId='where.use.location-question',definitionPath='data/learning/skills/where.json';
  function text(v){return typeof v==='string'?v.trim():'';}
  function canonicalTarget(target){
    return !!(target&&target.skill===skillId&&target.definitionPath===definitionPath);
  }
  function one(experience,word){
    var entries=experience&&Array.isArray(experience.thinkingMind)?experience.thinkingMind.filter(function(x){return x&&x.questionWord===word;}):[];
    return entries.length===1?entries[0]:null;
  }
  function record(map,id){
    var rows=map&&Array.isArray(map.records)?map.records:[];
    var found=rows.filter(function(x){return x&&x.experienceId===id;});
    return found.length===1?found[0]:null;
  }
  function resolve(skill,local,transfer,grounding,language){
    if(!skill||skill.id!==skillId||skill.status!=='isolated-candidate'||
       !['en','es','pt'].includes(language))return null;
    var realization=skill.realizations&&skill.realizations[language];
    if(!realization||!text(realization.locationForm))return null;
    var req=skill.passContract&&skill.passContract.requires;
    if(!Array.isArray(req)||req.length!==3||
      req[0].dimension!=='spatial-function'||req[0].result!=='pass'||
      req[1].dimension!=='location-answer'||req[1].result!=='pass'||req[1].mode!=='local'||req[1].support!=='none'||
      req[2].dimension!=='location-answer'||req[2].result!=='pass'||req[2].mode!=='transfer'||req[2].support!=='none')return null;
    if(!local||!transfer||local.id!=='shopping-for-dinner'||transfer.id!=='preparing-dinner'||
      !skill.grounding||skill.grounding.localOrigin!==local.id||skill.grounding.transferDestination!==transfer.id||
      skill.grounding.answerMap!=='data/learning/where-spatial-answer-grounding.json'||
      !local.toroidalNext||local.toroidalNext.nextExperience!==transfer.id)return null;
    var here=one(local,'where'),later=one(transfer,'where');
    if(!here||!later||!canonicalTarget(here.assessmentTarget)||here.assessmentResumeTarget||
      later.assessmentTarget||!canonicalTarget(later.assessmentResumeTarget))return null;
    if(here.intention!=='place'||later.intention!=='place')return null;
    var localRow=record(grounding,local.id),transferRow=record(grounding,transfer.id);
    if(!localRow||!transferRow||localRow.subtype!=='location'||transferRow.subtype!=='location'||
      localRow.modeCandidate!=='local'||transferRow.modeCandidate!=='transfer')return null;
    function answer(q,row,experience,mode){
      var answer=text(row.answer&&row.answer[language]),phrase=text(row.spatialPhrase&&row.spatialPhrase[language]);
      var other=text(row.nonLocationAnswer&&row.nonLocationAnswer[language]);
      if(!answer||!phrase||!other||other===answer||!text(q.question&&q.question[language]))return null;
      return Object.freeze({
        skill:skill.id,language:language,experienceId:experience.id,
        fromExperienceId:mode==='transfer'?local.id:null,
        dimension:'location-answer',mode:mode,
        question:q.question[language],expectedAlternativeId:'grounded-location',
        alternatives:Object.freeze([
          Object.freeze({id:'grounded-location',label:answer,spatialPhrase:phrase}),
          Object.freeze({id:'non-location',label:other})
        ])
      });
    }
    var situated=answer(here,localRow,local,'local'),cross=answer(later,transferRow,transfer,'transfer');
    if(!situated||!cross)return null;
    return Object.freeze({
      functionProbe:Object.freeze({
        skill:skill.id,language:language,experienceId:local.id,fromExperienceId:null,
        dimension:'spatial-function',mode:'local',question:here.question[language],
        expectedAlternativeId:'location',
        alternatives:Object.freeze([
          Object.freeze({id:'location',label:realization.locationForm}),
          Object.freeze({id:'destination',label:(realization.destinationForms||['destination'])[0]})
        ])
      }),
      localProbe:situated,transferProbe:cross
    });
  }
  return Object.freeze({resolve:resolve});
});
