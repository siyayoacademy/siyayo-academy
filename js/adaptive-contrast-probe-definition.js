// Immutable definition of a contrast-review probe before learner interaction.
// It carries explicit pedagogical authority supplied by the caller; it does not
// infer meaning/language, evaluate a response, mutate evidence, or authorize NEXT.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOAdaptiveContrastProbeDefinition=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){ return String(value||'').trim(); }

  function create(probeContext, specification){
    if(!probeContext||!probeContext.pattern)return null;
    var key=text(probeContext.pattern.key);
    var occurrences=Number(probeContext.pattern.occurrences||0);
    if(!key||!Number.isFinite(occurrences)||occurrences<2)return null;

    specification=specification||{};
    var expectedLanguage=text(specification.expectedLanguage);
    var targetMeaning=text(specification.targetMeaning);
    var alternatives=Array.isArray(specification.alternatives)?specification.alternatives:[];
    if(!expectedLanguage||!targetMeaning||alternatives.length<2)return null;

    var seen=new Set();
    var normalized=[];
    for(var i=0;i<alternatives.length;i+=1){
      var item=alternatives[i]||{};
      var id=text(item.id);
      var language=text(item.language);
      var form=text(item.form);
      var meaning=text(item.meaning);
      if(!id||seen.has(id)||!language||!form||!meaning)return null;
      seen.add(id);
      normalized.push(Object.freeze({id:id,language:language,form:form,meaning:meaning}));
    }

    var expected=normalized.filter(function(item){
      return item.language===expectedLanguage&&item.meaning===targetMeaning;
    });
    if(expected.length!==1)return null;

    return Object.freeze({
      pattern:probeContext.pattern,
      experienceId:text(probeContext.experienceId)||null,
      expectedLanguage:expectedLanguage,
      targetMeaning:targetMeaning,
      alternatives:Object.freeze(normalized.slice()),
      expectedAlternativeId:expected[0].id
    });
  }

  return Object.freeze({create:create});
});
