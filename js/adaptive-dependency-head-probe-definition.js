// Canonical definition for an explicit learner task that asks for the head of
// one grounded dependency token. This module only defines the task. It does not
// render UI, observe learner actions, create Evidence/Attempt, score mastery,
// grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDependencyHeadProbeDefinition=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function create(structure,options){
    options=options||{};
    if(!structure||!Array.isArray(structure.tokens)||!Array.isArray(structure.relations))return null;

    var structureId=text(structure.id);
    var language=text(structure.language);
    var experienceId=text(options.experienceId);
    var targetTokenId=text(options.targetTokenId);
    var prompt=text(options.prompt);
    var alternativeTokenIds=Array.isArray(options.alternativeTokenIds)
      ? options.alternativeTokenIds.map(text)
      : null;

    if(!structureId||!language||!experienceId||!targetTokenId||!prompt||!alternativeTokenIds||alternativeTokenIds.length<2)return null;
    if(alternativeTokenIds.some(function(id){return !id;}))return null;

    var tokensById=Object.create(null);
    for(var i=0;i<structure.tokens.length;i+=1){
      var token=structure.tokens[i]||{};
      var id=text(token.id);
      var form=text(token.form);
      var wordClass=text(token.wordClass);
      if(!id||!form||!wordClass||tokensById[id])return null;
      tokensById[id]=Object.freeze({id:id,form:form,wordClass:wordClass});
    }

    var target=tokensById[targetTokenId];
    if(!target)return null;

    var incoming=[];
    for(var j=0;j<structure.relations.length;j+=1){
      var relation=structure.relations[j]||{};
      if(text(relation.dependent)!==targetTokenId)continue;
      var head=text(relation.head);
      var label=text(relation.relation);
      if(!head||!label||!tokensById[head])return null;
      incoming.push({head:head,relation:label});
    }

    if(incoming.length!==1)return null;

    var expectedHeadTokenId=incoming[0].head;
    var seen=Object.create(null);
    var alternatives=[];
    for(var k=0;k<alternativeTokenIds.length;k+=1){
      var alternativeId=alternativeTokenIds[k];
      if(seen[alternativeId]||alternativeId===targetTokenId)return null;
      var alternative=tokensById[alternativeId];
      if(!alternative)return null;
      seen[alternativeId]=true;
      alternatives.push(alternative);
    }

    if(!seen[expectedHeadTokenId])return null;

    return Object.freeze({
      status:'DEPENDENCY_HEAD_PROBE_READY',
      experienceId:experienceId,
      structureId:structureId,
      language:language,
      dimension:'head-identification',
      targetToken:target,
      prompt:prompt,
      expectedHeadTokenId:expectedHeadTokenId,
      relation:incoming[0].relation,
      alternatives:Object.freeze(alternatives.slice())
    });
  }

  return Object.freeze({create:create});
});
