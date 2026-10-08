// Pure comparison of a canonical WHAT probe with one observed learner response.
// No Evidence, Session mutation, Green Pass or navigation is performed here.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhatObjectQuestionProbeResult=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function evaluate(spec,event){
    if(!spec||!event||event.observed!==true||event.actor!=='learner'||event.intent!=='answer'||
       event.source!=='what-object-question-probe-select')return null;
    var skill='what.use.object-question',dimension=text(spec.dimension),mode=text(spec.mode),
      experienceId=text(spec.experienceId),from=text(spec.fromExperienceId),language=text(spec.language),
      occurrence=text(event.occurrenceId),choice=text(event.choice);
    if(spec.skill!==skill||!['question-function','object-answer'].includes(dimension)||
       !['local','transfer'].includes(mode)||!experienceId||!['en','es','pt'].includes(language)||
       !occurrence||!choice||event.skill!==skill||event.dimension!==dimension||event.mode!==mode||
       event.experienceId!==experienceId||event.language!==language)return null;
    if(mode==='transfer'){
      if(dimension!=='object-answer'||!from||from===experienceId||event.fromExperienceId!==from)return null;
    }else if(from||text(event.fromExperienceId))return null;
    var alternatives=spec.alternatives;
    if(!Array.isArray(alternatives)||alternatives.length<2||
       alternatives.filter(function(item){return item&&item.id===choice;}).length!==1)return null;
    var expected=dimension==='question-function'
      ?[text(spec.expectedAlternativeId)]
      :spec.expectedAlternativeIds;
    if(!Array.isArray(expected)||!expected.length||expected.some(function(id){
      return !text(id)||alternatives.filter(function(item){return item&&item.id===id;}).length!==1;
    }))return null;
    return Object.freeze({occurrenceId:occurrence,skill:skill,dimension:dimension,mode:mode,
      language:language,fromExperienceId:mode==='transfer'?from:null,experienceId:experienceId,
      selectedAlternativeId:choice,result:expected.includes(choice)?'pass':'fail'});
  }
  return Object.freeze({evaluate:evaluate});
});
