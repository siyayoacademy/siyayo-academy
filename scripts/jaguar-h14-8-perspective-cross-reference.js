'use strict';
// H14.8 — deterministic read-only cross-reference, not a grammar or assessment generator.
const langs=['en','es','pt'];
const names=['describing','narrating','debating','concluding'];
function project({mirror,functionsMatrix,experiences}={}){
 if(!mirror||mirror.status!=='REFERENCE_ONLY_PENDING_CONTEXTUAL_HOMOLOGATION'||
 !mirror.authority||mirror.authority.newAssessmentTarget!==false||mirror.authority.newEvidence!==false||
 !mirror.compatibility||mirror.compatibility.questionWordPrerequisite!==false||
 !functionsMatrix||!Array.isArray(functionsMatrix.cells)||functionsMatrix.cells.length!==20||
 !Array.isArray(experiences)||experiences.length!==4)return null;
 const out=[];
 for(const e of experiences){
   if(!e?.id||!e.perspectives||!Array.isArray(e.thinkingMind))return null;
   const functions=functionsMatrix.cells.filter(c=>c.experienceId===e.id);
   if(functions.length!==5||new Set(functions.map(c=>c.functionId)).size!==5)return null;
   for(const name of names){
     const p=e.perspectives[name],declared=mirror.perspectives.find(x=>x.id===name);
     if(!p||!declared||declared.color!==p.line||!p.examples||
       langs.some(l=>!Array.isArray(p.examples[l])||!p.examples[l].length||p.examples[l].some(v=>!v||typeof v!=='string')))return null;
     for(const f of functions){
       if(f.status!=='PENDING_HOMOLOGATION'||f.assessmentAuthority!==false||f.assessmentEvidence!==false||
         langs.some(l=>typeof f.example?.[l]!=='string'||!f.example[l].trim()))return null;
       out.push(Object.freeze({
         id:e.id+'::'+f.functionId+'::'+name,experienceId:e.id,functionId:f.functionId,perspective:name,
         color:p.line,sourcePerspectiveExamples:Object.freeze(Object.fromEntries(langs.map(l=>[l,Object.freeze([...p.examples[l]])]))),
         sourceFunctionExample:Object.freeze(Object.fromEntries(langs.map(l=>[l,f.example[l]]))),
         exampleTense:p.exampleTense||null,stage:'UNREVIEWED_RELATION_ONLY',synthesizedAnswer:null,questionWord:null,
         assessmentAuthority:false,evidenceProduced:false,greenPass:false
       }));
     }
   }
 }
 if(out.length!==80||new Set(out.map(x=>x.id)).size!==80)return null;
 return Object.freeze({status:'REFERENCE_ONLY',count:80,rows:Object.freeze(out),createsEvidence:false,grantsGreenPass:false});
}
module.exports=Object.freeze({project});
