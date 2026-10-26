'use strict';
// JAGUAR H14.63 — read-only six-plan pedagogical task handoff.
// Builds from H14.38/37/26; it does NOT score responses or authorize assessment.
const {build:buildH1438,inspectIllustrativeCandidate}=require('./jaguar-h14-38-independent-production-transfer.js');
const {inspect:reviewH1437}=require('./jaguar-h14-37-trilingual-semantic-review.js');
const draft=require('../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const seeds=require('../data/learning/experience-seeds.json').items;
const skill=require('../data/learning/skills/why.json');
const DIMENSIONS=Object.freeze(['question-function','reason-answer(local)','reason-answer(transfer)']);
const LANGS=Object.freeze(['en','es','pt']);
const ORIGINS=Object.freeze(['shopping-for-dinner','preparing-dinner']);
const REQUIREMENTS=Object.freeze({
 'question-function':Object.freeze(['Explain the causal information requested by WHY without replaying a model','Distinguish WHY reason from HOW manner without requiring prior HOW completion','Independent learner action and a human-approved task are required']),
 'reason-answer(local)':Object.freeze(['Give a reason grounded in the local Experience','Allow a meaning-preserving independent paraphrase; do not require verbatim teacher model','Check referent, causal appropriateness and unverified premises']),
 'reason-answer(transfer)':Object.freeze(['Give a NEW causal reason in the approved alternate Experience','Preserve original learner/skill/language/origin scope while switching scene','A transfer can be explored early; Green requires all independently accepted dimensions'])
});
const t=x=>typeof x==='string'?x.trim():'';
const immutableArray=v=>Object.freeze(v.map(x=>Object.freeze(x)));
function build({phase=buildH1438(),review=reviewH1437()}={}){
 const issues=[];
 if(phase?.status!=='TASK_SOURCE_PACKETS_READY_HUMAN_REVIEW_PENDING'||phase.issues?.length||
    phase.packets?.length!==6)issues.push('H14_38_SOURCE_OR_PACKET_DRIFT');
 if(review?.status!=='TRILINGUAL_REVIEW_READY_NOT_HOMOLOGATED'||review.issues?.length||
    review.packets?.length!==6||review.triplets?.length!==16)
    issues.push('H14_37_TRILINGUAL_REVIEW_DRIFT');
 if(draft.status!=='SPECIFIED_NOT_AUTHORIZED'||skill.id!=='why.use.contextual-reason')
    issues.push('SOURCE_CONTRACT_AUTHORITY_DRIFT');
 const packets=[];
 for(const origin of ORIGINS)for(const language of LANGS){
  const source=phase?.packets?.find(p=>p.originExperienceId===origin&&p.language===language);
  const proposal=source&&draft.contractRegistry.find(p=>p.id===source.proposalId);
  if(!source||!proposal||proposal.status!=='DRAFT_NOT_AUTHORIZED'||
     proposal.authority!==false||proposal.canMintEvidence!==false||
     source.assessmentAuthority!==false||source.evidence!==false||source.greenPass!==false||
     source.tasks?.length!==3||source.transferExperienceId!==proposal.transferExperienceId){
    issues.push('INVALID_SOURCE_PLAN:'+origin+':'+language);continue;
  }
  const corpusOrigin=seeds.find(e=>e.id===origin);
  const corpusTransfer=seeds.find(e=>e.id===source.transferExperienceId);
  const sourceWhy=corpusOrigin?.thinkingMind?.find(q=>q.questionWord==='why');
  const otherWhy=corpusTransfer?.thinkingMind?.find(q=>q.questionWord==='why');
  if(!sourceWhy?.presentationGrounding||!otherWhy?.presentationGrounding||
     sourceWhy.assessmentTarget||sourceWhy.assessmentResumeTarget||
     otherWhy.assessmentTarget||otherWhy.assessmentResumeTarget)
  {issues.push('LIVE_TARGET_OR_SOURCE_MISMATCH:'+origin+':'+language);continue;}
  const slots=[];
  for(let i=0;i<DIMENSIONS.length;i++){
   const old=source.tasks[i],dimension=DIMENSIONS[i];
   const expected=i===2?source.transferExperienceId:origin;
   if(!old||old.dimension!==dimension||old.experienceId!==expected||
      !t(old.learnerFacing?.question)||old.learnerFacing.modelAnswerVisible!==false||
      old.learnerFacing.teacherContrastVisible!==false||old.evidence!==false||
      old.assessmentAuthority!==false||old.curriculumApproval!==null||
      old.independenceProven!==false||!t(old.learnerFacing.expectedActionType)){
     issues.push('DIMENSION_OR_SAFETY_MISMATCH:'+origin+':'+language+':'+dimension);continue;
   }
   const promptStatus=i===0?'QUESTION_FUNCTION_PROMPT_REQUIRES_INDEPENDENT_AUTHORING':
      'SOURCE_QUESTION_GROUNDED_PROMPT_NOT_HOMOLOGATED';
   // Public handoff deliberately omits the teacher's model/contrast text.
   slots.push(Object.freeze({
    dimension,experienceId:expected,language,questionWord:'why',
    publicPromptDraft:i===0?null:old.learnerFacing.question,
    pedagogicalInstructionDraft:i===0?old.learnerFacing.instruction:null,
    promptStatus,expectedLearnerAction:old.learnerFacing.expectedActionType,
    teacherReferenceReasonId:old.teacherOnly?.referenceReasonId||null,
    teacherContrastId:sourceWhy.presentationGrounding?.alternatives?.[1]?.id||null,
    criteria:REQUIREMENTS[dimension],
    taskHomologation:null,semanticHomologation:null,languageHomologation:null,
    independentActionVerified:false,authoritativeEventId:null,
    teacherModelsIncluded:false,learnerAnswerCaptured:false,assessmentAuthority:false,
    canMintEvidence:false,canGrantGreenPass:false
   }));
  }
  if(slots.length!==3)continue;
  packets.push(Object.freeze({
   packetId:'H14.63-'+proposal.id+'-'+language,
   proposalId:proposal.id,language,skill:skill.id,originExperienceId:origin,
   transferExperienceId:source.transferExperienceId,scopeFields:Object.freeze([...source.scopeFields]),
   sequenceRequirement:'NONE_FREE_EXPLORATION',
   sourceGrounding:'S1_S2_PRESENT_AFFIRMATIVE_PRESENTATION_ONLY',
   questionWord:'why',selectableOrigin:false,contractStatus:'DRAFT_NOT_AUTHORIZED',
   proposedIntents:Object.freeze(['start','resume','transfer']),
   explicitOriginAndIntentRequired:true,
   dualRoleResolution:'S2 local when S2-origin; S2 transfer when S1-origin; never implicit',
   modelAnswerExposedToLearner:false,
   reviewerOne:null,reviewerTwo:null,mediation:null,pedagogicalApproval:null,
   slots:Object.freeze(slots),assessmentAuthority:false,canMintEvidence:false,canGrantGreenPass:false
  }));
 }
 if(packets.length!==6||new Set(packets.map(x=>x.packetId)).size!==6)
    issues.push('INCOMPLETE_SIX_PLAN_COVERAGE');
 const count=packets.reduce((n,p)=>n+p.slots.length,0);
 if(count!==18)issues.push('INCOMPLETE_18_REQUIREMENTS');
 return Object.freeze({
  id:'JAGUAR-H14.63',status:issues.length?'STOP_SOURCE_DRIFT':'SIX_PLAN_PEDAGOGICAL_HANDOFF_REVIEW_PENDING',
  languages:LANGS,origins:ORIGINS,dimensions:DIMENSIONS,
  counts:Object.freeze({draftOrigins:ORIGINS.length,languagePlans:packets.length,
    independentTaskSlots:count,authoredQuestionFunctionTasksApproved:0,
    humanReviewersFinished:0,contractsAuthorized:0,attempts:0,evidence:0,greenPasses:0}),
  packets:Object.freeze(packets),issues:Object.freeze(issues),
  sourceLineage:Object.freeze(['H14.5','H14.6','H14.26','H14.27','H14.37','H14.38','H14.62']),
  nextHumanGates:Object.freeze(['HG-01','HG-02','HG-03','HG-04','HG-05','HG-06','HG-07','HG-08','HG-09','HG-10']),
  targetIntegration:'H14.64_HUMAN_HOMOLOGATION_NOT_YET_DONE',
  protections:Object.freeze({patitaIsObserver:true,nickNotAuthentication:true,
    independentOriginScopes:true,noMandatoryExperienceOrder:true,noPriorWhichOrHowRequired:true,
    teacherModelNotLearnerFacing:true,onlyPresentAffirmative:true,
    periodGearGapOpen:true,whyS3S4CanonicalUnchanged:true,
    explorerMainUntouched:true,pr3Untouched:true,d1RemoteUntouched:true,
    canScoreFreeText:false,canApproveAssessment:false,canWriteEvidence:false})
 });
}
// Safely review *only* synthetic action metadata through the existing H14.38
// screen. Never accept or pass real answer text or learner identity to this API.
function reviewSyntheticEvent({handoff,packetId,dimension,event}={}){
 const fail=(reason)=>Object.freeze({status:'NOT_AUTHORIZED',reason,canMintEvidence:false,canGrantGreenPass:false});
 if(!handoff||handoff.status!=='SIX_PLAN_PEDAGOGICAL_HANDOFF_REVIEW_PENDING')return fail('INVALID_HANDOFF');
 const packet=handoff.packets.find(x=>x.packetId===packetId);
 if(!packet||!DIMENSIONS.includes(dimension)||!event||typeof event!=='object'||Array.isArray(event))
    return fail('INVALID_PACKET_OR_EVENT');
 const permitted=['originExperienceId','experienceId','language','dimension','questionWord',
  'intent','occurrenceId','actionType','observed','actor','modelExposedBeforeAction'];
 if(Object.keys(event).some(k=>!permitted.includes(k)))return fail('UNTRUSTED_EVENT_FIELD');
 const phase=buildH1438();
 if(phase.status!=='TASK_SOURCE_PACKETS_READY_HUMAN_REVIEW_PENDING')return fail('SOURCE_DRIFT');
 const source=phase.packets.find(x=>x.proposalId===packet.proposalId&&x.language===packet.language);
 if(!source)return fail('MISSING_SOURCE_PLAN');
 const outcome=inspectIllustrativeCandidate({packet:source,dimension,event});
 return Object.freeze({status:outcome.status,reason:outcome.reason,
  reviewedMetadataOnly:true,independenceVerified:false,
  semanticMeaningAssessed:false,canMintEvidence:false,canGrantGreenPass:false});
}
module.exports=Object.freeze({build,reviewSyntheticEvent,DIMENSIONS,LANGS,ORIGINS});
if(require.main===module){
 const x=build();if(x.issues.length){console.error(x.issues);process.exitCode=1;}
 else if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(x,null,2)+'\n');
 else console.log('H14.63',x.status,x.counts);
}
