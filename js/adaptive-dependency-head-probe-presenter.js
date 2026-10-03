// Pure presentation boundary for an already-authorized Dependency Head Probe.
// It validates the canonical definition and projects only learner-facing data.
// It does not expose the expected head/relation, observe learner actions, create
// LearnerEvent/Evidence/Attempt, score mastery, grant Green Pass, authorize NEXT,
// or touch browser state.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDependencyHeadProbePresenter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function present(definition){
    if(!definition||typeof definition!=='object')return null;

    var status=text(definition.status);
    var experienceId=text(definition.experienceId);
    var structureId=text(definition.structureId);
    var language=text(definition.language);
    var dimension=text(definition.dimension);
    var prompt=text(definition.prompt);
    var expectedHeadTokenId=text(definition.expectedHeadTokenId);
    var relation=text(definition.relation);
    var target=definition.targetToken||{};
    var targetId=text(target.id);
    var targetForm=text(target.form);
    var targetWordClass=text(target.wordClass);
    var source=Array.isArray(definition.alternatives)?definition.alternatives:null;

    if(
      status!=='DEPENDENCY_HEAD_PROBE_READY'||
      !experienceId||
      !structureId||
      !language||
      dimension!=='head-identification'||
      !prompt||
      !expectedHeadTokenId||
      !relation||
      !targetId||
      !targetForm||
      !targetWordClass||
      !source||
      source.length<2
    )return null;

    var seen=Object.create(null);
    var alternatives=[];
    for(var i=0;i<source.length;i+=1){
      var item=source[i]||{};
      var id=text(item.id);
      var form=text(item.form);
      var wordClass=text(item.wordClass);
      if(!id||!form||!wordClass||seen[id]||id===targetId)return null;
      seen[id]=true;
      alternatives.push(Object.freeze({id:id,form:form,wordClass:wordClass}));
    }

    if(!seen[expectedHeadTokenId])return null;

    return Object.freeze({
      experienceId:experienceId,
      structureId:structureId,
      language:language,
      dimension:dimension,
      targetToken:Object.freeze({
        id:targetId,
        form:targetForm,
        wordClass:targetWordClass
      }),
      prompt:prompt,
      alternatives:Object.freeze(alternatives)
    });
  }

  return Object.freeze({present:present});
});
