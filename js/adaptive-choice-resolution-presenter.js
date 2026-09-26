// Pure presentation boundary for an already-grounded contextual Choice resolution.
// It delegates semantic scoring to the canonical Contextual Choice Resolver and
// exposes only the selected canonical/contextual result needed for browser rendering.
// It does not expose ranking/scoring inputs, create Evidence/Attempt, mutate Session,
// grant Green Pass, authorize progression, or touch browser state.
(function(root,factory){
  var api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.AdaptiveChoiceResolutionPresenter=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  function text(value){
    return typeof value==='string'?value.trim():'';
  }

  function present(choiceContext,candidateId,language,resolver){
    var choice=text(candidateId);
    var lang=text(language)||'en';

    if(!choiceContext||typeof choiceContext!=='object'||!choice)return null;
    if(!resolver||typeof resolver.resolveChoice!=='function')return null;

    var resolved;
    try{
      resolved=resolver.resolveChoice(choiceContext,choice,lang);
    }catch(error){
      return null;
    }

    if(!resolved||!resolved.canonicalForm||!resolved.contextualResponse)return null;
    if(resolved.canonicalForm.valid!==true)return null;

    var score=Number(resolved.contextualResponse.score);
    var possibleScore=Number(resolved.contextualResponse.possibleScore);
    if(!Number.isFinite(score)||!Number.isFinite(possibleScore)||possibleScore<=0)return null;

    return Object.freeze({
      candidateId:choice,
      language:resolved.language||lang,
      canonicalForm:Object.freeze({
        valid:true,
        status:text(resolved.canonicalForm.status),
        response:text(resolved.canonicalForm.response)
      }),
      contextualResponse:Object.freeze({
        status:text(resolved.contextualResponse.status),
        score:score,
        possibleScore:possibleScore
      })
    });
  }

  return Object.freeze({present:present});
});
