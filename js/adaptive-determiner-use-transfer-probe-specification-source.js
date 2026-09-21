// Canonical source for one cross-Experience WHICH determiner-use transfer probe.
// Transfer authority is granted only when a distinct target Experience exposes an
// explicit WHICH question with a new canonical noun grounded in that Experience.
// It does not observe learner behavior, create Evidence/Attempt, mutate Session,
// grant Green Pass, or authorize navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseTransferProbeSpecificationSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function freezeAlternatives(values){
    return Object.freeze(values.map(function(item){
      return Object.freeze({id:item.id,label:item.label});
    }));
  }

  function canonicalNounId(question,nouns,targetVocabulary){
    var items=nouns&&Array.isArray(nouns.items)?nouns.items:[];
    var vocabulary=Array.isArray(targetVocabulary)?targetVocabulary:[];
    var lower=text(question).toLowerCase();
    if(!lower.startsWith('which '))return null;

    var matches=items.filter(function(noun){
      var id=text(noun&&noun.id);
      var en=text(noun&&noun.translations&&noun.translations.en);
      return id&&en&&vocabulary.includes(id)&&lower.startsWith('which '+en.toLowerCase()+' ');
    });

    return matches.length===1?matches[0].id:null;
  }

  function resolve(skillDefinition,localSpecification,targetExperience,nouns,language){
    if(!skillDefinition||!localSpecification||!targetExperience||!nouns)return null;
    if(text(language)!=='en')return null;
    if(text(skillDefinition.id)!=='which.use.determiner')return null;
    if(text(skillDefinition.form)!=='which')return null;
    if(text(skillDefinition.grammarRole)!=='interrogative-determiner')return null;
    if(!Array.isArray(skillDefinition.observes)||!skillDefinition.observes.includes('determiner-use'))return null;

    var fromExperienceId=text(localSpecification.experienceId);
    var localTargetNoun=text(localSpecification.targetNoun);
    var experienceId=text(targetExperience.id);
    if(!fromExperienceId||!experienceId||experienceId===fromExperienceId)return null;

    var entries=Array.isArray(targetExperience.thinkingMind)
      ? targetExperience.thinkingMind.filter(function(entry){
          return entry&&
            text(entry.questionWord)==='which'&&
            text(entry.intention)==='choice'&&
            entry.question&&
            typeof entry.question==='object'&&
            !entry.choiceContext;
        })
      : [];
    if(entries.length!==1)return null;

    var question=text(entries[0].question.en);
    if(!question)return null;

    var nounId=canonicalNounId(
      question,
      nouns,
      targetExperience.links&&targetExperience.links.vocabulary
    );
    if(!nounId||nounId===localTargetNoun)return null;

    var noun=(nouns.items||[]).find(function(item){return text(item&&item.id)===nounId;});
    var nounText=text(noun&&noun.translations&&noun.translations.en);
    if(!nounText)return null;

    var expectedPrefix='Which '+nounText+' ';
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
      if(token!==nounText.toLowerCase()&&!distractors.includes(token)){
        distractors.push(token);
      }
    }
    if(distractors.length!==3)return null;

    return Object.freeze({
      skill:'which.use.determiner',
      fromExperienceId:fromExperienceId,
      experienceId:experienceId,
      dimension:'determiner-use',
      mode:'transfer',
      targetForm:'which',
      targetNoun:nounId,
      question:question,
      prompt:'Which ___ '+remainder,
      expectedAlternativeId:nounId,
      alternatives:freezeAlternatives([
        {id:nounId,label:nounText},
        {id:distractors[0],label:distractors[0]},
        {id:distractors[1],label:distractors[1]},
        {id:distractors[2],label:distractors[2]}
      ])
    });
  }

  return Object.freeze({resolve:resolve});
});
