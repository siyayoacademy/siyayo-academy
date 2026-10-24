// JAGUAR H14.26 — research-only WHY task blueprints. No runtime dispatch or scoring.
'use strict';
const LANGUAGES=Object.freeze(['en','es','pt']);
const DIMENSIONS=Object.freeze(['question-function','reason-answer(local)','reason-answer(transfer)']);
const clean=x=>typeof x==='string'?x.trim():'';
function blueprint({review,draft,skill,experiences}={}){
 if(!review||review.status!=='REVIEW_ONLY'||review.issues?.length!==0||review.cases?.length!==6||
    !Array.isArray(draft?.contractRegistry)||!Array.isArray(experiences)||
    skill?.id!=='why.use.contextual-reason')return null;
 const requires=skill.passContract?.requires?.map(x=>x.dimension+(x.mode?'('+x.mode+')':''));
 if(JSON.stringify(requires)!==JSON.stringify(DIMENSIONS))return null;
 const plans=[],issues=[];
 for(const proposal of draft.contractRegistry.filter(x=>x.status==='DRAFT_NOT_AUTHORIZED')){
  if(proposal.authority!==false||proposal.canMintEvidence!==false||!['shopping-for-dinner','preparing-dinner'].includes(proposal.originExperienceId)){
   issues.push({draftId:proposal.id,reason:'INVALID_AUTHORITY_OR_ORIGIN'});continue;
  }
  const origin=experiences.find(x=>x.id===proposal.originExperienceId);
  const dest=experiences.find(x=>x.id===proposal.transferExperienceId);
  const sourceQuestion=origin?.thinkingMind?.find(x=>x.questionWord==='why');
  const transferQuestion=dest?.thinkingMind?.find(x=>x.questionWord==='why');
  if(!origin||!dest||!sourceQuestion||!transferQuestion||proposal.originExperienceId===proposal.transferExperienceId){
   issues.push({draftId:proposal.id,reason:'MISSING_OR_DUPLICATE_CONTEXT'});continue;
  }
  if(sourceQuestion.assessmentTarget||sourceQuestion.assessmentResumeTarget){
   issues.push({draftId:proposal.id,reason:'UNAUTHORIZED_ORIGIN_TARGET'});continue;
  }
  for(const language of LANGUAGES){
   const local=review.cases.find(x=>x.experienceId===origin.id&&x.language===language);
   const transfer=review.cases.find(x=>x.experienceId===dest.id&&x.language===language);
   if(!local||!transfer||local.referenceReasonId!==proposal.localReasonId||
      transfer.referenceReasonId!==proposal.transferReasonId||
      local.authority.assessment!==false||transfer.authority.assessment!==false||
      !clean(local.displayReferenceQuestion)||!clean(transfer.displayReferenceQuestion)||
      !clean(local.referenceAnswer)||!clean(transfer.referenceAnswer)){
     issues.push({draftId:proposal.id,language,reason:'LOCALIZED_PROVENANCE_MISMATCH'});continue;
   }
   const tasks=[
    Object.freeze({
     dimension:'question-function',taskType:'CAUSAL_INTENTION_RECOGNITION',
     prompt:null,promptSource:null,
     status:'NEEDS_INDEPENDENT_TASK_AUTHORING',
     teacherReferenceOnly:Object.freeze({exampleQuestion:local.displayReferenceQuestion,
       headProbePrompt:clean(sourceQuestion.dependencyHeadProbe?.prompt?.[language])||null}),
     essentialMeaning:'WHY asks for a reason, not HOW manner',
     cannotReuseHeadProbeAsStandaloneProof:true,
     independentLearnerActionRequired:true,
     evidenceAuthority:false
    }),
    Object.freeze({
     dimension:'reason-answer(local)',taskType:'INDEPENDENT_FREE_RESPONSE',
     experienceId:origin.id,
     questionText:local.displayReferenceQuestion,
     questionSource:'S1_S2_AUTHORED_PRESENTATION_GROUNDING',
     sourceTextShownBeforeAttempt:false,
     teacherReferenceOnly:Object.freeze({reasonId:local.referenceReasonId,
       modelAnswer:local.referenceAnswer,contrastId:local.contrastReasonId,contrastAnswer:local.contrastText}),
     status:'DRAFT_TASK_PROMPT_SOURCE_VERIFIED',
     independentLearnerActionRequired:true,
     learnerFacingModelAnswerAllowed:false,
     evidenceAuthority:false
    }),
    Object.freeze({
     dimension:'reason-answer(transfer)',taskType:'INDEPENDENT_FREE_RESPONSE',
     experienceId:dest.id,
     questionText:transfer.displayReferenceQuestion,
     questionSource:'S1_S2_AUTHORED_PRESENTATION_GROUNDING',
     sourceTextShownBeforeAttempt:false,
     teacherReferenceOnly:Object.freeze({reasonId:transfer.referenceReasonId,
       modelAnswer:transfer.referenceAnswer,contrastId:transfer.contrastReasonId,contrastAnswer:transfer.contrastText}),
     status:'DRAFT_TRANSFER_TASK_SOURCE_VERIFIED',
     independentLearnerActionRequired:true,
     learnerFacingModelAnswerAllowed:false,
     evidenceAuthority:false
    })
   ];
   plans.push(Object.freeze({
    id:'H14.26-'+proposal.id+'-'+language.toUpperCase(),
    status:'BLUEPRINT_NOT_AUTHORIZED',proposalId:proposal.id,
    originExperienceId:origin.id,transferExperienceId:dest.id,
    language,skill:skill.id,questionWord:'why',
    scopeFields:Object.freeze(['learnerId','skill','language','originExperienceId']),
    selectionIntents:Object.freeze(['start','resume','transfer']),
    intentAndOriginMustBeExplicit:true,
    independentOccurrenceIdRequired:true,
    sceneVisitAloneIsNeverAnAttempt:true,
    mayTransferBeforeLocalWithoutCredit:true,
    cannotClosePassUntilAllDimensionsProven:true,
    noDoubleCountForS2DualRole:true,
    noMandatoryS1ToS2Sequence:true,
    onlyPresentAffirmativeSources:true,
    periodUnspecified:true,
    assessmentAuthority:false,patitaCredit:false,newEvidence:false,greenPass:false,
    contextualAdequacyScale:'0/4 separate from contract progress 0/3',
    tasks:Object.freeze(tasks)
   }));
  }
 }
 return Object.freeze({id:'JAGUAR-H14.26',status:'REVIEW_ONLY',
  counts:Object.freeze({draftOrigins:new Set(plans.map(x=>x.originExperienceId)).size,
    languagePlans:plans.length,dimensionSlots:plans.reduce((n,x)=>n+x.tasks.length,0),
    authoredIndependentFunctionPrompts:0,newAuthorizedContracts:0,issues:issues.length}),
  plans:Object.freeze(plans),issues:Object.freeze(issues),
  preservedCanonical:'WHY S3→S4 unchanged',func13Hidden:true,mainUntouched:true,
  runtimeChanges:false,evidenceWrites:false,contractWrites:false});
}
module.exports=Object.freeze({blueprint,LANGUAGES,DIMENSIONS});
if(require.main===module){
 const fs=require('node:fs');const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
 const experiments=read('data/learning/experience-seeds.json').items,
  study=read('data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json'),
  draft=read('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json'),
  map=read('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json');
 const audited=require('./jaguar-h14-25-why-s1-s2-fine-review.js').audit({
   experiences:experiments,study,draft,coherence:require('../js/verb-explorer-contextual-coherence.js'),
   priorInventory:{slots:map.slots.map(x=>({experienceId:x.experienceId,questionWord:x.questionWord,
      status:x.assessment.entryTarget?'ASSESSMENT_DECLARED':x.assessment.resumeTarget?'ASSESSMENT_RESUME_ONLY':'OPPORTUNITY_ONLY'}))}
 });
 const out=blueprint({review:audited,draft,skill:read('data/learning/skills/why.json'),experiences:experiments});
 if(!out||out.issues.length||out.plans.length!==6){console.error('H14.26 blueprint failed',out?.issues);process.exitCode=1;}
 else if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(out,null,2)+'\n');
 else console.log('H14.26 blueprint',JSON.stringify(out.counts));
}
