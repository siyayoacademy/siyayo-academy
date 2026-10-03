// Read-only bridge from an event-owned Choice Attempt to AdaptiveAttemptLoop evidence.
// It preserves occurrence/context as provenance and never invents pedagogical mode or skill.
(function(root){
'use strict';
function fromAttempt(input){
 input=input||{};
 var attempt=input.attempt,session=input.session;
 var loop=input.attemptLoop||root.AdaptiveAttemptLoop;
 if(!attempt||!attempt.occurrenceId||!attempt.context||!session||!session.decision||!session.decision.skill)return null;
 if(attempt.dimension!=='choice-function')return null;
 if(typeof attempt.result!=='string'||!attempt.result||typeof attempt.support!=='string'||!attempt.support)return null;
 if(Object.prototype.hasOwnProperty.call(attempt,'mode'))return null;
 if(!loop||typeof loop.toEvidencePacket!=='function')return null;
 var packet;
 try{
  packet=loop.toEvidencePacket(session,{
   skill:session.decision.skill,
   dimension:attempt.dimension,
   result:attempt.result,
   support:attempt.support,
   context:attempt.context
  });
 }catch(error){return null;}
 if(!packet||packet.skill!==session.decision.skill||Object.prototype.hasOwnProperty.call(packet,'mode'))return null;
 return Object.freeze({
  occurrenceId:String(attempt.occurrenceId),
  evidence:Object.freeze({
   skill:packet.skill,
   dimension:packet.dimension,
   result:packet.result,
   support:packet.support,
   context:packet.context
  })
 });
}
function groundObservedAttempt(input){
 input=input||{};
 var attempt=input.attempt,session=input.session,event=input.learnerEvent;
 if(!attempt||!session||!session.decision||!event)return null;
 if(event.observed!==true||event.actor!=='learner'||event.source!=='choice-select')return null;
 if(!event.occurrenceId||String(event.occurrenceId)!==String(attempt.occurrenceId))return null;
 var context=attempt.context||{};
 var experienceId=session.decision.experienceId;
 if(!experienceId||String(context.currentExperienceId)!==String(experienceId))return null;
 if(String(event.experienceId)!==String(experienceId))return null;
 if(String(event.question)!==String(context.experienceQuestion))return null;
 if(String(event.choice)!==String(context.experienceChoiceCandidate))return null;
 if(attempt.dimension!=='choice-function'||Object.prototype.hasOwnProperty.call(attempt,'mode'))return null;
 var groundedContext=Object.freeze(Object.assign({},context,{
  experienceId:String(experienceId),
  occurrenceId:String(event.occurrenceId)
 }));
 var grounded=Object.freeze(Object.assign({},attempt,{
  skill:String(session.decision.skill),
  context:groundedContext
 }));
 var packet=fromAttempt({attempt:grounded,session:session,attemptLoop:input.attemptLoop});
 if(!packet||packet.evidence.context!==groundedContext)return null;
 return grounded;
}
root.SIYAYOVerbExplorerChoiceEvidencePacketBridge=Object.freeze({
 fromAttempt:fromAttempt,groundObservedAttempt:groundObservedAttempt
});
})(typeof globalThis!=='undefined'?globalThis:this);
