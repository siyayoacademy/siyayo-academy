// WHY Evidence retains the explicit occurrence and external support provenance.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhyContextualReasonProbeEvidenceBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function fromResult(input){
    input=input||{};
    var result=input.result,event=input.learnerEvent,sensor=input.supportSensor;
    if(!result||!event||!sensor||typeof sensor.support!=='function'||
      event.observed!==true||event.actor!=='learner'||event.intent!=='answer'||
      event.source!=='why-contextual-reason-probe-select')return null;
    for(var key of ['occurrenceId','skill','dimension','mode','language','experienceId']){
      if(!text(result[key])||result[key]!==event[key])return null;
    }
    if(result.skill!=='why.use.contextual-reason'||
      !['question-function','reason-answer'].includes(result.dimension)||
      !['local','transfer'].includes(result.mode)||!['en','es','pt'].includes(result.language)||
      result.selectedAlternativeId!==event.choice||!['pass','fail'].includes(result.result))return null;
    var from=text(result.fromExperienceId);
    if(result.mode==='transfer'){
      if(result.dimension!=='reason-answer'||!from||from===result.experienceId||from!==event.fromExperienceId)return null;
    }else if(from||text(event.fromExperienceId))return null;
    var support=text(sensor.support(event));
    if(!support)return null;
    return Object.freeze({skill:result.skill,dimension:result.dimension,
      mode:result.mode==='transfer'?'transfer':undefined,result:result.result,support:support,
      context:Object.freeze({occurrenceId:result.occurrenceId,experienceId:result.experienceId,
        fromExperienceId:from||null,language:result.language,selectedAlternativeId:result.selectedAlternativeId})});
  }
  return Object.freeze({fromResult:fromResult});
});
