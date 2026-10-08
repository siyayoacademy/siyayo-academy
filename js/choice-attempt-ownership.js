// Pure ownership rule for Choice attempts.
// A learner choice occurrence may own choice-function evidence in the same grounded E/L/Q/C.
// Sentence-built mode remains a separate observation and is not silently attached to choice-select.
(function(root){
'use strict';
function key(c){
 if(!c||!c.currentExperienceId||!c.experienceLanguage||c.experienceQuestion==null||!c.experienceChoiceCandidate)return null;
 return [c.currentExperienceId,c.experienceLanguage,c.experienceQuestion,c.experienceChoiceCandidate].map(String).join('\u001f');
}
function contextFromChoice(event,state){
 if(!event||event.observed!==true||event.actor!=='learner'||event.source!=='choice-select'||!event.occurrenceId||!state)return null;
 var context=Object.freeze({
  currentExperienceId:state.currentExperienceId,
  experienceLanguage:state.experienceLanguage,
  experienceQuestion:state.experienceQuestion,
  experienceChoiceCandidate:state.experienceChoiceCandidate
 });
 if(!key(context))return null;
 if(event.experienceId&&String(event.experienceId)!==String(context.currentExperienceId))return null;
 if(event.question!=null&&String(event.question)!==String(context.experienceQuestion))return null;
 if(event.choice&&String(event.choice)!==String(context.experienceChoiceCandidate))return null;
 return Object.freeze({occurrenceId:String(event.occurrenceId),context:context});
}
function ownsEvidence(owner,evidence){
 if(!owner||!owner.occurrenceId||!evidence||evidence.dimension!=='choice-function')return false;
 var ownerKey=key(owner.context),evidenceKey=key(evidence.context);
 if(!ownerKey||ownerKey!==evidenceKey)return false;
 return !evidence.occurrenceId||String(evidence.occurrenceId)===String(owner.occurrenceId);
}
root.SIYAYOChoiceAttemptOwnership=Object.freeze({contextFromChoice:contextFromChoice,ownsEvidence:ownsEvidence});
})(typeof globalThis!=='undefined'?globalThis:this);
