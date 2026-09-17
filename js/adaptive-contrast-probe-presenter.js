// Pure presentation boundary for an already-authorized contrast ProbeDefinition.
// It does not infer K, choose correctness, observe learner actions, mutate evidence,
// grant Green Pass, authorize NEXT, or touch browser state.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SIYAYOAdaptiveContrastProbePresenter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function present(definition){
    if(!definition||typeof definition!=='object')return null;
    var pattern=definition.pattern;
    var patternKey=text(pattern&&pattern.key);
    var experienceId=text(definition.experienceId);
    var expectedLanguage=text(definition.expectedLanguage);
    var targetMeaning=text(definition.targetMeaning);
    var expectedAlternativeId=text(definition.expectedAlternativeId);
    var source=Array.isArray(definition.alternatives)?definition.alternatives:null;
    if(!patternKey||!expectedLanguage||!targetMeaning||!expectedAlternativeId||!source||source.length<2)return null;

    var seen=Object.create(null);
    var alternatives=[];
    for(var i=0;i<source.length;i+=1){
      var item=source[i]||{};
      var id=text(item.id);
      var language=text(item.language);
      var form=text(item.form);
      var meaning=text(item.meaning);
      if(!id||!language||!form||!meaning||seen[id])return null;
      seen[id]=true;
      alternatives.push(Object.freeze({id:id,language:language,form:form,meaning:meaning}));
    }
    if(!seen[expectedAlternativeId])return null;

    return Object.freeze({
      pattern:Object.freeze({key:patternKey,occurrences:pattern.occurrences}),
      experienceId:experienceId||null,
      expectedLanguage:expectedLanguage,
      targetMeaning:targetMeaning,
      alternatives:Object.freeze(alternatives)
    });
  }

  return Object.freeze({present:present});
});
