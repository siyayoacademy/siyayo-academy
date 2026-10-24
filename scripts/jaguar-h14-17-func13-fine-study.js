'use strict';
const fs=require('node:fs');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const contract=read('data/learning/references/jaguar-h14-17-func13-design-contract-v0.1.json');
const matrix=read('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json');
const reviews=read('data/learning/references/jaguar-h14-9-semantic-80-review-v0.1.json');
const seeds=read('data/learning/experience-seeds.json').items;
const master=read('data/learning/references/master-vip-verb-functions-v0.1.json');
function inspect(experienceId,functionId,perspective,language){
 if(!contract.axes.experiences.includes(experienceId)||!contract.axes.functions.includes(functionId)||!contract.axes.perspectives.includes(perspective)||!contract.axes.languages.includes(language))return null;
 const experience=seeds.find(x=>x.id===experienceId),cell=matrix.cells.find(x=>x.experienceId===experienceId&&x.functionId===functionId),review=reviews.matrix.find(x=>x.key===experienceId+'::'+functionId+'::'+perspective),original=master.functions.find(x=>x.id===functionId);
 if(!experience||!cell||!review||!original||!experience.perspectives[perspective])return null;
 return Object.freeze({functionId,masterPattern:original.masterPattern,masterMeaning:original.masterMeaning,experienceId,perspective,language,
 functionAdaptation:cell.example[language],contextLines:Object.freeze([...experience.perspectives[perspective].examples[language]]),
 color:experience.perspectives[perspective].line,semanticReview:review.preliminaryReview,reviewReason:review.reason,
 unresolved:true,approvedExercise:false,assessmentAuthority:false,canAwardEvidence:false,
 newQuestion:null,newResponse:null,howToShowPlacement:'UNDECIDED'});
}
module.exports=Object.freeze({inspect});
