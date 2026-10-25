'use strict';
// JAGUAR H14.38 — pure study-only projection and candidate screening.
// Never captures answer text, stores learner data, scores semantic meaning,
// updates PATITA, evaluates canonical attempts or grants Evidence.
const experiences=require('../data/learning/experience-seeds.json').items;
const h145=require('../data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json');
const h146=require('../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const h142=require('../data/learning/references/jaguar-h14-2-qw-opportunity-map-v0.1.json');
const skill=require('../data/learning/skills/why.json');
const h1427=require('../data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json');
const phase2=require('./jaguar-h14-37-trilingual-semantic-review.js');
const coherence=require('../js/verb-explorer-contextual-coherence.js');
const scope=require('../js/adaptive-assessment-scope.js');
const dimensions=Object.freeze(['question-function','reason-answer(local)','reason-answer(transfer)']);
function build(){
 const issues=[],phase=phase2.inspect();
 if(phase.status!=='TRILINGUAL_REVIEW_READY_NOT_HOMOLOGATED'||phase.issues.length)
  issues.push('H14_37_SOURCE_OR_REVIEW_DRIFT');
 const originReview=require('./jaguar-h14-25-why-s1-s2-fine-review.js').audit({
  experiences,study:h145,draft:h146,coherence,
  priorInventory:{slots:h142.slots.map(x=>({experienceId:x.experienceId,questionWord:x.questionWord,
   status:x.assessment.entryTarget?'ASSESSMENT_DECLARED':
          x.assessment.resumeTarget?'ASSESSMENT_RESUME_ONLY':'OPPORTUNITY_ONLY'}))}
 });
 const plans=require('./jaguar-h14-26-why-independent-task-blueprints.js').blueprint({
  review:originReview,draft:h146,skill,experiences});
 if(!plans||plans.issues?.length||plans.plans.length!==6)issues.push('H14_26_BLUEPRINT_OR_AUTHORITY_DRIFT');
 const packets=[];
 for(const plan of plans?.plans||[]){
  const localized=h1427.tasks.find(x=>x.experienceId===plan.originExperienceId)?.localized?.[plan.language];
  const original=phase.packets.find(x=>x.experienceId===plan.originExperienceId&&x.language===plan.language);
  const other=phase.packets.find(x=>x.experienceId===plan.transferExperienceId&&x.language===plan.language);
  const proposal=h146.contractRegistry.find(x=>x.id===plan.proposalId);
  if(!localized||!original||!other||!proposal||proposal.status!=='DRAFT_NOT_AUTHORIZED'||
     proposal.authority!==false||proposal.canMintEvidence!==false||plan.assessmentAuthority!==false||
     plan.tasks.length!==3||plan.tasks.some((x,i)=>x.dimension!==dimensions[i])||
     plan.tasks[1].questionText!==original.question||
     plan.tasks[2].questionText!==other.question||
     plan.tasks[1].teacherReferenceOnly.reasonId!==proposal.localReasonId||
     plan.tasks[2].teacherReferenceOnly.reasonId!==proposal.transferReasonId){
   issues.push('TASK_SOURCE_OR_PLAN_MISMATCH:'+plan.id);continue;
  }
  const tasks=plan.tasks.map((task,i)=>{
   const destination=i===2?plan.transferExperienceId:plan.originExperienceId;
   const source=i===2?other:original;
   const actionType=i===0?'EXPLAIN_CAUSAL_INTENT':'AUTHOR_OWN_CONTEXTUAL_REASON';
   return Object.freeze({
    dimension:task.dimension,
    experienceId:destination,questionWord:'why',language:plan.language,
    learnerFacing:Object.freeze({
      question:source.question,
      instruction:i===0?localized.instruction:null,
      expectedActionType:actionType,
      modelAnswerVisible:false,teacherContrastVisible:false,
      speechPlaybackNotSufficient:true
    }),
    teacherOnly:Object.freeze({
      referenceReasonId:source.cases.find(c=>c.kind==='MODEL_ECHO')?.id||null,
      referenceAnswer:source.teacherOnlyReference,
      contrastAnswer:source.teacherOnlyContrast,
      semanticCriteria:'H14.27-H14.33 HUMAN_REVIEW_NOT_AUTO_GRADE'
    }),
    requiredIntent:i===2?'transfer':'start_or_resume',
    sourceBlueprintStatus:task.status,
    needsIndependentAuthoring:i===0?true:false,
    observedLearnerAction:false,
    sourceTextMayHaveBeenHeard:true,
    independenceProven:false,
    curriculumApproval:null,
    twoIndependentTeacherReviews:null,
    mediation:null,
    newEvaluationContract:false,
    assessmentAuthority:false,
    evidence:false
   });
  });
  packets.push(Object.freeze({
   id:'H14.38-'+plan.originExperienceId+'-'+plan.language,
   proposalId:proposal.id,language:plan.language,
   originExperienceId:plan.originExperienceId,
   transferExperienceId:plan.transferExperienceId,
   skill:plan.skill,
   scopeFields:Object.freeze([...plan.scopeFields]),
   taskDimensionOrder:dimensions,
   tasks:Object.freeze(tasks),
   freeNavigation:true,
   transferMayBeExploredBeforeLocal:true,
   originDoesNotChangeWhenSwitchingScene:true,
   neitherSceneVisitNorAudioGeneratesEvidence:true,
   requiresExplicitOriginAndIntent:true,
   reuseOccurrenceAcrossOriginsProhibited:true,
   humanHomologation:'PENDING',
   contractStatus:'DRAFT_NOT_AUTHORIZED',
   assessmentAuthority:false,greenPass:false,evidence:false
  }));
 }
 if(packets.length!==6||new Set(packets.map(x=>x.id)).size!==6)
  issues.push('SIX_PLAN_COVERAGE_FAILED');
 const all=packets.flatMap(x=>x.tasks);
 return Object.freeze({
  id:'JAGUAR-H14.38',status:issues.length?'STOP_RECONCILE_STUDY':'TASK_SOURCE_PACKETS_READY_HUMAN_REVIEW_PENDING',
  phase:'PH3',gates:Object.freeze(['HG-04','HG-05','HG-09','HG-10']),
  counts:Object.freeze({originContracts:2,languagePlans:packets.length,
   independentTaskSlots:all.length,actualLearnerAttempts:0,
   actualTeacherReviews:0,newAuthorizedContracts:0}),
  packets:Object.freeze(packets),issues:Object.freeze(issues),
  limitation:Object.freeze({noFreeTextGrading:true,noIndependentActionProvenByMetadata:true,
   noEvidenceFromObservedNavigation:true,sourceModelMayHaveBeenExposedPreviously:true,
   noImplicitPrerequisiteWhichOrHow:true,onlyPresentAffirmativeSource:true}),
  protection:Object.freeze({source:'H14.36-integration-preflight',mainUntouched:true,pr3Untouched:true,
   func13Hidden:true,patitaObservationOnly:true,learningTrailUnchanged:true,
   existingS3S4CanonicalUnchanged:true,noMergeAuthority:true}),
  evidence:false,greenPass:false
 });
}
// Candidate metadata is deliberately synthetic/non-identifying: never accept
// raw answer, learner ID, score, state transition or live attempt to be graded.
function inspectIllustrativeCandidate({packet,dimension,event}={}){
 const deny=(status,reason)=>Object.freeze({status,reason,kind:'STUDY_METADATA_ONLY',
  realLearnerEvaluated:false,independenceVerified:false,semanticApproval:null,
  canMintEvidence:false,canGrantGreenPass:false});
 if(!packet||!packet.tasks||!packet.tasks.some(x=>x.dimension===dimension))
  return deny('STOP_UNKNOWN_PACKET_OR_DIMENSION','UNKNOWN_TASK');
 if(!event||typeof event!=='object')return deny('STOP_MISSING_ACTION','NO_ACTION');
 if(['answerText','learnerId','score','evidence','canonicalProgress','attemptId'].some(k=>Object.hasOwn(event,k)))
  return deny('STOP_FORBIDDEN_LIVE_LEARNER_FIELDS','NO_LIVE_ANSWER_OR_LEARNER_RECORDS');
 const task=packet.tasks.find(x=>x.dimension===dimension);
 if(event.originExperienceId!==packet.originExperienceId||
    event.experienceId!==task.experienceId||event.language!==packet.language||
    event.dimension!==dimension||event.questionWord!=='why')
  return deny('STOP_CONTEXT_OR_ORIGIN_MISMATCH','SCOPED_SOURCE_DIFFERENCE');
 if(dimension==='reason-answer(transfer)'?event.intent!=='transfer':
    !['start','resume'].includes(event.intent))
  return deny('STOP_INTENT_MISMATCH','NO_IMPLICIT_TRANSFER_OR_START');
 if(typeof event.occurrenceId!=='string'||event.occurrenceId.trim().length<3)
  return deny('STOP_MISSING_OCCURRENCE','NOT_A_PROOF_OF_ACTION');
 if(event.actionType==='SPEECH_PLAYBACK'||event.actionType==='SCENE_VISIT')
  return deny('NOT_AN_INDEPENDENT_TEXT_RESPONSE','AUDIO_OR_NAVIGATION_ONLY');
 if(event.actionType!==task.learnerFacing.expectedActionType||event.observed!==true||
    event.actor!=='learner')
  return deny('STOP_NO_QUALIFYING_AUTHOR_ACTION','NO_INDEPENDENT_ACTION');
 if(event.modelExposedBeforeAction!==false)
  return deny('NEEDS_UNBIASED_INDEPENDENCE_CHECK','EXPOSURE_UNKNOWN_OR_TRUE');
 return deny('CANDIDATE_FOR_HUMAN_TASK_REVIEW_ONLY','METADATA_CAN_NOT_PROVE_MEANING_OR_INDEPENDENCE');
}
function inspectIllustrativeBatch({packet,events=[]}={}){
 if(!Array.isArray(events))return Object.freeze({status:'INVALID_BATCH',results:Object.freeze([]),
  duplicates:Object.freeze([]),canMintEvidence:false});
 const ids=new Set(),duplicates=new Set();
 for(const e of events){
  if(typeof e?.occurrenceId==='string'&&e.occurrenceId.trim()){
   if(ids.has(e.occurrenceId))duplicates.add(e.occurrenceId);
   ids.add(e.occurrenceId);
  }
 }
 const results=events.map(e=>duplicates.has(e?.occurrenceId)?
   Object.freeze({status:'STOP_REUSED_OCCURRENCE',reason:'DUPLICATE_IN_BATCH',
    canMintEvidence:false,canGrantGreenPass:false}):
   inspectIllustrativeCandidate({packet,dimension:e?.dimension,event:e}));
 return Object.freeze({status:duplicates.size?'BATCH_HAS_REUSED_OCCURRENCES':'BATCH_STUDY_ONLY',
  results:Object.freeze(results),duplicates:Object.freeze([...duplicates]),
  canMintEvidence:false,canGrantGreenPass:false});
}
module.exports=Object.freeze({build,inspectIllustrativeCandidate,inspectIllustrativeBatch});
if(require.main===module){
 const out=build();
 if(!out||out.issues.length){console.error('H14.38 source drift',out?.issues);process.exitCode=1;}
 else if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(out,null,2)+'\n');
 else console.log('H14.38 '+JSON.stringify(out.counts)+' '+out.status);
}
