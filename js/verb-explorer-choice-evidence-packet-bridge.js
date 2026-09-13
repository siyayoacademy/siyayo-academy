// Read-only bridge from an event-owned Choice Attempt to AdaptiveAttemptLoop evidence.
// It preserves occurrence/context as provenance and never invents pedagogical mode.
(function(root){
'use strict';
function fromAttempt(input){
 input=input||{};
 var attempt=input.attempt,session=input.session;
 var loop=input.attemptLoop||root.AdaptiveAttemptLoop;
 if(!attempt||!attempt.occurrenceId||!attempt.context||!session||!session.decision)return null;
 if(attempt.dimension!=='choice-function')return null;
 if(typeof attempt.result!=='string'||!attempt.result||typeof attempt.support!=='string'||!attempt.support)return null;
 if(Object.prototype.hasOwnProperty.call(attempt,'mode'))return null;
 if(!loop||typeof loop.toEvidencePacket!=='function')return null;
 var packet;
 try{
  packet=loop.toEvidencePacket(session,{
   skill:input.skill||session.decision.skill||null,
   dimension:attempt.dimension,
   result:attempt.result,
   support:attempt.support,
   context:attempt.context
  });
 }catch(error){return null;}
 if(!packet||Object.prototype.hasOwnProperty.call(packet,'mode'))return null;
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
root.SIYAYOVerbExplorerChoiceEvidencePacketBridge=Object.freeze({fromAttempt:fromAttempt});
})(typeof globalThis!=='undefined'?globalThis:this);
