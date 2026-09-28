// Read-only S2 WHAT probe specifications. Neither responses nor Evidence are created here.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhatObjectQuestionProbeSpecificationSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function one(experience,word){
    var entries=experience&&Array.isArray(experience.thinkingMind)
      ?experience.thinkingMind.filter(function(entry){return entry&&entry.questionWord===word;})
      :[];
    return entries.length===1?entries[0]:null;
  }
  function noun(id,nouns,experience,language){
    if(!experience.links||!Array.isArray(experience.links.vocabulary)||!experience.links.vocabulary.includes(id))return null;
    var entries=nouns&&Array.isArray(nouns.items)?nouns.items:[];
    var found=entries.filter(function(item){return item&&item.id===id;});
    return found.length===1&&text(found[0].translations&&found[0].translations[language])?found[0]:null;
  }
  function freezeOptions(values){return Object.freeze(values.map(function(value){return Object.freeze(value);}));}
  function resolve(skill,local,transfer,nouns,language){
    if(!skill||skill.id!=='what.use.object-question'||!['en','es','pt'].includes(language))return null;
    var requires=skill.passContract&&skill.passContract.requires;
    if(!Array.isArray(requires)||requires.length!==3||
       requires[0].dimension!=='question-function'||requires[0].result!=='pass'||
       requires[1].dimension!=='object-answer'||requires[1].result!=='pass'||requires[1].support!=='none'||
       requires[2].dimension!=='object-answer'||requires[2].result!=='pass'||requires[2].mode!=='transfer'||requires[2].support!=='none')return null;
    if(!local||!transfer||!text(local.id)||!text(transfer.id)||local.id===transfer.id||
       !local.toroidalNext||local.toroidalNext.nextExperience!==transfer.id)return null;
    var what=one(local,'what'),where=one(local,'where'),later=one(transfer,'what');
    if(!what||!where||!later||what.intention!=='thing-or-action'||where.intention!=='place'||later.intention!=='thing-or-action')return null;
    if(!text(what.question&&what.question[language])||!text(where.question&&where.question[language])||!text(later.question&&later.question[language]))return null;
    if(!text(what.questionWordLabel&&what.questionWordLabel[language])||!text(where.questionWordLabel&&where.questionWordLabel[language]))return null;
    function answer(question,experience,mode){
      var grounding=question.answerGrounding;
      if(!grounding||!text(grounding.context&&grounding.context[language])||
         !Array.isArray(grounding.acceptedVocabularyIds)||!grounding.acceptedVocabularyIds.length||
         new Set(grounding.acceptedVocabularyIds).size!==grounding.acceptedVocabularyIds.length)return null;
      var accepted=grounding.acceptedVocabularyIds.map(function(id){return noun(id,nouns,experience,language);});
      if(accepted.some(function(value){return !value;}))return null;
      var excluded=new Set(grounding.acceptedVocabularyIds);
      var distractor=(experience.links.vocabulary||[]).map(function(id){return noun(id,nouns,experience,language);})
        .find(function(item){return item&&!excluded.has(item.id)&&
          (mode==='local'?!item.semanticTags.includes('vegetable'):item.id!=='salmon');});
      if(!distractor)return null;
      if(mode==='local'&&accepted.some(function(item){return !item.semanticTags.includes('vegetable');}))return null;
      return Object.freeze({skill:skill.id,experienceId:experience.id,fromExperienceId:mode==='transfer'?local.id:null,
        dimension:'object-answer',mode:mode,question:question.question[language],context:grounding.context[language],
        expectedAlternativeIds:Object.freeze(grounding.acceptedVocabularyIds.slice()),
        alternatives:freezeOptions(accepted.concat([distractor]).map(function(item){return {id:item.id,label:item.translations[language]};}))});
    }
    var situated=answer(what,local,'local'),cross=answer(later,transfer,'transfer');
    if(!situated||!cross)return null;
    return Object.freeze({
      functionProbe:Object.freeze({skill:skill.id,experienceId:local.id,dimension:'question-function',
        question:what.question[language],expectedAlternativeId:'what',
        alternatives:freezeOptions([{id:'what',label:what.questionWordLabel[language]},
          {id:'where',label:where.questionWordLabel[language]}])}),
      localProbe:situated,transferProbe:cross
    });
  }
  return Object.freeze({resolve:resolve});
});
