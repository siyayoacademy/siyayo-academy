(function(root){'use strict';
const languages=['en','es','pt'],functions=['quality','state','movement','action','existence'],perspectives=['describing','narrating','debating','concluding'],modes=['affirmative','negative','interrogative'],tenses=['present','past','future'];
function snapshot(x={}){
 if(!x||!['shopping-for-dinner','preparing-dinner','having-dinner','after-dinner-conversation'].includes(x.experienceId)||!languages.includes(x.language)||!tenses.includes(x.tense)||!modes.includes(x.mode))return null;
 if(x.perspective!==null&&x.perspective!==undefined&&!perspectives.includes(x.perspective))return null;
 if(x.period!==null&&x.period!==undefined&&x.period!=='none')return null;
 if(x.questionWord!==null&&x.questionWord!==undefined&&typeof x.questionWord!=='string')return null;
 return Object.freeze({experienceId:x.experienceId,language:x.language,tense:x.tense,mode:x.mode,period:x.period??null,perspective:x.perspective??null,wordType:x.wordType??'verb',questionWord:x.questionWord??null,functionId:functions.includes(x.functionId)?x.functionId:'quality',periodSource:x.periodSource??'UNAVAILABLE_IN_CURRENT_GEAR_STACK',assessmentAuthority:false});
}
function inspect(input={}){
 const s=snapshot(input.selection),sources=input.sources;if(!s||!sources)return null;
 const exp=sources.experiences?.find(x=>x.id===s.experienceId),cell=sources.matrix?.cells?.find(x=>x.experienceId===s.experienceId&&x.functionId===s.functionId),master=sources.master?.functions?.find(x=>x.id===s.functionId),meta=sources.matrix?.functions?.find(x=>x.id===s.functionId),p=s.perspective||'describing',perspective=exp?.perspectives?.[p],review=sources.review?.matrix?.find(x=>x.key===s.experienceId+'::'+s.functionId+'::'+p);
 if(!exp||!cell||!master||!meta||!perspective||!review||cell.assessmentAuthority!==false||cell.assessmentEvidence!==false)return null;
 if(s.questionWord&&!exp.thinkingMind.some(x=>x.questionWord===s.questionWord))return null;
 const result=sources.mirror?.projectSingle?.({experience:exp,cell,selection:{...s,perspective:p,period:s.period??'none'}});if(!result)return null;
 const original=master.example?.[s.language]??null;
 const reason=review.reason;
 return Object.freeze({snapshot:s,authoredPerspective:p,perspectiveFallbackDisplayOnly:!s.perspective,
 function:Object.freeze({id:s.functionId,masterPattern:master.pattern,masterExample:original,sourceOriginalLanguageAvailable:original!==null,masterMeaning:meta.masterMeaning,
 adaptedExample:result.functionSourceExample,adaptationStatus:result.functionExampleStatus,adaptationProvenance:'SIYAYO_ADAPTATION_PENDING_HOMOLOGATION'}),
 context:Object.freeze({experienceTitle:exp.title[s.language],perspective:p,perspectiveColor:perspective.line,sourceLines:Object.freeze([...perspective.examples[s.language]]),questionWord:s.questionWord}),
 fineStudy:Object.freeze({relationKey:review.key,review:review.preliminaryReview,reason,authoringRequired:true,notApproved:true}),
 authority:Object.freeze({attempt:false,patitaWrite:false,evidence:false,greenPass:false,assessment:false})});
}
const api=Object.freeze({snapshot,inspect,functions,positions:'UNDECIDED_FINAL_HTML'});
if(typeof module==='object'&&module.exports)module.exports=api;else root.SIYAYOH1418FunctionWindow=api;
})(typeof globalThis!=='undefined'?globalThis:this);
