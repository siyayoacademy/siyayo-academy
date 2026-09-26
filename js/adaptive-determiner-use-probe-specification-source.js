// Canonical source for one local WHICH determiner-use microprobe.
// It derives only from an existing canonical Skill definition and active Experience.
// It does not observe learner behavior, create Evidence/Attempt, claim transfer,
// mutate Session state, grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseProbeSpecificationSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function freezeAlternatives(values){
    return Object.freeze(values.map(function(item){
      return Object.freeze({
        id:item.id,
        label:item.label
      });
    }));
  }

  function resolve(skillDefinition,experience,language){
    if(!skillDefinition||!experience)return null;
    if(text(language)!=='en')return null;
    if(text(skillDefinition.id)!=='which.use.determiner')return null;
    if(text(skillDefinition.form)!=='which')return null;
    if(text(skillDefinition.grammarRole)!=='interrogative-determiner')return null;
    if(!Array.isArray(skillDefinition.observes)||!skillDefinition.observes.includes('determiner-use'))return null;

    var entries=Array.isArray(experience.thinkingMind)
      ? experience.thinkingMind.filter(function(entry){
          return entry&&
            text(entry.questionWord)==='which'&&
            text(entry.intention)==='choice'&&
            entry.question&&
            typeof entry.question==='object'&&
            entry.choiceContext&&
            typeof entry.choiceContext==='object';
        })
      : [];

    if(entries.length!==1)return null;

    var entry=entries[0];
    var context=entry.choiceContext;
    var question=text(entry.question.en);
    var noun=text(context.focusVocabulary);
    if(!question||!noun)return null;

    var expectedPrefix='Which '+noun+' ';
    if(question.indexOf(expectedPrefix)!==0)return null;

    var remainder=question.slice(expectedPrefix.length);
    if(!remainder)return null;

    var tokens=remainder
      .replace(/[?!.]+$/,'')
      .split(/\s+/)
      .map(text)
      .filter(Boolean);

    if(tokens.length<3)return null;

    var distractors=[];
    for(var i=0;i<tokens.length&&distractors.length<3;i+=1){
      var token=tokens[i].toLowerCase();
      if(token!==noun.toLowerCase()&&!distractors.includes(token)){
        distractors.push(token);
      }
    }

    if(distractors.length!==3)return null;

    return Object.freeze({
      skill:'which.use.determiner',
      experienceId:text(experience.id),
      dimension:'determiner-use',
      targetForm:'which',
      targetNoun:noun,
      question:question,
      prompt:'Which ___ '+remainder,
      expectedAlternativeId:noun,
      alternatives:freezeAlternatives([
        {id:noun,label:noun},
        {id:distractors[0],label:distractors[0]},
        {id:distractors[1],label:distractors[1]},
        {id:distractors[2],label:distractors[2]}
      ])
    });
  }

  return Object.freeze({resolve:resolve});
});
