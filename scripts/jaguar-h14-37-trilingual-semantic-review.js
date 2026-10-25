'use strict';
// JAGUAR H14.37 · HG-06 / HG-07 / HG-08: read-only trilingual parity study.
// Compares author-defined case metadata, NOT the semantic meaning of free text.
// Never treats matching tags, CI success or a teacher example as homologation.
const phase1=require('./jaguar-h14-36-phase1-source-review.js');
const casesSource=require('./jaguar-h14-28-semantic-contrast-bank.js');
const risksSource=require('./jaguar-h14-29-semantic-risk-audit.js');
const guidanceSource=require('./jaguar-h14-30-supervised-semantic-protocol.js');
const rubric=require('../data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json');
const LANGUAGES=Object.freeze(['en','es','pt']);
const EXPERIENCES=Object.freeze(['shopping-for-dinner','preparing-dinner']);
const KINDS=Object.freeze(['GROUNDED_PARAPHRASE','MINOR_LANGUAGE_ERROR','PARTIAL_REASON',
  'OFF_CONTEXT','MANNER_INSTEAD_OF_REASON','PLAUSIBLE_UNVERIFIED',
  'FUNCTION_PARAPHRASE','MODEL_ECHO']);
const STUDY_QUESTIONS=Object.freeze({
 HG_06:'Does this expression preserve the intended meaning, pronoun referent and situational pragmatics across EN/ES/PT?',
 HG_07:'Is language expression independently understandable, and which deviations actually change meaning?',
 HG_08:'Is the reason grounded in the authored scene, a nonliteral paraphrase, a partial reason or an unverified invented premise?'
});
const EXPECTED_LANGUAGE_SIGNALS=Object.freeze({
 'shopping-for-dinner':Object.freeze({
 en:'Subject–verb agreement in "mild cheese go well"; minor error deliberately authored in laboratory',
 es:'Accent in "salmón" omitted in error example; reference queso fresco y suave and salmon pairing',
 pt:'Accent in "salmão" omitted in error example; cheese/salmon pairing remains the reference'
 }),
 'preparing-dinner':Object.freeze({
 en:'Subject–verb agreement in "cooking together make"; reference sharing the dinner experience',
 es:'Nonstandard accent "compartír" in error example; "prepararla" refers back to "la cena"',
 pt:'Infinitive "compartilhar" versus "compartilha" in error example; "prepará-lo" refers back to "o jantar"'
 })
});
function inspect({bankCases=casesSource.cases,riskCases=risksSource.cases,
  feedbackCases=guidanceSource.cases,phaseOne=phase1.inspect()}={}){
 const issues=[],packets=[],triplets=[];
 if(phaseOne.status!=='PHASE1_SOURCES_VERIFIED_HUMAN_REVIEW_PENDING'||
    phaseOne.sourceIntegrityMatches!==6||phaseOne.issues?.length)
   issues.push('H14_36_PHASE1_NOT_SOURCE_VERIFIED');
 const lookup=(arr,field)=>new Map(arr.map(c=>[c[field],c]));
 const riskBy=lookup(riskCases,'id'),feedbackBy=lookup(feedbackCases,'id');
 const byCombo=new Map();
 for(const context of EXPERIENCES){
  const rubricTask=rubric.tasks.find(t=>t.experienceId===context);
  if(!rubricTask){issues.push('MISSING_H14_27_RUBRIC:'+context);continue;}
  for(const language of LANGUAGES){
   const provenance=phaseOne.packets.find(p=>p.origin===context&&p.language===language);
   const localized=rubricTask.localized?.[language];
   if(!provenance||!provenance.sourceIntegrityChecksPassed||!localized){
    issues.push('MISSING_PROVENANCE_OR_RUBRIC:'+context+':'+language);continue;
   }
   const selected=bankCases.filter(c=>c.experienceId===context&&c.language===language);
   const byKind=new Map(selected.map(c=>[c.caseKind,c]));
   if(selected.length!==8||byKind.size!==8||KINDS.some(kind=>!byKind.has(kind))){
    issues.push('CASE_KIND_COVERAGE:'+context+':'+language);continue;
   }
   const cases=[];
   for(const kind of KINDS){
    const value=byKind.get(kind),risk=riskBy.get(value.id),feedback=feedbackBy.get(value.id);
    if(!risk||!feedback||risk.caseKind!==kind||risk.language!==language||risk.experienceId!==context||
     feedback.language!==language||feedback.experienceId!==context||
     feedback.dimension!==value.dimension||!value.response?.trim()||
     value.sourceProvenance!=='NEW_EXPLICITLY_SYNTHESIZED_LAB_EXAMPLE'||
     value.authority?.evidence!==false||feedback.assessment!==false){
      issues.push('CASE_PROVENANCE_OR_FEEDBACK_DRIFT:'+value.id);continue;
    }
    if(kind==='MODEL_ECHO'&&value.response!==provenance.teacherOnlyReference)
      issues.push('MODEL_ECHO_NOT_SOURCE_REFERENCE:'+value.id);
    if(kind==='GROUNDED_PARAPHRASE'&&value.response===provenance.teacherOnlyReference)
      issues.push('NON_LITERAL_PARAPHRASE_COPIES_REFERENCE:'+value.id);
    const caseReview=Object.freeze({
      id:value.id,kind,dimension:value.dimension,text:value.response,
      authoredMeaningAnchor:value.teacherMeaningAnchor,authorHypothesis:value.semanticTag,
      authorExpressionHypothesis:value.expressionQuality,
      knownRiskCategory:risk.riskClass,teacherGuidanceDraft:feedback.feedbackDraft,
      supervisedStateHypothesis:feedback.hypothesis,
      reviewStatus:'AWAITING_HUMAN_REVIEW',
      semanticEquivalenceApproval:null,languageQualityApproval:null,
      contextualGroundingApproval:null,reviewerRationale:null,
      automaticAcceptance:false,learnerAttempt:false,evidence:false,greenPass:false
    });
    cases.push(caseReview);
    byCombo.set(context+':'+kind+':'+language,caseReview);
   }
   packets.push(Object.freeze({
     id:'H14.37-'+context+'-'+language,experienceId:context,language,
     question:provenance.question,
     teacherOnlyReference:provenance.teacherOnlyReference,
     teacherOnlyContrast:provenance.teacherOnlyContrast,
     purpose:'HUMAN_HOMOLOGATION_REVIEW_NOT_LEARNER_FEEDBACK',
     linguisticReviewCue:EXPECTED_LANGUAGE_SIGNALS[context][language],
     functionRecognitionInstruction:localized.instruction,
     sourceIntegrityVerified:true,humanSemanticHomologation:false,
     hg06:null,hg07:null,hg08:null,reviewerId:null,reviewerRationale:null,
     cases:Object.freeze(cases),assessmentAuthority:false,evidence:false
   }));
  }
  for(const kind of KINDS){
    const members=LANGUAGES.map(language=>byCombo.get(context+':'+kind+':'+language));
    if(members.some(x=>!x)){issues.push('MISSING_TRILINGUAL_ALIGNMENT:'+context+':'+kind);continue;}
    if(new Set(members.map(x=>x.kind)).size!==1||
       new Set(members.map(x=>x.dimension)).size!==1||
       new Set(members.map(x=>x.authoredMeaningAnchor)).size===0){
      issues.push('METADATA_ALIGNMENT_MISMATCH:'+context+':'+kind);continue;
    }
    const candidateTags=members.map(m=>m.authorHypothesis);
    const candidateStates=members.map(m=>m.supervisedStateHypothesis);
    if(new Set(candidateTags).size!==1||new Set(candidateStates).size!==1)
      issues.push('AUTHOR_TAG_DIVERGENCE_REQUIRES_REVIEW:'+context+':'+kind);
    triplets.push(Object.freeze({
      id:'H14.37-'+context+'-'+kind,experienceId:context,caseKind:kind,
      dimension:members[0].dimension,caseIds:Object.freeze(members.map(m=>m.id)),
      languageOrder:LANGUAGES,originalHypothesisAlignment:new Set(candidateTags).size===1,
      teacherCrossLanguageMeaningApproval:null,teacherCrossLanguagePragmaticsApproval:null,
      teacherGroundingApproval:null,
      alignedLabelsDoNotProveTranslation:true,humanReviewRequired:true,
      adjudicationIfMeaningDiffers:'STOP_AND_REVISE_CASE_REFERENCE',
      canonicalAssessmentAuthority:false,canonicalEvidence:false
    }));
  }
 }
 const count=packets.reduce((n,x)=>n+x.cases.length,0);
 if(packets.length!==6||count!==48||triplets.length!==16)
  issues.push('STRUCTURAL_COVERAGE_MISMATCH');
 return Object.freeze({
  id:'JAGUAR-H14.37',status:issues.length?'STOP_RECONCILE_SOURCES':'TRILINGUAL_REVIEW_READY_NOT_HOMOLOGATED',
  phase:'PH2',gates:Object.freeze(['HG-06','HG-07','HG-08']),
  reviewQuestions:STUDY_QUESTIONS,
  counts:Object.freeze({experiences:2,languages:3,reviewPackets:packets.length,
    syntheticCases:count,semanticTriplets:triplets.length,realHumanReviews:0,
    gatesHomologated:0,integrationsAuthorized:0}),
  packets:Object.freeze(packets),triplets:Object.freeze(triplets),issues:Object.freeze(issues),
  limitations:Object.freeze({metadataChecksNotSemanticTranslationProof:true,
    noStringEquivalenceScoring:true,teacherReviewStillRequired:true,
    onlyPresentAffirmativeReferences:true,periodGearGapRemains:true}),
  integration:Object.freeze({mainUntouched:true,pr3Untouched:true,productionUntouched:true,
    func13Hidden:true,patitaObservationalOnly:true,eval08ContractsUnchanged:true,
    approvalForSelectiveMerge:false}),evidence:false,greenPass:false
 });
}
module.exports=Object.freeze({inspect,KINDS,LANGUAGES,EXPERIENCES});
if(require.main===module){
 const report=inspect();if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else console.log('H14.37 trilingual review '+JSON.stringify(report.counts)+' '+report.status);
 if(report.issues.length)process.exitCode=1;
}
