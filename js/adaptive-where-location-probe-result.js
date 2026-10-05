(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhereLocationProbeResult=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(v){return typeof v==='string'?v.trim():'';}
  function evaluate(spec,event){
    if(!spec||!event||event.observed!==true||event.actor!=='learner'||event.intent!=='answer'||
      event.source!=='where-location-probe-select')return null;
    var skill='where.use.location-question',dimension=text(spec.dimension),mode=text(spec.mode),
      experienceId=text(spec.experienceId),from=text(spec.fromExperienceId),language=text(spec.language),
      occurrence=text(event.occurrenceId),choice=text(event.choice);
    if(spec.skill!==skill||!['spatial-function','location-answer'].includes(dimension)||
      !['local','transfer'].includes(mode)||!experienceId||!['en','es','pt'].includes(language)||
      !occurrence||!choice||event.skill!==skill||event.dimension!==dimension||event.mode!==mode||
      event.experienceId!==experienceId||event.language!==language)return null;
    if(mode==='transfer'){
      if(dimension!=='location-answer'||!from||from===experienceId||event.fromExperienceId!==from)return null;
    }else if(from||text(event.fromExperienceId))return null;
    var alternatives=spec.alternatives,expected=text(spec.expectedAlternativeId);
    if(!Array.isArray(alternatives)||alternatives.length<2||!expected||
      new Set(alternatives.map(function(x){return text(x&&x.id);})).size!==alternatives.length||
      alternatives.filter(function(x){return x&&x.id===choice;}).length!==1||
      alternatives.filter(function(x){return x&&x.id===expected;}).length!==1)return null;
    return Object.freeze({occurrenceId:occurrence,skill:skill,dimension:dimension,mode:mode,
      language:language,fromExperienceId:mode==='transfer'?from:null,experienceId:experienceId,
      selectedAlternativeId:choice,result:expected===choice?'pass':'fail'});
  }
  return Object.freeze({evaluate:evaluate});
});