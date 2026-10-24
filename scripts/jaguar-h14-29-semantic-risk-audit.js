'use strict';
// H14.29 – read-only risk triage for authored laboratory cases; never scores a learner.
const bank=require('./jaguar-h14-28-semantic-contrast-bank.js');
const rule={
 GROUNDED_PARAPHRASE:{risk:'FALSE_NEGATIVE',guard:'DO_NOT_REJECT_DUE_TO_NON_LITERAL_WORDING',review:'VERIFY_SCENE_CAUSAL_RELATION'},
 MINOR_LANGUAGE_ERROR:{risk:'FALSE_NEGATIVE',guard:'SEPARATE_LANGUAGE_FROM_SEMANTICS',review:'VERIFY_MEANING_REMAINS_INTELLIGIBLE'},
 PARTIAL_REASON:{risk:'AMBIGUITY',guard:'DO_NOT_INFER_MISSING_REFERENT',review:'REQUEST_CONTEXTUAL_DETAIL'},
 OFF_CONTEXT:{risk:'FALSE_POSITIVE',guard:'REJECT_CONTRADICTED_SCENE_AS_CONFIDENT_PASS',review:'CHECK_ACTUAL_SCENE'},
 MANNER_INSTEAD_OF_REASON:{risk:'FALSE_POSITIVE',guard:'CHECK_REQUESTED_INFORMATION_TYPE_WHY_VS_HOW',review:'EXPLAIN_CAUSAL_INTENT'},
 PLAUSIBLE_UNVERIFIED:{risk:'AMBIGUITY',guard:'NO_NEW_FACTS_WITHOUT_GROUNDING',review:'ASK_IF_PREMISE_IS_IN_SCENE'},
 FUNCTION_PARAPHRASE:{risk:'DIMENSION_CONFUSION',guard:'FUNCTION_PROOF_NOT_LOCAL_REASON',review:'CHECK_TASK_DIMENSION'},
 MODEL_ECHO:{risk:'FALSE_POSITIVE',guard:'EXACT_MATCH_NOT_INDEPENDENCE_PROOF',review:'CHECK_OBSERVED_INDEPENDENT_ATTEMPT'}
};
const cases=bank.cases.map(c=>Object.freeze({
 id:c.id,experienceId:c.experienceId,language:c.language,caseKind:c.caseKind,dimension:c.dimension,
 text:c.response,semanticTag:c.semanticTag,expressionQuality:c.expressionQuality,
 riskClass:rule[c.caseKind].risk,protectiveRule:rule[c.caseKind].guard,humanReview:rule[c.caseKind].review,
 proposedBand:null,acceptanceDecision:'DEFER_TO_HUMAN_REVIEW',
 learnerObserved:false,assessmentAuthority:false,evidence:false,greenPass:false,
 source:'JAGUAR_H14_28_SYNTHESIZED_LAB_ONLY'
}));
const pairs=[];
for(const context of ['shopping-for-dinner','preparing-dinner'])for(const language of ['en','es','pt']){
 const sample=kind=>cases.find(c=>c.experienceId===context&&c.language===language&&c.caseKind===kind);
 for(const [a,b,type] of [['GROUNDED_PARAPHRASE','MINOR_LANGUAGE_ERROR','SEMANTIC_EQUALITY_WITH_LANGUAGE_VARIATION'],
 ['GROUNDED_PARAPHRASE','PLAUSIBLE_UNVERIFIED','SOURCE_GROUNDING_BOUNDARY'],
 ['FUNCTION_PARAPHRASE','MODEL_ECHO','QUESTION_FUNCTION_VS_LOCAL_REASON'],
 ['PARTIAL_REASON','OFF_CONTEXT','INCOMPLETE_VS_CONTRADICTED_SCENE']]){
 pairs.push(Object.freeze({experienceId:context,language,pairType:type,firstCaseId:sample(a).id,secondCaseId:sample(b).id,
  expectedDecision:'HUMAN_COMPARATIVE_REVIEW',canonicalScore:null}));
 }
}
const result=Object.freeze({id:'JAGUAR-H14.29',status:'STUDY_ONLY_NOT_A_GRADER',
 counts:{cases:cases.length,comparisonPairs:pairs.length,falseNegativeRisks:cases.filter(c=>c.riskClass==='FALSE_NEGATIVE').length,
 falsePositiveRisks:cases.filter(c=>c.riskClass==='FALSE_POSITIVE').length,
 ambiguities:cases.filter(c=>c.riskClass==='AMBIGUITY').length,
 dimensionConfusions:cases.filter(c=>c.riskClass==='DIMENSION_CONFUSION').length},
 cases:Object.freeze(cases),comparisonPairs:Object.freeze(pairs),
 separateAxes:['SEMANTIC_CONTEXT_0_4_TEACHER_GUIDE','LANGUAGE_EXPRESSION','CANONICAL_PROGRESS_0_3'],
 policy:{noAutomaticScores:true,noExactTextCriterion:true,noUnverifiedPremiseAcceptance:true,
  noEvidence:true,noPATITAWrite:true,noNewContracts:true,noExplorerChanges:true}});
module.exports=result;
if(require.main===module){if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(result,null,2)+'\n');else console.log('H14.29 risk audit '+JSON.stringify(result.counts));}
