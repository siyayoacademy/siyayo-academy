'use strict';
// Research-only supervised feedback protocol. This maps AUTHORS' tagged lab cases,
// NEVER evaluates free-form learner text. Unknown labels fail closed.
const audit=require('./jaguar-h14-29-semantic-risk-audit.js');
const STATES=Object.freeze(['COHERENT','PARTIAL','NEEDS_REVIEW','INCOHERENT']);
const guidance=Object.freeze({
 GROUNDED_PARAPHRASE:{state:'COHERENT',en:'Your explanation connects the reason to this situation. Try another wording if you like.',es:'Tu explicación relaciona el motivo con esta situación. Puedes expresarlo de otra manera.',pt:'Sua explicação relaciona a razão a esta situação. Você pode dizer isso de outra forma.'},
 MINOR_LANGUAGE_ERROR:{state:'COHERENT',en:'The reason fits the scene. Now refine the language without losing your idea.',es:'La razón encaja con la situación. Ahora mejora la expresión sin perder tu idea.',pt:'A razão combina com a situação. Agora aperfeiçoe a expressão sem perder sua ideia.'},
 PARTIAL_REASON:{state:'PARTIAL',en:'You found a possible reason. What in this scene makes that reason relevant?',es:'Identificaste un posible motivo. ¿Qué elemento de la situación lo explica?',pt:'Você encontrou um motivo possível. O que nesta situação explica esse motivo?'},
 OFF_CONTEXT:{state:'INCOHERENT',en:'This answer describes a different scene. Which facts belong to the current question?',es:'Esta respuesta describe otra situación. ¿Qué hechos pertenecen a la pregunta actual?',pt:'Esta resposta descreve outra situação. Quais fatos pertencem à pergunta atual?'},
 MANNER_INSTEAD_OF_REASON:{state:'INCOHERENT',en:'You described how to do it. WHY asks for the reason it happens.',es:'Explicaste cómo hacerlo. POR QUÉ pide el motivo.',pt:'Você descreveu como fazer. POR QUE pede o motivo.'},
 PLAUSIBLE_UNVERIFIED:{state:'NEEDS_REVIEW',en:'That reason may be possible. Is its premise stated in this scene?',es:'Ese motivo podría ser posible. ¿Su premisa aparece en la situación?',pt:'Esse motivo pode ser possível. A situação realmente apresenta essa informação?'},
 FUNCTION_PARAPHRASE:{state:'COHERENT',en:'You identified what WHY seeks. That is question-function recognition, not yet a reason answer.',es:'Identificaste qué solicita POR QUÉ. Es reconocimiento de la función, no la respuesta causal.',pt:'Você identificou o que POR QUE solicita. Isso é reconhecimento da função, não a justificativa.'},
 MODEL_ECHO:{state:'NEEDS_REVIEW',en:'The response matches the reference, but an independent attempt still needs verification.',es:'La respuesta coincide con el modelo, pero falta comprobar la producción independiente.',pt:'A resposta coincide com o modelo, mas ainda é necessário verificar a produção independente.'}
});
const cases=audit.cases.map(c=>{
 const g=guidance[c.caseKind];if(!g)throw Error('Unknown tag '+c.caseKind);
 return Object.freeze({id:c.id,experienceId:c.experienceId,language:c.language,dimension:c.dimension,
  hypothesis:g.state,feedbackDraft:g[c.language],riskClass:c.riskClass,
  decisionAuthority:'HUMAN_REVIEW_REQUIRED',assessedLearner:false,
  semanticBand:null,expressionJudgment:null,canonicalProgress:null,
  assessment:false,evidence:false,greenPass:false});
});
const protocol=Object.freeze({id:'JAGUAR-H14.30',status:'TEACHER_REVIEW_PROTOCOL_NOT_AUTOMATIC_GRADER',
 states:STATES,cases:Object.freeze(cases),
 requirements:Object.freeze({rubric:'H14.27',riskAudit:'H14.29',noLiteralMatching:true,
  dimensionAware:true,languageSeparate:true,independentLearnerActionRequired:true,
  doNotInferContextualFacts:true,teacherMayOverrideAllHypotheses:true,
  contextualZeroToFourSeparate:true,contractZeroToThreeSeparate:true,
  learnerEvidence:false,attempts:false,patitaWrites:false,greenPass:false}),
 exceptions:Object.freeze({unknownCase:'NO_CLASSIFICATION',unverifiedPremise:'NEEDS_REVIEW',
  unobservedModelEcho:'NEEDS_REVIEW',ambiguousMeaning:'NEEDS_REVIEW'}),
 counts:Object.freeze({cases:cases.length,feedbackDrafts:cases.length,
  states:Object.fromEntries(STATES.map(s=>[s,cases.filter(c=>c.hypothesis===s).length]))})});
module.exports=protocol;
if(require.main===module)console.log(process.argv.includes('--json')?JSON.stringify(protocol,null,2):JSON.stringify(protocol.counts));
