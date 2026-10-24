// JAGUAR H14.13 · STUDY-ONLY bridge. No DOM, network, storage, events, PATITA or assessment writes.
'use strict';
const LANGUAGES=Object.freeze(['en','es','pt']);
const FUNCTIONS=Object.freeze(['quality','state','movement','action','existence']);
const PERSPECTIVES=Object.freeze(['describing','narrating','debating','concluding']);
const COLORS=Object.freeze({describing:'red',narrating:'yellow',debating:'green',concluding:'blue'});
const text=s=>typeof s==='string'?s.trim():'';
function project(input){
  input=input||{};
  const {experiences,functionsMatrix,selection}=input;
  if(!Array.isArray(experiences)||!functionsMatrix||!Array.isArray(functionsMatrix.cells)||!selection)return null;
  const {experienceId,language,functionId,perspective}=selection;
  if(!LANGUAGES.includes(language)||!FUNCTIONS.includes(functionId)||!PERSPECTIVES.includes(perspective))return null;
  if(!text(experienceId))return null;
  const exp=experiences.find(x=>x.id===experienceId);
  const cell=functionsMatrix.cells.find(x=>x.experienceId===experienceId&&x.functionId===functionId);
  const p=exp?.perspectives?.[perspective];
  if(!exp||!cell||!p||p.line!==COLORS[perspective]||cell.provenance!=='SIYAYO_ADAPTATION'||
     cell.status!=='PENDING_HOMOLOGATION'||cell.assessmentAuthority!==false||cell.assessmentEvidence!==false)return null;
  if(!text(cell.example?.[language])||!Array.isArray(p.examples?.[language])||!p.examples[language].length||
     p.examples[language].some(line=>!text(line)))return null;
  const selectedQw=text(selection.questionWord)||null;
  if(selectedQw&&!exp.thinkingMind?.some(q=>q.questionWord===selectedQw))return null;
  const tense=text(selection.tense)||'present';
  const mode=text(selection.mode)||'affirmative';
  const period=text(selection.period)||'none';
  const authoredGrammar=(cell.tense===tense||(cell.tense==='present-habitual'&&tense==='present'))&&mode==='affirmative'&&period==='none';
  return Object.freeze({
    stage:'REFERENCE_ONLY',experienceId,language,functionId,perspective,color:COLORS[perspective],
    selectedQuestionWord:selectedQw,tense,mode,period,
    canonicalPerspectiveExamples:Object.freeze([...p.examples[language]]),
    functionSourceExample:authoredGrammar?cell.example[language]:null,
    functionExampleStatus:authoredGrammar?'AUTHORING_REFERENCE':'NOT_AUTHORED_FOR_SELECTED_GRAMMAR',
    question:null,contextualAnswer:null,learnerAttempt:null,canMountAuthoringOnly:true,
    canAwardEvidence:false,canGrantGreenPass:false,assessmentAuthority:false,
    provenance:Object.freeze({perspective:'CANONICAL_EXPERIENCE_JSON',function:'SIYAYO_ADAPTATION'})
  });
}
module.exports=Object.freeze({project,FUNCTIONS,PERSPECTIVES,LANGUAGES});
