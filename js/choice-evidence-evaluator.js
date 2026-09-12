(function(root){
'use strict';
function evaluate(x){
 if(!x||!x.canonicalForm||!x.contextualResponse)return null;
 if(x.canonicalForm.valid!==true)return {dimension:'choice-function',result:'fail'};
 const a=Number(x.contextualResponse.score),b=Number(x.contextualResponse.possibleScore);
 if(!Number.isFinite(a)||!Number.isFinite(b)||b<=0)return null;
 return a===b?{dimension:'choice-function',result:'pass'}:null;
}
root.SIYAYOChoiceEvidenceEvaluator=Object.freeze({evaluate});
})(typeof globalThis!=='undefined'?globalThis:this);
