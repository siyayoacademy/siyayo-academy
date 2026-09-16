// Pure provenance bridge: translate an observed BUILD SENTENCE learner event into
// a context-scoped Choice mode signal. It does not submit Cycle or invent transfer.
(function(root){
'use strict';
function groundedContext(observation){
 if(!observation||!observation.currentExperienceId||!observation.experienceLanguage||observation.experienceQuestion==null||!observation.experienceChoiceCandidate)return null;
 return Object.freeze({
  currentExperienceId:observation.currentExperienceId,
  experienceLanguage:observation.experienceLanguage,
  experienceQuestion:observation.experienceQuestion,
  experienceChoiceCandidate:observation.experienceChoiceCandidate
 });
}
function fromObservation(observation,sensor){
 var context=groundedContext(observation);
 sensor=sensor||root.SIYAYOChoiceModeSensor;
 if(!context||!sensor||typeof sensor.observe!=='function')return null;
 var value=sensor.observe({
  type:observation.type,
  canonicalCandidate:observation.canonicalCandidate,
  systemStructure:observation.systemStructure,
  context:context
 });
 if(typeof value!=='string'||!value)return null;
 return Object.freeze({value:value,context:context});
}
root.SIYAYOVerbExplorerChoiceModeBridge=Object.freeze({fromObservation:fromObservation});
})(typeof globalThis!=='undefined'?globalThis:this);
