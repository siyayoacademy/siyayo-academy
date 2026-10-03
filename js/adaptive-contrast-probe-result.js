// Evaluates one already-observed learner choice against a pre-existing contrast
// probe definition. It does not infer alternatives, create learner events, mutate
// evidence/session state, grant Green Pass, or authorize navigation.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SIYAYOAdaptiveContrastProbeResult=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){ return String(value||'').trim(); }

  function evaluate(definition,learnerEvent){
    if(!definition||!definition.pattern||!Array.isArray(definition.alternatives))return null;
    if(!text(definition.pattern.key)||!text(definition.expectedLanguage)||!text(definition.targetMeaning))return null;
    if(!learnerEvent||learnerEvent.observed!==true||learnerEvent.actor!=='learner')return null;
    var occurrenceId=text(learnerEvent.occurrenceId);
    var choice=text(learnerEvent.choice);
    if(!occurrenceId||!choice)return null;

    var expectedExperience=text(definition.experienceId);
    var eventExperience=text(learnerEvent.experienceId||learnerEvent.currentExperienceId);
    if(expectedExperience&&eventExperience!==expectedExperience)return null;

    var selected=definition.alternatives.find(function(item){ return item&&text(item.id)===choice; });
    if(!selected)return null;

    var selectedLanguage=text(selected.language);
    var selectedMeaning=text(selected.meaning);
    var selectedForm=text(selected.form);
    if(!selectedLanguage||!selectedMeaning||!selectedForm)return null;

    return Object.freeze({
      occurrenceId:occurrenceId,
      expectedLanguage:text(definition.expectedLanguage),
      selectedLanguage:selectedLanguage,
      meaningCorrect:selectedMeaning===text(definition.targetMeaning),
      formCorrect:selectedLanguage===text(definition.expectedLanguage)&&choice===text(definition.expectedAlternativeId),
      selectedAlternativeId:choice
    });
  }

  return Object.freeze({evaluate:evaluate});
});
