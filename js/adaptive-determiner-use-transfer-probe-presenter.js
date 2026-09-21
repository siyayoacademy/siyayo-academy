// Pure presentation boundary for one canonical determiner-use transfer probe.
// It preserves explicit cross-Experience transfer metadata for routing, while
// hiding expected correctness from the learner surface. It does not observe
// learner actions, create Evidence/Attempt, mutate Session, grant Green Pass,
// or authorize navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDeterminerUseTransferProbePresenter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function present(specification){
    if(!specification||typeof specification!=='object')return null;

    var skill=text(specification.skill);
    var fromExperienceId=text(specification.fromExperienceId);
    var experienceId=text(specification.experienceId);
    var dimension=text(specification.dimension);
    var mode=text(specification.mode);
    var targetForm=text(specification.targetForm);
    var targetNoun=text(specification.targetNoun);
    var prompt=text(specification.prompt);
    var expectedAlternativeId=text(specification.expectedAlternativeId);
    var source=Array.isArray(specification.alternatives)?specification.alternatives:null;

    if(
      skill!=='which.use.determiner'||
      !fromExperienceId||
      !experienceId||
      fromExperienceId===experienceId||
      dimension!=='determiner-use'||
      mode!=='transfer'||
      targetForm!=='which'||
      !targetNoun||
      !prompt||
      !expectedAlternativeId||
      !source||
      source.length<2
    )return null;

    var seen=Object.create(null);
    var alternatives=[];
    for(var i=0;i<source.length;i+=1){
      var item=source[i]||{};
      var id=text(item.id);
      var label=text(item.label);
      if(!id||!label||seen[id])return null;
      seen[id]=true;
      alternatives.push(Object.freeze({id:id,label:label}));
    }

    if(!seen[expectedAlternativeId])return null;

    return Object.freeze({
      skill:skill,
      fromExperienceId:fromExperienceId,
      experienceId:experienceId,
      dimension:dimension,
      mode:'transfer',
      targetForm:targetForm,
      targetNoun:targetNoun,
      prompt:prompt,
      alternatives:Object.freeze(alternatives)
    });
  }

  return Object.freeze({present:present});
});
