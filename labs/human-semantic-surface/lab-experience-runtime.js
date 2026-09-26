// Human Semantic Surface Lab fixture only.
// Declares one explicit controlled Experience state for adaptive composition and
// records only observed learner Choice context needed by the read-only state bridge.
// It is not production navigation, persistence, Experience selection, Evidence, Attempt,
// Green Pass, or progression authority.
(function(root){
'use strict';

var state={
  currentExperienceId:'shopping-for-dinner',
  experienceLanguage:'en',
  experienceQuestion:null,
  experienceChoiceCandidate:null,
  experiencePerspective:null,
  experienceWordType:null
};

function captureContext(){
  return Object.assign({},state);
}

function observeChoice(event){
  if(!event||event.observed!==true||event.actor!=='learner')return false;
  if(event.source!=='choice-select'||event.type!=='learner-response')return false;
  if(typeof event.occurrenceId!=='string'||!event.occurrenceId)return false;
  if(String(event.experienceId||'')!==state.currentExperienceId)return false;
  if(typeof event.question!=='string'||!event.question.trim())return false;
  if(typeof event.choice!=='string'||!event.choice.trim())return false;

  state={
    currentExperienceId:state.currentExperienceId,
    experienceLanguage:'en',
    experienceQuestion:event.question.trim(),
    experienceChoiceCandidate:event.choice.trim(),
    experiencePerspective:event.perspective||null,
    experienceWordType:event.wordType||null
  };

  return true;
}

root.SIYAYOVerbExplorerResumeRuntime=Object.freeze({
  captureContext:captureContext,
  observeChoice:observeChoice
});
})(typeof globalThis!=='undefined'?globalThis:this);
