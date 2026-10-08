// Read-only bridge from a grounded Dependency Head Probe Result plus
// occurrence-scoped support to canonical adaptive Evidence.
// Skill authority belongs exclusively to session.decision.skill.
// This bridge does not create LearnerEvent/Attempt, infer skill from Experience,
// invent mode, mutate Session state, grant Green Pass, or authorize progression.
(function(root,factory){
  var api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.AdaptiveDependencyHeadProbeEvidenceBridge=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function fromResult(input){
    input=input||{};
    var result=input.result;
    var learnerEvent=input.learnerEvent;
    var session=input.session;
    var supportSensor=input.supportSensor;
    var loop=input.attemptLoop||root.AdaptiveAttemptLoop;

    if(!result||!learnerEvent||!session||!session.decision)return null;
    if(!supportSensor||typeof supportSensor.support!=='function')return null;
    if(!loop||typeof loop.toEvidencePacket!=='function')return null;

    var skill=text(session.decision.skill);
    if(!skill)return null;

    var sessionExperience=text(session.decision.experienceId);
    var experienceId=text(result.experienceId);
    if(!experienceId||!sessionExperience||experienceId!==sessionExperience)return null;

    var occurrenceId=text(result.occurrenceId);
    if(!occurrenceId||occurrenceId!==text(learnerEvent.occurrenceId))return null;

    if(text(result.dimension)!=='head-identification'||text(learnerEvent.dimension)!=='head-identification')return null;
    if(text(learnerEvent.source)!=='dependency-head-probe-select')return null;
    if(text(result.structureId)!==text(learnerEvent.structureId))return null;
    if(text(result.language)!==text(learnerEvent.language))return null;
    if(text(result.targetTokenId)!==text(learnerEvent.targetTokenId))return null;
    if(text(result.selectedAlternativeId)!==text(learnerEvent.choice))return null;

    var outcome=text(result.result);
    if(outcome!=='pass'&&outcome!=='fail')return null;

    var support=text(supportSensor.support(learnerEvent));
    if(!support)return null;

    var context=Object.freeze({
      occurrenceId:occurrenceId,
      experienceId:experienceId,
      structureId:text(result.structureId),
      language:text(result.language),
      targetTokenId:text(result.targetTokenId),
      selectedAlternativeId:text(result.selectedAlternativeId)
    });

    var packet;
    try{
      packet=loop.toEvidencePacket(session,{
        skill:skill,
        dimension:'head-identification',
        result:outcome,
        support:support,
        context:context
      });
    }catch(error){
      return null;
    }

    if(!packet||text(packet.skill)!==skill)return null;
    if(text(packet.dimension)!=='head-identification')return null;
    if(text(packet.result)!==outcome)return null;
    if(text(packet.support)!==support)return null;
    if(Object.prototype.hasOwnProperty.call(packet,'mode'))return null;

    return Object.freeze({
      skill:skill,
      dimension:'head-identification',
      result:outcome,
      support:support,
      context:context
    });
  }

  return Object.freeze({fromResult:fromResult});
});
