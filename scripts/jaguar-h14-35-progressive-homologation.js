'use strict';
// H14.35: generate teacher-facing, EMPTY progressive homologation packets.
// Never homologue from CI checks, synthetic examples, or source provenance.
const readiness=require('./jaguar-h14-34-readiness-matrix.js');
const experience=require('../data/learning/experience-seeds.json');
const originDraft=require('../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
const LANGS=['en','es','pt'],IDS=['shopping-for-dinner','preparing-dinner'];
const PHASES=Object.freeze([
{id:'PH1',gates:['HG-01','HG-02','HG-03'],name:'Pergunta, referente e função causal',authority:'PEDAGOGICAL_AUTHORING'},
{id:'PH2',gates:['HG-06','HG-07','HG-08'],name:'Equivalência trilíngue e paráfrases',authority:'LANGUAGE_AND_CONTEXT_REVIEW'},
{id:'PH3',gates:['HG-04','HG-05','HG-09','HG-10'],name:'Produção independente, transferência e mediação',authority:'TEACHER_HOMOLOGATION'},
{id:'PH4',gates:['HG-11','HG-12','HG-13','HG-14','HG-15'],name:'Segurança contratual e integração seletiva',authority:'EVAL_08_GEAR_06_EXPLORER'}
]);
function build(){
 const matrix=readiness.project();if(!matrix||matrix.status!=='REFERENCE_MATRIX_READY_FOR_STUDY_ONLY')return null;
 const gates=new Map(matrix.rows.flatMap(x=>x.gates).map(g=>[g.id,g]));
 const issues=[],packets=[];
 for(const id of IDS){
  const scene=experience.items.find(x=>x.id===id),q=scene?.thinkingMind.find(x=>x.questionWord==='why');
  if(!q||q.assessmentTarget||q.assessmentResumeTarget||q.presentationGrounding?.assessmentAuthority!==false){issues.push('UNSAFE_QW_'+id);continue;}
  const approvedReason=q.presentationGrounding.alternatives.find(a=>a.id===q.presentationGrounding.referenceReasonId);
  const contrast=q.presentationGrounding.alternatives.find(a=>a.id!==q.presentationGrounding.referenceReasonId);
  for(const lang of LANGS){
   const question=q.presentationGrounding.questionOverride?.[lang]||q.question?.[lang];
   if(!question||!approvedReason?.response?.[lang]||!contrast?.response?.[lang]){issues.push('MISSING_LOCALIZED_SOURCE_'+id+'_'+lang);continue;}
   packets.push(Object.freeze({id:'H14.35-'+id+'-'+lang,experienceId:id,language:lang,questionWord:'why',
    question,contextReference:Object.freeze({reasonId:approvedReason.id,teacherOnlyAnswer:approvedReason.response[lang],contrastId:contrast.id,teacherOnlyContrast:contrast.response[lang]}),
    reviewerDecision:null,referentReview:null,questionFunctionReview:null,trilingualMeaningReview:null,
    alternateReasonReview:null,independentTaskApproval:null,secondReviewer:null,mediator:null,
    evidence:null,assessmentAuthority:false,canAwardGreenPass:false,teacherReviewStatus:'NOT_STARTED'}));
  }
 }
 const plans=PHASES.map(p=>Object.freeze({...p,gates:p.gates.map(id=>gates.get(id)||null),status:'PENDING_HUMAN_AND_CONTRACT_GATES',
  canAutoAdvance:false}));
 if(plans.some(p=>p.gates.some(g=>!g)))issues.push('UNMAPPED_GATE');
 const seen=plans.flatMap(p=>p.gates.map(g=>g.id));
 if(seen.length!==15||new Set(seen).size!==15)issues.push('DUPLICATE_OR_MISSING_GATE');
 const contracts=originDraft.contractRegistry.filter(x=>x.status==='DRAFT_NOT_AUTHORIZED');
 if(contracts.length!==2||contracts.some(x=>x.authority!==false||x.canMintEvidence!==false))issues.push('DRAFT_AUTHORITY_DRIFT');
 return Object.freeze({id:'JAGUAR-H14.35',status:issues.length?'BLOCKED_SOURCE_INTEGRITY':'PROGRESSIVE_TEACHER_REVIEW_PACKETS_ONLY',
   sourceBranch:'jaguar/h14-34-contextual-readiness-matrix',phases:Object.freeze(plans),packets:Object.freeze(packets),issues:Object.freeze(issues),
   integrationProtection:Object.freeze({mainComparison:'1764_AHEAD_1_BEHIND_AT_AUDIT_TIME_NOT_PERMANENT',
    integrationMethod:'SELECTIVE_APPLY_NOT_WHOLE_BRANCH_MERGE',mainUnchanged:true,
    requiredBeforeMerge:['RECHECK_MAIN_HEAD_AND_DIFF','VERIFY_CONTENT_HASHES_AND_MODULE_DEPENDENCIES','PRESERVE_MAIN_UNIQUE_COMMIT','RUN_EVAL_PATITA_TRAIL_S3_S4_AND_TRILINGUAL_REGRESSIONS','OBTAIN_EXPLICIT_DEPLOYMENT_HOMOLOGATION'],
    func13Hidden:true,productionUnchanged:true}),
   humanReviewsCollected:0,newAssessmentAuthority:false,evidence:false});
}
module.exports=Object.freeze({build,PHASES});
if(require.main===module){const x=build();if(!x||x.issues.length){console.error(x?.issues||'invalid');process.exitCode=1;}else if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(x,null,2)+'\n');else console.log('H14.35 '+x.packets.length+' empty EN ES PT review packets; '+x.phases.length+' phases; 15 unapproved gates');}
