'use strict';
// H14.36 — Phase 1 auditable source verification, not human homologation.
// This module DOES NOT rewrite corpus, activate contracts, grade text, or change Explorer.
const crypto=require('node:crypto'),fs=require('node:fs');
const experiences=require('../data/learning/experience-seeds.json').items;
const study=require('../data/learning/references/jaguar-h14-5-why-s1-s2-context-transfer-v0.1.json');
const snapshot=require('./jaguar-h14-35-progressive-homologation.js').build();
const coherence=require('../js/verb-explorer-contextual-coherence.js');
const sources=['shopping-for-dinner','preparing-dinner'],langs=['en','es','pt'];
function inspect(input=experiences,review=study){
 const issues=[],packets=[];
 if(!snapshot||snapshot.status!=='PROGRESSIVE_TEACHER_REVIEW_PACKETS_ONLY')issues.push('UNSAFE_H14_35_INHERITANCE');
 for(const expId of sources){
  const ex=input.find(e=>e.id===expId),q=ex?.thinkingMind?.find(z=>z.questionWord==='why');
  const context=review.contexts?.find(c=>c.experienceId===expId);
  if(!ex||!q||!context){issues.push('MISSING_QW_CONTEXT:'+expId);continue;}
  const p=q.presentationGrounding;
  if(!p||p.kind!=='exploratory-causal-dialogue'||p.groundedIn!=='situation'||
   p.tense!=='present'||p.form!=='affirmative'||p.assessmentAuthority!==false||
   p.assessmentEvidence!==false||q.assessmentTarget||q.assessmentResumeTarget||
   context.status!=='EXPLORATORY_CONTEXT_AUTHORED'||context.authority!==false||
   context.acceptedReasonId!==p.referenceReasonId||context.distractorId===p.referenceReasonId){
   issues.push('INVALID_EXPLORATORY_SOURCE:'+expId);continue;
  }
  const authored=p.alternatives?.filter(a=>a.id===p.referenceReasonId)||[];
  const contrast=p.alternatives?.filter(a=>a.id===context.distractorId)||[];
  if(p.alternatives?.length!==2||authored.length!==1||contrast.length!==1){issues.push('INVALID_REASON_SET:'+expId);continue;}
  if(expId==='shopping-for-dinner'){
   if(p.referent?.vocabularyId!=='fresh-mild-cheese'||p.referent?.sourceQuestionWord!=='which'||p.referent?.referenceOnly!==true||
      !p.questionOverride){issues.push('MISSING_S1_REFERENT:'+expId);continue;}
  }else if(p.questionOverride){issues.push('S2_UNEXPECTED_QUESTION_OVERRIDE');continue;}
  for(const language of langs){
   const findings=[],plain=q.question?.[language],visible=p.questionOverride?.[language]||plain;
   const answer=authored[0]?.response?.[language],distractor=contrast[0]?.response?.[language],
         head=q.dependencyHeadProbe?.prompt?.[language];
   const local=review.trilingualReview?.[language];
   const result=coherence.resolve({question:q,language,tense:'present',form:'affirmative'});
   if(!plain||!visible||!answer||!distractor||!head)findings.push('MISSING_LOCALIZED_TEXT');
   if(!local||(expId===sources[0]?(local.originQuestion!==visible||local.originReason!==answer):
       (local.transferQuestion!==visible||local.transferReason!==answer)))findings.push('H14_5_TRANSLINGUAL_SOURCE_MISMATCH');
   if(!result||result.status!=='grounded'||result.question!==visible||result.response!==answer||
     result.exploratory!==true||result.assessmentEvidence!==false||result.greenPass!==false)
     findings.push('COHERENCE_RESOLVER_MISMATCH');
   if(!head.includes('WHY')&&!head.includes('POR QUÉ')&&!head.includes('POR QUE'))findings.push('DEPENDENCY_HEAD_PROMPT_UNVERIFIED');
   if(expId===sources[0]&&plain===visible)findings.push('S1_UNRESOLVED_GENERIC_REFERENT');
   const pRaw={origin:expId,language,question:visible,genericQuestion:plain,
     referenceReasonId:authored[0].id,teacherOnlyReference:answer,
     contrastReasonId:contrast[0].id,teacherOnlyContrast:distractor,
     semanticRole:context.semanticQuestionRole,
     headProbeReference:head,headProbeIsFunctionEvidence:false,
     noWhichPrerequisite:true,noHowPrerequisite:true,noRoutePrerequisite:true,
     sourceIntegrityChecksPassed:findings.length===0,sourceIssues:findings,
     teacherQuestionApproval:null,teacherReferentApproval:null,teacherCausalFunctionApproval:null,
     reviewStatus:'NOT_HUMAN_HOMOLOGATED',assessmentAuthority:false,evidence:false,greenPass:false};
   packets.push(Object.freeze(pRaw));
   if(findings.length)issues.push('SOURCE_REVIEW_REQUIRED:'+expId+':'+language+':'+findings.join(','));
  }
 }
 const accepted=packets.filter(p=>p.sourceIntegrityChecksPassed).length;
 return Object.freeze({id:'JAGUAR-H14.36',status:issues.length?'STOP_SOURCE_RECONCILIATION':'PHASE1_SOURCES_VERIFIED_HUMAN_REVIEW_PENDING',
  phase:'PH1',gates:['HG-01','HG-02','HG-03'],sourceIntegrityMatches:accepted,
  teacherHomologations:0,packets:Object.freeze(packets),issues:Object.freeze(issues),
  noNewTasksOrContracts:true,contractualEvidence:false,patitaWrites:false,mainUnchanged:true});
}
module.exports=Object.freeze({inspect});
if(require.main===module){
 const report=inspect();if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else console.log('H14.36 source integrity '+report.sourceIntegrityMatches+'/6, human homologation 0, '+report.status);
 if(report.issues.length)process.exitCode=1;
}
