'use strict';
// JAGUAR H14.34 — machine-readable readiness projection, not an assessment engine.
// All status decisions are bound to explicit H14.33 gates; no promotion is performed.
const fs=require('node:fs');
const reference=require('../data/learning/references/jaguar-h14-33-why-semantic-homologation-reference-v0.1.json');
const readiness=require('./jaguar-h14-33-homologation-reference-audit.js');
const draft=require('../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const skill=require('../data/learning/skills/why.json');
const families=Object.freeze([
 {id:'CONTEXT_REFERENTS',title:'Experience/QW contextual grounding',owner:'PEDAGOGICAL_AUTHORING',gates:['HG-01','HG-02'],material:'SOURCE_PRESENT_HUMAN_REVIEW_PENDING',integration:'READ_ONLY_REFERENCES'},
 {id:'WHY_QUESTION_FUNCTION',title:'Independent causal question recognition',owner:'PEDAGOGICAL_AUTHORING',gates:['HG-03'],material:'TASK_BLUEPRINT_PENDING_HUMAN_AUTHORING',integration:'NO_ASSESSMENT_TARGET'},
 {id:'WHY_LOCAL_REASON',title:'Independent free-response local reason',owner:'PEDAGOGICAL_AUTHORING',gates:['HG-04'],material:'PROMPT_SOURCE_EXISTS_AS_BLUEPRINT',integration:'NO_FREE_TEXT_EVALUATOR'},
 {id:'WHY_TRANSFER_REASON',title:'Origin-specific independent transfer',owner:'EVAL-08_CONTRACT_DESIGN',gates:['HG-05'],material:'S1_S2_DUAL_ORIGIN_DRAFT',integration:'NO_TRANSFER_CREDIT'},
 {id:'TRILINGUAL_EQUIVALENCE',title:'EN/ES/PT meaning, idiom and grammar',owner:'PEDAGOGICAL_AUTHORING',gates:['HG-06','HG-07'],material:'AUTHORED_EXAMPLES_NEED_HUMAN_REVIEW',integration:'NO_AUTO_TRANSLATION_EQUIVALENCE'},
 {id:'CONTEXT_VARIANTS',title:'Grounded paraphrases and uncertain reasons',owner:'SEMANTIC_STUDY',gates:['HG-08'],material:'48_SYNTHETIC_EXAMPLES_LAB_ONLY',integration:'NO_FREE_TEXT_ACCEPTANCE'},
 {id:'TWO_REVIEWER',title:'Independent teacher comparisons',owner:'PEDAGOGICAL_HOMOLOGATION',gates:['HG-09'],material:'48_EMPTY_FORMS_AND_SIMULATED_TESTS',integration:'NO_REAL_REVIEW_CONCLUSIONS'},
 {id:'MEDIATION',title:'Third-party reasoned mediation',owner:'PEDAGOGICAL_HOMOLOGATION',gates:['HG-10'],material:'SUPERVISED_PROTOCOL_NOT_REAL_PILOT',integration:'NO_FINAL_HOMOLOGATION'},
 {id:'PROGRESS_BOUNDARY',title:'Semantic 0/4 versus canonical 0/3',owner:'EVAL-08',gates:['HG-11'],material:'DESIGN_SEPARATION_VERIFIED',integration:'NO_NEW_CREDIT_AUTHORITY'},
 {id:'PRIVACY_OBSERVATION',title:'Learner attempt capture and PATITA separation',owner:'PATITA-12_AND_EVAL-08',gates:['HG-12'],material:'FUTURE_DATA_POLICY_REQUIRED',integration:'NO_LIVE_ATTEMPT_CAPTURE'},
 {id:'AUTHORIZED_CONTRACT',title:'Per-origin assessment contract',owner:'EVAL-08',gates:['HG-13'],material:'TWO_DRAFT_ORIGINS_NOT_AUTHORIZED',integration:'NO_CANONICAL_EVIDENCE'},
 {id:'EXPLORER_RUNTIME',title:'Explorer selector, context and navigation integration',owner:'EXPLORER_INTEGRATION',gates:['HG-14'],material:'NO_RUNTIME_INTEGRATION',integration:'NO_ACTIVATION'},
 {id:'GEAR_PERIOD',title:'Temporal PERIOD dimension',owner:'GEAR-06',gates:['HG-15'],material:'PERIOD_NOT_PRESENT_IN_GEAR',integration:'NO_SYNTHETIC_TENSE_PERIOD'}
]);
function project(){
 if(reference.id!=='JAGUAR-H14.33-WHY-SEMANTIC-HOMOLOGATION-REFERENCE'||!Array.isArray(reference.homologationGates))return null;
 const provenance=readiness.inspectSources();
 const gateMap=new Map(reference.homologationGates.map(g=>[g.id,g]));
 const reportIssues=[],seen=new Set(),rows=[];
 if(provenance.status!=='ALL_REFERENCES_PINNED')reportIssues.push('PROVENANCE_SOURCE_DRIFT');
 if(skill.id!==reference.scope.skill)reportIssues.push('SKILL_ID_MISMATCH');
 if(JSON.stringify(skill.passContract.requires.map(x=>x.dimension+(x.mode?'('+x.mode+')':'')))!==JSON.stringify(reference.scope.dimensions))reportIssues.push('PASS_DIMENSIONS_MISMATCH');
 for(const c of families){
  if(c.gates.some(id=>!gateMap.has(id))){reportIssues.push('MISSING_GATE_FOR_'+c.id);continue;}
  for(const id of c.gates)seen.add(id);
  const gates=c.gates.map(id=>Object.freeze({...gateMap.get(id)}));
  rows.push(Object.freeze({...c,gates:Object.freeze(gates),
   readyForLiveIntegration:false,
   readyForNewAssessment:false,
   requiresHumanHomologation:gates.some(g=>/REVIEW|AUTHORING|MEDIATION|VERIFIED/.test(g.status)),
   openGateIds:Object.freeze(gates.filter(g=>g.status!=='HOMOLOGATED').map(g=>g.id)),
   ownershipAuthority:'ADVISORY_ONLY',
   evidence:false,patitaCredit:false,greenPass:false}));
 }
 const unexpected=reference.homologationGates.filter(g=>!seen.has(g.id)).map(g=>g.id);
 if(unexpected.length)reportIssues.push('UNMAPPED_GATES:'+unexpected.join(','));
 const draftOrigins=draft.contractRegistry.filter(x=>x.status==='DRAFT_NOT_AUTHORIZED');
 if(draftOrigins.length!==2||draftOrigins.some(x=>x.authority!==false||x.canMintEvidence!==false))
  reportIssues.push('DRAFT_ORIGIN_AUTHORITY_DRIFT');
 if(reference.reviewEvidence.realTeacherReviewsCollected!==0||reference.reviewEvidence.realTeacherMediationsCollected!==0)
  reportIssues.push('REVIEW_COUNTS_REQUIRE_REAUDIT');
 if(Object.values(reference.authorization).some(v=>v!==false))reportIssues.push('REFERENCE_AUTHORIZATION_DRIFT');
 const open=reference.homologationGates.filter(g=>g.status!=='HOMOLOGATED');
 const status=reportIssues.length?'STOP_RECONCILE_SOURCE':'REFERENCE_MATRIX_READY_FOR_STUDY_ONLY';
 return Object.freeze({id:'JAGUAR-H14.34-READINESS-MATRIX',status,referenceId:reference.id,
  sourceProvenance:provenance.status,
  sourceElo:'H14.33',questionWord:'why',
  experiences:Object.freeze([...reference.scope.experiences]),languages:Object.freeze([...reference.scope.languages]),
  existingCanonicalS3S4:'PRESERVED_NOT_REEVALUATED',
  counts:Object.freeze({capabilities:rows.length,gates:reference.homologationGates.length,
   openGates:open.length,realTeacherReviews:reference.reviewEvidence.realTeacherReviewsCollected,
   authorizedNewContracts:0,evidenceFromThisMatrix:0}),
  rows:Object.freeze(rows),issues:Object.freeze(reportIssues),
  evidenceAuthority:false,canEvaluateFreeText:false,canPublishToMain:false,
  integrationReady:false,func13Hidden:true,patitaObservationalOnly:true});
}
module.exports=Object.freeze({project,families});
if(require.main===module){
 const output=project();if(!output){process.exitCode=1;console.error('INVALID H14.33 INPUT');}
 else {if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(output,null,2)+'\n');
 else console.log('H14.34 readiness '+JSON.stringify(output.counts)+' '+output.status);
 if(output.status!=='REFERENCE_MATRIX_READY_FOR_STUDY_ONLY')process.exitCode=1;}
}
