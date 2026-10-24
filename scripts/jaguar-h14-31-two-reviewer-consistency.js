'use strict';
// JAGUAR H14.31 — consistency of two teacher REVIEWS on SYNTHETIC lab cases.
// No natural-language grading, no learner submissions, no contractual evaluation.
const previous=require('./jaguar-h14-30-supervised-semantic-protocol.js');
const cases=new Map(previous.cases.map(c=>[c.id,c]));
const STATES=Object.freeze(['COHERENT','PARTIAL','NEEDS_REVIEW','INCOHERENT']);
const EXPRESSION=Object.freeze(['CLEAR','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS','MEANING_UNCLEAR']);
const REASON=Object.freeze([
 'CASE_INTENT_DISPUTE','CONTEXT_REFERENT_DISPUTE','UNVERIFIED_PREMISE',
 'LINGUISTIC_MEANING_UNCLEAR','MODEL_INDEPENDENCE_UNKNOWN','RUBRIC_BAND_DIFFERENCE'
]);
const labMetadata=Object.freeze({id:'JAGUAR-H14.31',status:'TWO_REVIEWER_METHOD_NOT_AUTOMATED_SCORING',
 sources:['H14.27 teacher rubric','H14.28 48 synthetic cases','H14.29 risk classes','H14.30 proposed feedback'],
 sourceBaseline:'jaguar/h14-30-supervised-semantic-feedback-protocol',
 assessmentAuthority:false,learnerFeedbackAuthority:false,canonicalEvidence:false,patitaWrite:false});
const reviewKey=r=>r?.reviewerId;
function validReview(r,reference){
 if(!r||typeof r!=='object'||!reference)return false;
 if(r.caseId!==reference.id||r.experienceId!==reference.experienceId||r.language!==reference.language||r.dimension!==reference.dimension)return false;
 if(!/^[A-Za-z0-9_-]{2,40}$/.test(r.reviewerId||'')||r.role!=='TEACHER_REVIEW')return false;
 if(!STATES.includes(r.state)||!EXPRESSION.includes(r.expressionQuality))return false;
 if(r.contextualBand!==null&&(!Number.isInteger(r.contextualBand)||r.contextualBand<0||r.contextualBand>4))return false;
 if(typeof r.rationale!=='string'||r.rationale.trim().length<12)return false;
 if(r.learnerAttemptId!==undefined||r.learnerId!==undefined||r.canonicalProgress!==undefined||r.evidence!==undefined)return false;
 return true;
}
function inspect(caseId,submitted=[]){
 const source=cases.get(caseId);
 if(!source)return Object.freeze({caseId,status:'UNKNOWN_REFERENCE',reviewers:0,semanticAgreement:null,expressionAgreement:null,bandAgreement:null,assessmentAuthority:false,evidence:false});
 if(!Array.isArray(submitted)||submitted.length>2||submitted.some(r=>!validReview(r,source))||
 (submitted.length===2&&reviewKey(submitted[0])===reviewKey(submitted[1]))){
  return Object.freeze({caseId,status:'INVALID_REVIEW_SET',reviewers:0,semanticAgreement:null,expressionAgreement:null,bandAgreement:null,assessmentAuthority:false,evidence:false});
 }
 if(submitted.length<2)return Object.freeze({caseId,status:'AWAITING_SECOND_INDEPENDENT_REVIEW',
  reviewers:submitted.length,semanticAgreement:null,expressionAgreement:null,bandAgreement:null,
  assessmentAuthority:false,evidence:false});
 const [a,b]=submitted;
 const semanticAgreement=a.state===b.state,expressionAgreement=a.expressionQuality===b.expressionQuality;
 const bandAgreement=a.contextualBand===b.contextualBand;
 const bandComparable=a.contextualBand!==null&&b.contextualBand!==null;
 const gap=bandComparable?Math.abs(a.contextualBand-b.contextualBand):null;
 const flags=[];
 if(!semanticAgreement)flags.push('STATE_DISAGREEMENT');
 if(!bandAgreement)flags.push(gap!==null&&gap>1?'MATERIAL_BAND_DISAGREEMENT':'BAND_DIFFERENCE_OR_MISSING');
 if(!expressionAgreement)flags.push('LANGUAGE_QUALITY_DISAGREEMENT');
 if(source.riskClass==='AMBIGUITY')flags.push('SOURCE_PREMISE_OR_REFERENT_REVIEW');
 if(source.riskClass==='FALSE_POSITIVE'&&source.hypothesis==='NEEDS_REVIEW')flags.push('INDEPENDENCE_REVIEW');
 // An authored lab tag cannot override a teacher's contextual judgment, but
 // unverified premises and model echoes may never become auto-approved.
 const requiredReview=source.riskClass==='AMBIGUITY'||source.hypothesis==='NEEDS_REVIEW';
 const status=flags.includes('STATE_DISAGREEMENT')||flags.includes('MATERIAL_BAND_DISAGREEMENT')?
  'NEEDS_SEMANTIC_ADJUDICATION':flags.includes('LANGUAGE_QUALITY_DISAGREEMENT')?
  'NEEDS_LANGUAGE_ADJUDICATION':requiredReview?
  'NEEDS_SOURCE_OR_INDEPENDENCE_REVIEW':'CONSISTENT_REVIEWS_PENDING_HOMOLOGATION';
 return Object.freeze({caseId,status,reviewers:2,semanticAgreement,expressionAgreement,bandAgreement,
  contextualBandGap:gap,flags:Object.freeze(flags),
  // Even two matching teacher reviews of demonstration data are not assessment evidence.
  caseDimension:source.dimension,caseLanguage:source.language,
  suggestedFeedbackOnly:source.feedbackDraft,
  semanticStateForStudy:semanticAgreement?a.state:null,
  finalGrade:null,canonicalProgress:null,acceptedAsLearnerEvidence:false,
  assessmentAuthority:false,evidence:false});
}
function compareBatch(submissions=[]){
 if(!Array.isArray(submissions))return null;
 const results=submissions.map(x=>inspect(x.caseId,x.reviews));
 const completed=results.filter(r=>r.reviewers===2);
 const report=Object.freeze({id:labMetadata.id,status:'REVIEW_DIAGNOSTICS_NOT_REAL_RELIABILITY_PROOF',
  sourceSample:'CALLER_SUPPLIED_REVIEWS',
  cases:results.length,pairedReviews:completed.length,
  exactSemanticAgreement:completed.filter(x=>x.semanticAgreement===true).length,
  exactExpressionAgreement:completed.filter(x=>x.expressionAgreement===true).length,
  needsAdjudication:completed.filter(x=>x.status.startsWith('NEEDS_')).length,
  results:Object.freeze(results),evidence:false,scoringAuthority:false});
 return report;
}
module.exports=Object.freeze({metadata:labMetadata,STATES,EXPRESSION,REASON,validReview,inspect,compareBatch,referenceCaseIds:Object.freeze([...cases.keys()])});
if(require.main===module)console.log('H14.31 two-rater review instrument: 48 references, no real reviews, no statistical reliability inferred');
