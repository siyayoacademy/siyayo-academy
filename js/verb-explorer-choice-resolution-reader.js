// Read-only seam from the already-rendered Choice result to the adaptive layer.
// It never calls the resolver and never infers a learner result from the click alone.
(function(root){
  'use strict';

  function read(state,doc){
    doc=doc||(typeof document!=='undefined'?document:null);
    if(!doc||!state||!state.currentExperienceId||!state.experienceLanguage||state.experienceQuestion==null||!state.experienceChoiceCandidate)return null;

    var feedback=doc.getElementById('choiceFeedback');
    if(!feedback)return null;

    var canonical=feedback.querySelector('.choice-feedback-card.is-valid, .choice-feedback-card.is-invalid');
    var contextual=feedback.querySelector('.choice-feedback-card.is-contextual');
    if(!canonical||!contextual)return null;

    var scoreText=contextual.querySelector('p');
    var match=scoreText&&String(scoreText.textContent||'').match(/^\s*(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*$/);
    if(!match)return null;

    var score=Number(match[1]),possibleScore=Number(match[2]);
    if(!Number.isFinite(score)||!Number.isFinite(possibleScore)||possibleScore<=0)return null;

    return Object.freeze({
      canonicalForm:Object.freeze({valid:canonical.classList.contains('is-valid')}),
      contextualResponse:Object.freeze({score:score,possibleScore:possibleScore})
    });
  }

  root.SIYAYOVerbExplorerChoiceResolutionReader=Object.freeze({read:read});
})(typeof globalThis!=='undefined'?globalThis:this);
