// Fail-closed boundary for assembling a Choice Attempt without borrowing sentence-built mode.
(function(root){
'use strict';
function key(c){
 if(!c||!c.currentExperienceId||!c.experienceLanguage||c.experienceQuestion==null||!c.experienceChoiceCandidate)return null;
 return [c.currentExperienceId,c.experienceLanguage,c.experienceQuestion,c.experienceChoiceCandidate].map(String).join('\u001f');
}
function assemble(input){
 input=input||{};
 var owner=input.owner,evidence=input.evidence,support=input.support,context=input.context;
 var ownership=input.ownership||root.SIYAYOChoiceAttemptOwnership;
 var contextKey=key(context);
 if(!contextKey||!owner||!owner.occurrenceId||!evidence||!support)return null;
 if(key(owner.context)!==contextKey||key(evidence.context)!==contextKey||key(support.context)!==contextKey)return null;
 if(!ownership||typeof ownership.ownsEvidence!=='function'||ownership.ownsEvidence(owner,evidence)!==true)return null;
 if(typeof evidence.result!=='string'||!evidence.result||typeof support.value!=='string'||!support.value)return null;
 if(support.occurrenceId&&String(support.occurrenceId)!==String(owner.occurrenceId))return null;
 var scoped=Object.freeze({
  currentExperienceId:context.currentExperienceId,
  experienceLanguage:context.experienceLanguage,
  experienceQuestion:context.experienceQuestion,
  experienceChoiceCandidate:context.experienceChoiceCandidate
 });
 return Object.freeze({
  occurrenceId:String(owner.occurrenceId),
  dimension:'choice-function',
  result:evidence.result,
  support:support.value,
  context:scoped
 });
}
root.SIYAYOChoiceAttemptBoundary=Object.freeze({assemble:assemble});
})(typeof globalThis!=='undefined'?globalThis:this);
