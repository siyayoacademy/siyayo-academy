(function(root){
'use strict';
function contextKey(c){
 if(!c||!c.currentExperienceId||!c.experienceLanguage||c.experienceQuestion==null||!c.experienceChoiceCandidate)return null;
 return [c.currentExperienceId,c.experienceLanguage,c.experienceQuestion,c.experienceChoiceCandidate].map(String).join('\u001f');
}
function assemble(input){
 input=input||{};
 var event=input.learnerEvent,evidence=input.evidence,support=input.support,mode=input.mode,context=input.context;
 var key=contextKey(context);
 if(!key||!event||!event.occurrenceId||!evidence||!support||!mode)return null;
 if(contextKey(evidence.context)!==key||contextKey(support.context)!==key||contextKey(mode.context)!==key)return null;
 if(evidence.occurrenceId&&evidence.occurrenceId!==event.occurrenceId)return null;
 if(support.occurrenceId&&support.occurrenceId!==event.occurrenceId)return null;
 if(mode.occurrenceId&&mode.occurrenceId!==event.occurrenceId)return null;
 if(typeof evidence.dimension!=='string'||!evidence.dimension||typeof evidence.result!=='string'||!evidence.result)return null;
 if(typeof support.value!=='string'||!support.value||typeof mode.value!=='string'||!mode.value)return null;
 var scoped=Object.freeze({
  currentExperienceId:context.currentExperienceId,
  experienceLanguage:context.experienceLanguage,
  experienceQuestion:context.experienceQuestion,
  experienceChoiceCandidate:context.experienceChoiceCandidate
 });
 return Object.freeze({
  occurrenceId:String(event.occurrenceId),
  dimension:evidence.dimension,
  result:evidence.result,
  support:support.value,
  mode:mode.value,
  context:scoped
 });
}
root.SIYAYOChoiceAttemptSource=Object.freeze({assemble:assemble});
})(typeof globalThis!=='undefined'?globalThis:this);
