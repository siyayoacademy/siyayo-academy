// Fail-closed ownership boundary for one Dependency Head Probe Attempt.
// One observed learner occurrence may own only head-identification Evidence grounded
// in the same Experience/structure/target/selection. It does not invent mode,
// mutate Session state, grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDependencyHeadProbeAttemptBoundary=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function assemble(input){
    input=input||{};
    var event=input.learnerEvent;
    var evidence=input.evidence;
    if(!event||!evidence)return null;
    if(event.observed!==true||event.actor!=='learner')return null;
    if(text(event.source)!=='dependency-head-probe-select')return null;

    var occurrenceId=text(event.occurrenceId);
    var context=evidence.context||{};
    if(!occurrenceId||occurrenceId!==text(context.occurrenceId))return null;

    var skill=text(evidence.skill);
    if(!skill)return null;

    if(text(event.dimension)!=='head-identification'||text(evidence.dimension)!=='head-identification')return null;

    var experienceId=text(event.experienceId);
    if(!experienceId||experienceId!==text(context.experienceId))return null;

    var structureId=text(event.structureId);
    if(!structureId||structureId!==text(context.structureId))return null;

    var language=text(event.language);
    if(!language||language!==text(context.language))return null;

    var targetTokenId=text(event.targetTokenId);
    if(!targetTokenId||targetTokenId!==text(context.targetTokenId))return null;

    var choice=text(event.choice);
    var selected=text(context.selectedAlternativeId);
    if(!choice||choice!==selected)return null;

    var result=text(evidence.result);
    if(result!=='pass'&&result!=='fail')return null;

    var support=text(evidence.support);
    if(!support)return null;

    var ownedContext=Object.freeze({
      occurrenceId:occurrenceId,
      experienceId:experienceId,
      structureId:structureId,
      language:language,
      targetTokenId:targetTokenId,
      selectedAlternativeId:selected
    });

    return Object.freeze({
      occurrenceId:occurrenceId,
      skill:skill,
      dimension:'head-identification',
      result:result,
      support:support,
      context:ownedContext
    });
  }

  return Object.freeze({assemble:assemble});
});
