// A WHY Attempt is assembled only from matching, observed Evidence.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveWhyContextualReasonProbeAttemptBoundary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  function text(value){return typeof value==='string'?value.trim():'';}
  function assemble(input){
    input=input||{};
    var event=input.learnerEvent,evidence=input.evidence;
    if(!event||!evidence||event.observed!==true||event.actor!=='learner'||
      event.intent!=='answer'||event.source!=='why-contextual-reason-probe-select'||
      evidence.skill!=='why.use.contextual-reason'||event.skill!==evidence.skill||
      !['question-function','reason-answer'].includes(event.dimension)||event.dimension!==evidence.dimension||
      !['local','transfer'].includes(event.mode)||
      (event.mode==='transfer'?'transfer':undefined)!==evidence.mode||
      !['pass','fail'].includes(evidence.result)||!text(evidence.support))return null;
    var details=evidence.context||{};
    for(var pair of [['occurrenceId','occurrenceId'],['experienceId','experienceId'],
      ['language','language'],['choice','selectedAlternativeId']]){
      if(!text(event[pair[0]])||event[pair[0]]!==details[pair[1]])return null;
    }
    var from=text(event.fromExperienceId);
    if(event.mode==='transfer'){
      if(event.dimension!=='reason-answer'||!from||from===event.experienceId||from!==details.fromExperienceId)return null;
    }else if(from||text(details.fromExperienceId))return null;
    return Object.freeze({occurrenceId:event.occurrenceId,skill:event.skill,
      dimension:event.dimension,mode:event.mode==='transfer'?'transfer':undefined,
      result:evidence.result,support:evidence.support,
      context:Object.freeze({occurrenceId:event.occurrenceId,experienceId:event.experienceId,
        fromExperienceId:from||null,language:event.language,selectedAlternativeId:event.choice})});
  }
  return Object.freeze({assemble:assemble});
});
