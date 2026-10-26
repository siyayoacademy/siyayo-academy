'use strict';
// H14.64: human pedagogical homologation INTAKE & readiness gate. Offline, NO credit.
// Reviewer IDs and claimed judgments have no verified authorship in this laboratory.
// No persistent answers, grade authority, contract changes or real learner data.
const h63=require('./jaguar-h14-63-why-six-plan-handoff.js');
const h37=require('./jaguar-h14-37-trilingual-semantic-review.js');
const prior=require('../data/learning/references/jaguar-h14-33-why-semantic-homologation-reference-v0.1.json');
const STATES=Object.freeze(['CAUSALLY_GROUNDED','PARTIAL_NEEDS_PROBE','MEANING_UNVERIFIED','OFF_CONTEXT']);
const EXPRESSION=Object.freeze(['CLEAR','UNDERSTANDABLE_WITH_ERRORS','UNCLEAR']);
const LABELS=Object.freeze(['PASS','REVISE','BLOCK']);
const ALLOWED_REVIEW=['packetId','dimension','reviewerId','role','causalJudgment','languageJudgment','independenceJudgment',
  'sourceProvenanceJudgment','contextualBand','rationale','observedFacts'];
const ALLOWED_MEDIATION=['packetId','dimension','mediatorId','role','sourceResolution','proposedCausalJudgment','rationale','observedFacts'];
const sorted=x=>x.slice().sort().join(',');
const isRecord=x=>x&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>isRecord(x)&&sorted(Object.keys(x))===sorted(keys);
const validId=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{2,50}$/.test(x);
const words=x=>typeof x==='string'&&x.trim().length>=30&&x.length<=1800;
const safeFacts=x=>Array.isArray(x)&&x.length>=1&&x.length<=6&&x.every(v=>typeof v==='string'&&v.trim().length>=8&&v.length<=350);
const freeze=x=>Object.freeze(x);
function build(){
 const original=h63.build(),review=h37.inspect(),issues=[];
 if(original.status!=='SIX_PLAN_PEDAGOGICAL_HANDOFF_REVIEW_PENDING'||original.issues.length||
    original.packets.length!==6||review.status!=='TRILINGUAL_REVIEW_READY_NOT_HOMOLOGATED'||
    review.packets.length!==6||review.triplets.length!==16||review.issues.length)
  issues.push('PRIOR_LAB_SOURCE_DRIFT');
 if(prior.homologationGates?.length!==15||
   prior.reviewEvidence?.realTeacherReviewsCollected!==0||
   prior.reviewEvidence?.realTeacherMediationsCollected!==0)
  issues.push('HUMAN_REVIEW_STATUS_CHANGED_RECHECK_REQUIRED');
 const tasks=(original.packets||[]).flatMap(packet=>packet.slots.map(slot=>freeze({
  taskId:packet.packetId+'|'+slot.dimension,
  packetId:packet.packetId,proposalId:packet.proposalId,
  dimension:slot.dimension,originExperienceId:packet.originExperienceId,
  targetExperienceId:slot.experienceId,language:packet.language,
  questionWord:'why',expectedLearnerAction:slot.expectedLearnerAction,
  authoringStatus:slot.promptStatus,learnerPromptDraft:slot.publicPromptDraft,
  reviewerOne:null,reviewerTwo:null,mediation:null,
  reviewEvidenceVerified:false,humanHomologation:null,
  semanticDecision:null,languageDecision:null,
  assessmentAuthority:false,evidence:false,greenPass:false
 })));
 if(tasks.length!==18||new Set(tasks.map(x=>x.taskId)).size!==18)
  issues.push('INCOMPLETE_TASK_REVIEW_PACKET');
 const comparisons=review.triplets.map(p=>freeze({comparisonId:p.id,
  experienceId:p.experienceId,caseKind:p.caseKind,dimension:p.dimension,
  // IDs and status only; source case answer text remains in teacher-only lab.
  caseIds:freeze([...p.caseIds]),languages:freeze([...p.languageOrder]),
  semanticEquivalenceVerified:false,
  reviewOne:null,reviewTwo:null,mediation:null,homologation:null
 }));
 const gates=prior.homologationGates.map(g=>freeze({id:g.id,area:g.area,
  originalStatus:g.status,actualHumanSignoff:null,closed:false}));
 return freeze({id:'JAGUAR-H14.64',status:issues.length?'STOP_RECONCILE_SOURCE':'PEDAGOGICAL_REVIEW_INSTRUMENT_READY_NOT_HOMOLOGATED',
  source:'H14.63 + H14.37 + H14.33',
  counts:freeze({plans:6,taskReviews:tasks.length,syntheticCaseReferences:48,
   trilingualCaseComparisons:comparisons.length,hgGates:gates.length,
   actualHumanReviews:0,actualMediations:0,homologatedTasks:0,authorizedContracts:0}),
  tasks:freeze(tasks),trilingualCaseComparisons:freeze(comparisons),gates:freeze(gates),issues:freeze(issues),
  obligations:freeze([
   'Distinct independently verified pedagogical reviewers; never infer identity from a typed ID',
   'Reviewer rationale grounded in original Experience facts and correct referents for each language',
   'Separate semantic causal correctness from language expression and contextual 0/4',
   'Separate local cause from transfer cause; no exact-string or scene-order criterion',
   'Unbiased learner prompt, no previously revealed teacher model; author question-function task',
   'Resolve genuine disagreements with independently verified mediator and explicit source facts',
   'Explicit institutional human signoff; do not auto-promote a reference to assessmentTarget',
   'Keep HG-11 through HG-15 open until integration, privacy, runtime and PERIOD work'
  ]),
  reviewerAuthenticityVerified:false,mayHomologate:false,
  mayEvaluateLearnerText:false,mayIssueFeedback:false,
  mayChangeAssessmentTargets:false,mayStartAssessment:false,
  mayWriteEvidence:false,mayGrantGreenPass:false,
  s3s4Preserved:true,nickIsRealIdentity:false,patitaIsEvaluator:false,
  mainUntouched:true,pr3Untouched:true,func13Hidden:true,
  d1RemoteUntouched:true});
}
function reviewValid(r,packetId,dimension){
 return exact(r,ALLOWED_REVIEW)&&r.packetId===packetId&&r.dimension===dimension&&
  validId(r.reviewerId)&&r.role==='PEDAGOGICAL_REVIEWER'&&STATES.includes(r.causalJudgment)&&
  EXPRESSION.includes(r.languageJudgment)&&LABELS.includes(r.independenceJudgment)&&
  LABELS.includes(r.sourceProvenanceJudgment)&&(r.contextualBand===null||
  (Number.isInteger(r.contextualBand)&&r.contextualBand>=0&&r.contextualBand<=4))&&
  words(r.rationale)&&safeFacts(r.observedFacts);
}
function mediationValid(m,packetId,dimension,reviewers){
 return exact(m,ALLOWED_MEDIATION)&&m.packetId===packetId&&m.dimension===dimension&&
  validId(m.mediatorId)&&!reviewers.some(r=>r.reviewerId===m.mediatorId)&&
  m.role==='PEDAGOGICAL_MEDIATOR'&&
  ['GROUNDED_IN_SCENE','UNVERIFIED','CONTRADICTED','NOT_APPLICABLE'].includes(m.sourceResolution)&&
  STATES.includes(m.proposedCausalJudgment)&&words(m.rationale)&&safeFacts(m.observedFacts)&&
  !(m.sourceResolution==='CONTRADICTED'&&m.proposedCausalJudgment==='CAUSALLY_GROUNDED')&&
  !(m.sourceResolution==='UNVERIFIED'&&m.proposedCausalJudgment==='CAUSALLY_GROUNDED');
}
function inspect({instrument=build(),packetId,dimension,reviews=[],mediation=null}={}){
 const denied=(status)=>freeze({status,reviewClaims:0,verifiedHumanReviews:0,
  humanAuthorization:false,canHomologate:false,canIssueEvidence:false,canGrantGreenPass:false});
 if(instrument?.status!=='PEDAGOGICAL_REVIEW_INSTRUMENT_READY_NOT_HOMOLOGATED'||
    !instrument.tasks?.some(t=>t.packetId===packetId&&t.dimension===dimension)||
    !Array.isArray(reviews)||reviews.length>2)return denied('INVALID_REVIEW_TARGET_OR_SET');
 if(reviews.some(r=>!reviewValid(r,packetId,dimension))||
   reviews.length===2&&reviews[0].reviewerId===reviews[1].reviewerId)return denied('INVALID_OR_NONINDEPENDENT_REVIEW');
 if(reviews.length<2)return denied('AWAITING_TWO_REAL_VERIFIED_REVIEWS');
 const [one,two]=reviews;
 const disagreed=one.causalJudgment!==two.causalJudgment||
  one.languageJudgment!==two.languageJudgment||
  one.independenceJudgment!==two.independenceJudgment||
  one.sourceProvenanceJudgment!==two.sourceProvenanceJudgment||
  one.contextualBand!==two.contextualBand;
 if(disagreed){
  if(!mediation)return freeze({...denied('DIVERGENCE_REQUIRES_INDEPENDENT_MEDIATOR'),reviewClaims:2});
  if(!mediationValid(mediation,packetId,dimension,reviews))
   return denied('INVALID_MEDIATION_PROPOSAL');
  return freeze({...denied('MEDIATION_CLAIM_REQUIRES_REAL_IDENTITY_AND_SIGNOFF'),reviewClaims:2,
    mediationClaimed:true,conflictObserved:true});
 }
 if(mediation!==null)return denied('MEDIATION_NOT_NEEDED_FOR_MATCHING_CLAIMS');
 return freeze({...denied('TWO_CONSISTENT_CLAIMS_REQUIRES_REAL_IDENTITY_AND_SIGNOFF'),
  reviewClaims:2,conflictObserved:false});
}
module.exports=freeze({build,inspect,reviewValid,mediationValid,STATES,EXPRESSION,LABELS});
if(require.main===module){
 const result=build();if(result.issues.length){console.error(result.issues);process.exitCode=1;}
 else if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(result,null,2)+'\n');
 else console.log('H14.64 review gate',result.counts,result.status);
}
