'use strict';
// H14.28 — authored case bank for human review. NO automatic grading.
const read=p=>JSON.parse(require('fs').readFileSync(p,'utf8'));
const rubric=read('data/learning/references/jaguar-h14-27-why-question-function-semantic-rubric-v0.1.json');
const examples={
'shopping-for-dinner':{
en:[
['GROUNDED_PARAPHRASE','Its gentle flavor works with the salmon.','HIGH_CONTEXTUAL_FIT','CLEAR'],
['MINOR_LANGUAGE_ERROR','Because mild cheese go well with salmon.','HIGH_CONTEXTUAL_FIT','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS'],
['PARTIAL_REASON','Because it tastes good.','PARTIAL_CONTEXTUAL_FIT','CLEAR'],
['OFF_CONTEXT','Because we are already home preparing dinner.','CONTEXT_CONTRADICTION','CLEAR'],
['MANNER_INSTEAD_OF_REASON','I cut the cheese into small pieces.','WRONG_INFORMATION_TYPE','CLEAR'],
['PLAUSIBLE_UNVERIFIED','Because the cheese is cheaper than the other one.','NEEDS_CONTEXT_EVIDENCE','CLEAR'],
['FUNCTION_PARAPHRASE','The person wants a reason for preferring that cheese.','FUNCTION_NOT_REASON_ANSWER','CLEAR'],
['MODEL_ECHO','Because the fresh, mild cheese pairs well with the salmon.','REFERENCE_ECHO_INDEPENDENCE_UNKNOWN','CLEAR']],
es:[
['GROUNDED_PARAPHRASE','Porque su sabor suave acompaña bien al salmón.','HIGH_CONTEXTUAL_FIT','CLEAR'],
['MINOR_LANGUAGE_ERROR','Porque el queso suave combina bien con el salmon.','HIGH_CONTEXTUAL_FIT','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS'],
['PARTIAL_REASON','Porque es rico.','PARTIAL_CONTEXTUAL_FIT','CLEAR'],
['OFF_CONTEXT','Porque ya estamos en casa preparando la cena.','CONTEXT_CONTRADICTION','CLEAR'],
['MANNER_INSTEAD_OF_REASON','Corto el queso en trozos pequeños.','WRONG_INFORMATION_TYPE','CLEAR'],
['PLAUSIBLE_UNVERIFIED','Porque cuesta menos que el otro queso.','NEEDS_CONTEXT_EVIDENCE','CLEAR'],
['FUNCTION_PARAPHRASE','Quiere saber el motivo de la preferencia por ese queso.','FUNCTION_NOT_REASON_ANSWER','CLEAR'],
['MODEL_ECHO','Porque el queso fresco y suave combina bien con el salmón.','REFERENCE_ECHO_INDEPENDENCE_UNKNOWN','CLEAR']],
pt:[
['GROUNDED_PARAPHRASE','Porque o sabor suave acompanha bem o salmão.','HIGH_CONTEXTUAL_FIT','CLEAR'],
['MINOR_LANGUAGE_ERROR','Porque o queijo suave combina bem com o salmao.','HIGH_CONTEXTUAL_FIT','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS'],
['PARTIAL_REASON','Porque é gostoso.','PARTIAL_CONTEXTUAL_FIT','CLEAR'],
['OFF_CONTEXT','Porque já estamos em casa preparando o jantar.','CONTEXT_CONTRADICTION','CLEAR'],
['MANNER_INSTEAD_OF_REASON','Eu corto o queijo em pedaços pequenos.','WRONG_INFORMATION_TYPE','CLEAR'],
['PLAUSIBLE_UNVERIFIED','Porque o queijo está mais barato que o outro.','NEEDS_CONTEXT_EVIDENCE','CLEAR'],
['FUNCTION_PARAPHRASE','Quer saber o motivo da preferência por esse queijo.','FUNCTION_NOT_REASON_ANSWER','CLEAR'],
['MODEL_ECHO','Porque o queijo fresco e suave combina bem com o salmão.','REFERENCE_ECHO_INDEPENDENCE_UNKNOWN','CLEAR']]
},
'preparing-dinner':{
en:[
['GROUNDED_PARAPHRASE','Cooking as a group gives us time to share the experience.','HIGH_CONTEXTUAL_FIT','CLEAR'],
['MINOR_LANGUAGE_ERROR','Because cooking together make us share this moment.','HIGH_CONTEXTUAL_FIT','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS'],
['PARTIAL_REASON','Because it is nice.','PARTIAL_CONTEXTUAL_FIT','CLEAR'],
['OFF_CONTEXT','Because we are still choosing groceries at the market.','CONTEXT_CONTRADICTION','CLEAR'],
['MANNER_INSTEAD_OF_REASON','First we chop the vegetables and heat the pan.','WRONG_INFORMATION_TYPE','CLEAR'],
['PLAUSIBLE_UNVERIFIED','Because the stove is broken and we need help.','NEEDS_CONTEXT_EVIDENCE','CLEAR'],
['FUNCTION_PARAPHRASE','They are asking for the reason people prepare the dinner together.','FUNCTION_NOT_REASON_ANSWER','CLEAR'],
['MODEL_ECHO','Because preparing it together lets us share the experience.','REFERENCE_ECHO_INDEPENDENCE_UNKNOWN','CLEAR']],
es:[
['GROUNDED_PARAPHRASE','Porque cocinar en compañía nos permite compartir el momento.','HIGH_CONTEXTUAL_FIT','CLEAR'],
['MINOR_LANGUAGE_ERROR','Porque cocinar juntos nos permite compartír el momento.','HIGH_CONTEXTUAL_FIT','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS'],
['PARTIAL_REASON','Porque es bonito.','PARTIAL_CONTEXTUAL_FIT','CLEAR'],
['OFF_CONTEXT','Porque todavía estamos eligiendo alimentos en el supermercado.','CONTEXT_CONTRADICTION','CLEAR'],
['MANNER_INSTEAD_OF_REASON','Primero cortamos las verduras y calentamos la sartén.','WRONG_INFORMATION_TYPE','CLEAR'],
['PLAUSIBLE_UNVERIFIED','Porque el horno está roto y necesitamos ayuda.','NEEDS_CONTEXT_EVIDENCE','CLEAR'],
['FUNCTION_PARAPHRASE','Preguntan el motivo de preparar la cena entre todos.','FUNCTION_NOT_REASON_ANSWER','CLEAR'],
['MODEL_ECHO','Porque prepararla juntos nos permite compartir la experiencia.','REFERENCE_ECHO_INDEPENDENCE_UNKNOWN','CLEAR']],
pt:[
['GROUNDED_PARAPHRASE','Porque cozinhar em companhia permite compartilhar esse momento.','HIGH_CONTEXTUAL_FIT','CLEAR'],
['MINOR_LANGUAGE_ERROR','Porque cozinhar juntos permite compartilha esse momento.','HIGH_CONTEXTUAL_FIT','UNDERSTANDABLE_WITH_LANGUAGE_ERRORS'],
['PARTIAL_REASON','Porque é legal.','PARTIAL_CONTEXTUAL_FIT','CLEAR'],
['OFF_CONTEXT','Porque ainda estamos escolhendo ingredientes no supermercado.','CONTEXT_CONTRADICTION','CLEAR'],
['MANNER_INSTEAD_OF_REASON','Primeiro cortamos os legumes e aquecemos a panela.','WRONG_INFORMATION_TYPE','CLEAR'],
['PLAUSIBLE_UNVERIFIED','Porque o forno quebrou e precisamos de ajuda.','NEEDS_CONTEXT_EVIDENCE','CLEAR'],
['FUNCTION_PARAPHRASE','Querem saber o motivo de preparar o jantar em conjunto.','FUNCTION_NOT_REASON_ANSWER','CLEAR'],
['MODEL_ECHO','Porque prepará-lo juntos nos permite compartilhar essa experiência.','REFERENCE_ECHO_INDEPENDENCE_UNKNOWN','CLEAR']]
}};
const cases=[];
for(const [experienceId,localized] of Object.entries(examples))for(const [language,items] of Object.entries(localized)){
 const task=rubric.tasks.find(x=>x.experienceId===experienceId),teacher=task.localized[language].teacherOnly;
 for(const [kind,response,semanticTag,expressionQuality] of items){
  cases.push({id:'H14.28-'+experienceId+'-'+language+'-'+kind,experienceId,language,questionWord:'why',
   dimension:kind==='FUNCTION_PARAPHRASE'?'question-function':'reason-answer(local)',
   caseKind:kind,response,teacherMeaningAnchor:teacher.meaningAnchor,
   semanticTag,expressionQuality,sourceProvenance:'NEW_EXPLICITLY_SYNTHESIZED_LAB_EXAMPLE',
   reviewRequired:true,notAutomaticallyAccepted:true,proposedBand:null,canonicalProgress:null,
   teacherReferenceOnly:true,authority:{assessment:false,evidence:false,greenPass:false,patitaCredit:false}});
 }
}
const bank={id:'JAGUAR-H14.28',version:'0.1.0',status:'HUMAN_SEMANTIC_REVIEW_NOT_AUTO_GRADED',
 sourceRubric:'H14.27',sourceRubricBlob:'fd0836b271ad957e1a4e4b9f30eeb65e333c25ab',
 scenarioCount:2,languageSet:['en','es','pt'],totalCases:cases.length,
 distinctions:['SEMANTIC_CONTEXT','LANGUAGE_EXPRESSION','INDEPENDENCE_OF_LEARNER_ACTION','CANONICAL_CONTRACT'],
 policy:{noExactStringMatching:true,ambiguousNeedsHumanReview:true,
  referenceEchoNotEvidence:true,unverifiedPremiseNotAutoAccepted:true,
  grammarMistakeNotAutomaticContextFailure:true,syntacticHeadProbeNotFunctionProof:true,
  noNewAssessmentAuthority:true,noNewEvidence:true,noGreenPass:true,onlyPresentAffirmativeGrounding:true},
 cases};
module.exports=bank;
if(require.main===module){if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(bank,null,2)+'\n');else console.log('H14.28 '+bank.totalCases+' teacher-review semantic contrast examples; no grading');}
