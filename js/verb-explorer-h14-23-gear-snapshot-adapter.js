(function(root){'use strict';
const VALID={language:['en','es','pt'],tense:['present','past','future'],mode:['affirmative','negative','interrogative'],perspective:['describing','narrating','debating','concluding']};
function read({document:doc,runtime,navigation,experienceIdOverride}={}){
 if(!doc||!runtime||typeof runtime.activeExperienceId!=='function'||typeof runtime.activeLanguage!=='function')return null;
 const expId=experienceIdOverride||runtime.activeExperienceId(),lang=runtime.activeLanguage();
 const active=(parent,attribute)=>{const container=doc.getElementById(parent);if(!container)return {error:'missing_gear:'+parent};const all=[...container.querySelectorAll('button['+attribute+']')],chosen=all.filter(x=>x.classList.contains('active'));return chosen.length===1?{value:chosen[0].getAttribute(attribute),locked:chosen[0].disabled,allLocked:all.length>0&&all.every(x=>x.disabled)}:{error:'ambiguous_or_absent:'+parent};};
 const language=active('experienceLanguageGear','data-experience-language'),tense=active('experienceTenseGear','data-experience-tense'),mode=active('experienceModeGear','data-experience-form'),wordType=active('wordTypeGear','data-word-type');
 if([language,tense,mode,wordType].some(x=>x.error))return null;
 if(language.value!==lang||!VALID.language.includes(lang)||!VALID.tense.includes(tense.value)||!VALID.mode.includes(mode.value))return null;
 const pGear=doc.getElementById('perspectiveGear'),p=pGear?[...pGear.querySelectorAll('[data-perspective].active')]:[];
 if(!pGear||p.length>1)return null;
 const perspective=p.length?p[0].dataset.perspective:null;if(perspective&&!VALID.perspective.includes(perspective))return null;
 const q=runtime.activeQuestionWord?.()??null;
 const exp=navigation?.getExperience?.(expId);
 if(!exp||!exp.thinkingMind||q&&!exp.thinkingMind.some(x=>x.questionWord===q))return null;
 const snapshot={experienceId:expId,language:lang,tense:tense.value,mode:mode.value,period:null,periodSource:'UNAVAILABLE_IN_CURRENT_GEAR_STACK',perspective,wordType:wordType.value,questionWord:q,grammarLocked:tense.allLocked||mode.allLocked,source:'EXPLORER_RUNTIME_AND_ACTIVE_GEAR_DOM',assessmentAuthority:false};
 return Object.freeze(snapshot);
}
const api=Object.freeze({read});if(typeof module==='object'&&module.exports)module.exports=api;else root.SIYAYOH1423GearSnapshotAdapter=api;
})(typeof globalThis!=='undefined'?globalThis:this);
