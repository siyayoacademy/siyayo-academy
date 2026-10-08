// Pure comparison of a grounded WHY specification with one learner response.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhyContextualReasonProbeResult=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function evaluate(spec,event){
    if(!spec||!event||event.observed!==true||event.actor!=='learner'||event.intent!=='answer'||
      event.source!=='why-contextual-reason-probe-select')return null;
    var skill='why.use.contextual-reason',dimension=text(spec.dimension),mode=text(spec.mode),
      experienceId=text(spec.experienceId),from=text(spec.fromExperienceId),language=text(spec.language),
      occurrence=text(event.occurrenceId),choice=text(event.choice);
    if(spec.skill!==skill||!['question-function','reason-answer'].includes(dimension)||
      !['local','transfer'].includes(mode)||!experienceId||!['en','es','pt'].includes(language)||
      !occurrence||!choice||event.skill!==skill||event.dimension!==dimension||event.mode!==mode||
      event.experienceId!==experienceId||event.language!==language)return null;
    if(mode==='transfer'){
      if(dimension!=='reason-answer'||!from||from===experienceId||event.fromExperienceId!==from)return null;
    }else if(from||text(event.fromExperienceId))return null;
    var alternatives=spec.alternatives,expected=text(spec.expectedAlternativeId);
    if(!Array.isArray(alternatives)||alternatives.length<2||!expected||
      new Set(alternatives.map(function(item){return text(item&&item.id);})).size!==alternatives.length||
      alternatives.filter(function(item){return item&&item.id===choice;}).length!==1||
      alternatives.filter(function(item){return item&&item.id===expected;}).length!==1)return null;
    return Object.freeze({occurrenceId:occurrence,skill:skill,dimension:dimension,mode:mode,
      language:language,fromExperienceId:mode==='transfer'?from:null,experienceId:experienceId,
      selectedAlternativeId:choice,result:expected===choice?'pass':'fail'});
  }
  return Object.freeze({evaluate:evaluate});
});
