// JAGUAR H14.5 · Read-only authoring projection, NOT an evaluative probe or skill resolver.
// Derives two separate contextual WHY illustrations from existing presentationGrounding.
// It does not use toroidalNext, prior WHICH/HOW attempts, learner identity, or scoring.
'use strict';
const LANGUAGES=Object.freeze(['en','es','pt']);
const text=v=>typeof v==='string'?v.trim():'';
function find(experience){
 if(!experience||!Array.isArray(experience.thinkingMind))return null;
 const rows=experience.thinkingMind.filter(q=>q?.questionWord==='why');
 return rows.length===1?rows[0]:null;
}
function context(experience,{reasonId,distractorId,requiresOverride}){
 const q=find(experience),p=q?.presentationGrounding;
 if(!q||q.intention!=='reason'||q.assessmentTarget||q.assessmentResumeTarget||
  !p||p.groundedIn!=='situation'||p.tense!=='present'||p.form!=='affirmative'||
  p.assessmentAuthority!==false||p.assessmentEvidence!==false||
  p.referenceReasonId!==reasonId||!Array.isArray(p.alternatives)||p.alternatives.length!==2)return null;
 const ids=p.alternatives.map(a=>text(a?.id));
 if(new Set(ids).size!==2||!ids.includes(reasonId)||!ids.includes(distractorId))return null;
 if(requiresOverride&&(!p.referent||p.referent.vocabularyId!=='fresh-mild-cheese'||p.referent.referenceOnly!==true))return null;
 const entries={};
 for(const l of LANGUAGES){
  const question=text((requiresOverride?p.questionOverride:q.question)?.[l]);
  if(!question||!text(experience.situation?.[l])||!text(q.questionWordLabel?.[l]))return null;
  const options=p.alternatives.map(a=>({id:a.id,text:text(a?.response?.[l])}));
  if(options.some(a=>!a.text))return null;
  entries[l]=Object.freeze({
   question,scene:experience.situation[l],
   referenceReason:options.find(a=>a.id===reasonId).text,
   contrastReason:options.find(a=>a.id===distractorId).text,
   // Not an answer-selection spec: these are known *authored examples* for human comparison.
   grammarOnly:true,assessmentAuthority:false
  });
 }
 return Object.freeze({
  experienceId:experience.id,referenceReasonId:reasonId,contrastReasonId:distractorId,
  provenance:'SIYAYO_ADAPTATION',status:'AUTHORING_REFERENCE_ONLY',
  languages:Object.freeze(entries),canSubmitAttempt:false,canAwardEvidence:false
 });
}
function project(experiences){
 if(!Array.isArray(experiences))return null;
 const local=experiences.find(e=>e.id==='shopping-for-dinner');
 const transfer=experiences.find(e=>e.id==='preparing-dinner');
 if(!local||!transfer||local.id===transfer.id)return null;
 const a=context(local,{reasonId:'pairs-with-salmon',distractorId:'shopping-finished',requiresOverride:true});
 const b=context(transfer,{reasonId:'sharing-preparation',distractorId:'still-shopping',requiresOverride:false});
 if(!a||!b||a.referenceReasonId===b.referenceReasonId)return null;
 return Object.freeze({
  status:'READY_FOR_HUMAN_CONTEXT_REVIEW_NOT_ASSESSMENT',
  local:a,transfer:b,
  note:'Different situational reasons are authored. This is not evidence of skill transfer.',
  contractAuthorized:false,scoreEligible:false,createsEvidence:false,canProduceGreenPass:false
 });
}
module.exports=Object.freeze({project});
