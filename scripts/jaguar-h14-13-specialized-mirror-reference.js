(function(root){'use strict';
const LANGUAGES=Object.freeze(['en','es','pt']),FUNCTIONS=Object.freeze(['quality','state','movement','action','existence']),PERSPECTIVES=Object.freeze(['describing','narrating','debating','concluding']),COLORS=Object.freeze({describing:'red',narrating:'yellow',debating:'green',concluding:'blue'});
const text=s=>typeof s==='string'?s.trim():'';
function projectSingle({experience,cell,selection}={}){
 if(!experience||!cell||!selection)return null;
 const {experienceId,language,functionId,perspective}=selection;
 if(!LANGUAGES.includes(language)||!FUNCTIONS.includes(functionId)||!PERSPECTIVES.includes(perspective))return null;
 if(!text(experience.id)||(experienceId&&experienceId!==experience.id)||cell.experienceId!==experience.id||cell.functionId!==functionId)return null;
 const p=experience.perspectives?.[perspective];
 if(!p||p.line!==COLORS[perspective]||cell.provenance!=='SIYAYO_ADAPTATION'||cell.status!=='PENDING_HOMOLOGATION'||cell.assessmentAuthority!==false||cell.assessmentEvidence!==false)return null;
 if(!text(cell.example?.[language])||!Array.isArray(p.examples?.[language])||!p.examples[language].length||p.examples[language].some(line=>!text(line)))return null;
 const q=text(selection.questionWord)||null;
 if(q&&!experience.thinkingMind?.some(x=>x.questionWord===q))return null;
 const tense=text(selection.tense)||'present',mode=text(selection.mode)||'affirmative',period=text(selection.period)||'none';
 const authored=(cell.tense===tense||(cell.tense==='present-habitual'&&tense==='present'))&&mode==='affirmative'&&period==='none';
 return Object.freeze({stage:'REFERENCE_ONLY',experienceId:experience.id,language,functionId,perspective,color:COLORS[perspective],
 selectedQuestionWord:q,tense,mode,period,canonicalPerspectiveExamples:Object.freeze([...p.examples[language]]),
 functionSourceExample:authored?cell.example[language]:null,functionExampleStatus:authored?'AUTHORING_REFERENCE':'NOT_AUTHORED_FOR_SELECTED_GRAMMAR',
 question:null,contextualAnswer:null,learnerAttempt:null,canMountAuthoringOnly:true,canAwardEvidence:false,canGrantGreenPass:false,assessmentAuthority:false,
 provenance:Object.freeze({perspective:'CANONICAL_EXPERIENCE_JSON',function:'SIYAYO_ADAPTATION'})});
}
function project({experiences,functionsMatrix,selection}={}){
 if(!Array.isArray(experiences)||!Array.isArray(functionsMatrix?.cells)||!selection)return null;
 return projectSingle({experience:experiences.find(x=>x.id===selection.experienceId),cell:functionsMatrix.cells.find(x=>x.experienceId===selection.experienceId&&x.functionId===selection.functionId),selection});
}
const api=Object.freeze({project,projectSingle,FUNCTIONS,PERSPECTIVES,LANGUAGES});
if(typeof module==='object'&&module.exports)module.exports=api;
else root.SIYAYOH1413SpecializedMirror=api;
})(typeof globalThis!=='undefined'?globalThis:this);
