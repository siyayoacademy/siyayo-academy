// Exact, fail-closed authority for a previously observed contrast pattern.
// It does not infer a specification from K, diagnose interference, create a
// ProbeDefinition, observe a learner event, evaluate an answer, or authorize NEXT.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOAdaptiveContrastProbeSpecificationSource=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){return String(value||'').trim();}

  function patternKey(pattern){
    return text(typeof pattern==='string'?pattern:pattern&&pattern.key);
  }

  function catalogItems(catalog){
    if(Array.isArray(catalog))return catalog;
    return catalog&&Array.isArray(catalog.items)?catalog.items:null;
  }

  function freezeSpecification(item){
    var expectedLanguage=text(item.expectedLanguage);
    var targetMeaning=text(item.targetMeaning);
    var alternatives=Array.isArray(item.alternatives)?item.alternatives:[];
    if(!expectedLanguage||!targetMeaning||alternatives.length<2)return null;

    var ids=new Set();
    var normalized=[];
    for(var i=0;i<alternatives.length;i+=1){
      var alternative=alternatives[i]||{};
      var id=text(alternative.id);
      var language=text(alternative.language);
      var form=text(alternative.form);
      var meaning=text(alternative.meaning);
      if(!id||ids.has(id)||!language||!form||!meaning)return null;
      ids.add(id);
      normalized.push(Object.freeze({id:id,language:language,form:form,meaning:meaning}));
    }

    var expected=normalized.filter(function(alternative){
      return alternative.language===expectedLanguage&&alternative.meaning===targetMeaning;
    });
    if(expected.length!==1)return null;

    return Object.freeze({
      expectedLanguage:expectedLanguage,
      targetMeaning:targetMeaning,
      alternatives:Object.freeze(normalized)
    });
  }

  function resolve(pattern,catalog){
    var key=patternKey(pattern);
    var items=catalogItems(catalog);
    if(!key||!items)return null;
    var matches=items.filter(function(item){
      return item&&text(item.patternKey)===key;
    });
    if(matches.length!==1)return null;
    return freezeSpecification(matches[0]);
  }

  return Object.freeze({resolve:resolve});
});
