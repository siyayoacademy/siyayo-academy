(function(root){
'use strict';
function groundedContext(context){
 if(!context||!context.currentExperienceId||!context.experienceLanguage||context.experienceQuestion==null||!context.experienceChoiceCandidate)return null;
 return Object.freeze({
  currentExperienceId:context.currentExperienceId,
  experienceLanguage:context.experienceLanguage,
  experienceQuestion:context.experienceQuestion,
  experienceChoiceCandidate:context.experienceChoiceCandidate
 });
}
function evidence(result,context){
 const scoped=groundedContext(context);
 return scoped?{dimension:'choice-function',result:result,context:scoped}:null;
}
function evaluate(x,context){
 if(!x||!x.canonicalForm||!x.contextualResponse)return null;
 if(x.canonicalForm.valid!==true)return evidence('fail',context);
 const a=Number(x.contextualResponse.score),b=Number(x.contextualResponse.possibleScore);
 if(!Number.isFinite(a)||!Number.isFinite(b)||b<=0)return null;
 return a===b?evidence('pass',context):null;
}
root.SIYAYOChoiceEvidenceEvaluator=Object.freeze({evaluate});
})(typeof globalThis!=='undefined'?globalThis:this);
