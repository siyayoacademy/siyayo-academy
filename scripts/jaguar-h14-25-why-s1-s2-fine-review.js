// JAGUAR H14.25 — ONLY read/inspect authored S1/S2 WHY contextual references.
// No Experience mutation, inference of new assessment, navigation, PATITA or Evidence.
'use strict';
const LANGUAGES=Object.freeze(['en','es','pt']);
const ORIGINS=Object.freeze(['shopping-for-dinner','preparing-dinner']);
function clean(x){return typeof x==='string'?x.trim():'';}
function audit({experiences,coherence,study,draft,priorInventory}={}){
 if(!Array.isArray(experiences)||!coherence||!Array.isArray(study?.contexts)||!Array.isArray(draft?.contractRegistry)||!Array.isArray(priorInventory?.slots))return null;
 const cases=[],issues=[];
 for(const id of ORIGINS){
  const exp=experiences.find(e=>e.id===id),q=exp?.thinkingMind?.find(x=>x.questionWord==='why');
  const source=study.contexts.find(x=>x.experienceId===id);
  const old=priorInventory.slots.find(s=>s.experienceId===id&&s.questionWord==='why');
  if(!exp||!q||!source||!old||old.status!=='OPPORTUNITY_ONLY'||q.assessmentTarget||q.assessmentResumeTarget||
    !q.presentationGrounding||q.presentationGrounding.assessmentAuthority!==false||
    q.presentationGrounding.assessmentEvidence!==false){issues.push({id,reason:'SOURCE_BOUNDARY_OR_PRIOR_INVENTORY_MISMATCH'});continue;}
  const pg=q.presentationGrounding,expectedReason=source.acceptedReasonId,contrast=source.distractorId;
  if(pg.referenceReasonId!==expectedReason||pg.alternatives?.length!==2||
    !pg.alternatives.some(x=>x.id===contrast)||new Set(pg.alternatives.map(x=>x.id)).size!==2||
    pg.groundedIn!=='situation'||pg.kind!=='exploratory-causal-dialogue'){issues.push({id,reason:'NOT_VALIDATED_CAUSAL_SOURCE'});continue;}
  const proposal=draft.contractRegistry.find(x=>x.originExperienceId===id);
  if(!proposal||proposal.status!=='DRAFT_NOT_AUTHORIZED'||proposal.authority!==false||proposal.canMintEvidence!==false){issues.push({id,reason:'CONTRACT_DRAFT_BOUNDARY_MISSING'});continue;}
  for(const language of LANGUAGES){
   const x=coherence.resolve({question:q,language,tense:'present',form:'affirmative'});
   const authored=pg.alternatives.find(a=>a.id===expectedReason),counter=pg.alternatives.find(a=>a.id===contrast);
   const originalQuestion=clean(q.question?.[language]),explicit=clean(pg.questionOverride?.[language]),
    answer=clean(authored?.response?.[language]),distractor=clean(counter?.response?.[language]);
   if(!x||x.status!=='grounded'||x.exploratory!==true||x.source!=='presentationGrounding.referenceReasonId'||
      !originalQuestion||!answer||!distractor||x.question!==(explicit||originalQuestion)||x.response!==answer||
      x.assessmentEvidence!==false||x.greenPass!==false){issues.push({id,language,reason:'LOCALIZED_SOURCE_OR_RESOLVER_MISMATCH'});continue;}
   const tenseModes={};
   for(const tense of ['present','past','future'])for(const mode of ['affirmative','negative','interrogative']){
    const result=coherence.resolve({question:q,language,tense,form:mode});
    tenseModes[tense+'::'+mode]=result?.status||'UNAVAILABLE';
   }
   const special=id==='shopping-for-dinner';
   cases.push(Object.freeze({
     experienceId:id,language,questionWord:'why',contextRole:source.semanticQuestionRole,
     sourceStatus:'AUTHOR_EXPLORATORY_REFERENCE_NOT_AUTHORIZED',
     genericQuestion:originalQuestion,displayReferenceQuestion:explicit||originalQuestion,
     referent: special?Object.freeze({status:'EXPLICIT_IN_PRESENTATION_OVERRIDE',kind:'fresh-cheese',
       sourceQuestionWord:'which',priorWhichAssessmentRequired:false}):
       Object.freeze({status:'AUTHORED_SHARED_PREPARATION',kind:'this-dinner-together',priorWhichAssessmentRequired:false}),
     referenceReasonId:expectedReason,referenceAnswer:answer,
     contrastReasonId:contrast,contrastText:distractor,contrastStatus:'HUMAN_CONTEXT_CONTRAST_REVIEW_REQUIRED',
     grammar:Object.freeze({reviewed:'present::affirmative',resolverStatuses:Object.freeze(tenseModes),
       period:'UNAVAILABLE_IN_CURRENT_GEAR_STACK',
       independentLearnerReasonAnswerAuthored:false,
       s1DialogueFormsSeparateFromCausalAnswer: special&&!!q.dialogueForms}),
     transfer:Object.freeze({draftId:proposal.id,from:id,to:proposal.transferExperienceId,
       status:'DRAFT_NOT_AUTHORIZED',candidateReasonDistinct:true,
       distinctReasonNotEvidence:true,noForcedVisitSequence:true,
       explicitOriginAndIntentRequired:true,dualRoleInS2RequiresConflictRule:true}),
     review:Object.freeze({sourceTrilingualStudy:'H14.5',referentHumanReviewRequired:true,
       languageHumanReviewRequired:true,distractorHumanReviewRequired:true,
       independentAttemptAndTransferDesignRequired:true,
       masterVipRole:'WHY_ASKS_REASON_NOT_HOW_MANNER'}),
     authority:Object.freeze({assessment:false,attempt:false,evidence:false,greenPass:false,patitaWrite:false})
   }));
  }
 }
 const report=Object.freeze({id:'JAGUAR-H14.25',status:'REVIEW_ONLY',
  counts:Object.freeze({origins:ORIGINS.length,languages:LANGUAGES.length,referenceViews:cases.length,issues:issues.length,
     newAuthorizedAssessments:0}),
  cases:Object.freeze(cases),issues:Object.freeze(issues),
  canonicalS3S4Untouched:true,contractsUnchanged:true,noExplorerChanges:true,
  noMainMerge:true,func13StillHidden:true});
 return report;
}
module.exports=Object.freeze({audit,LANGUAGES,ORIGINS});
if(require.main===module){
 const fs=require('node:fs');const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
 const report=audit({experiences:read('data/learning/experience-seeds.json').items,
  coherence:require('../js/verb-explorer-contextual-coherence.js'),
  study:read('data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json'),
  draft:read('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json'),
  priorInventory:{slots:read('data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json').slots.map(x=>({
    experienceId:x.experienceId,questionWord:x.questionWord,
    status:x.assessment.entryTarget?'ASSESSMENT_DECLARED':x.assessment.resumeTarget?'ASSESSMENT_RESUME_ONLY':'OPPORTUNITY_ONLY'
  }))}});
 if(!report||report.issues.length||report.cases.length!==6){console.error('H14.25 SOURCE AUDIT BLOCKED',report?.issues);process.exitCode=1;}
 else if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else console.log('H14.25 WHY S1/S2 REVIEW '+JSON.stringify(report.counts));
}
