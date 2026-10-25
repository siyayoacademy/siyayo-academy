'use strict';
// H14.33 — reference readiness only. It NEVER authorizes assessment or grades learner text.
const fs=require('node:fs'),crypto=require('node:crypto');
const rubric=require('../data/learning/references/jaguar-h14-33-why-semantic-homologation-reference-v0.1.json');
const comparator=require('./jaguar-h14-31-two-reviewer-consistency.js');
const {mediate}=require('./jaguar-h14-32-pedagogical-mediation.js');
const sources=Object.freeze(rubric.sources.map(s=>Object.freeze({...s})));
function blobSha(path){
 const b=fs.readFileSync(path);
 return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
}
function inspectSources(){
 const files=sources.map(s=>{
  let actual=null;
  try{actual=blobSha(s.path);}catch{}
  return Object.freeze({id:s.id,path:s.path,expectedBlobSha:s.blobSha,
   matches:actual===s.blobSha,sourceAvailable:actual!==null});
 });
 return Object.freeze({status:files.every(x=>x.matches)?'ALL_REFERENCES_PINNED':'SOURCE_DRIFT_BLOCKS_REVIEW',
  files:Object.freeze(files),pedagogicalHomologation:false,assessmentAuthority:false,evidence:false});
}
function summary(){
 const provenance=inspectSources();
 const cases=comparator.referenceCaseIds.length;
 return Object.freeze({id:rubric.id,status:rubric.status,
  numberOfGates:rubric.homologationGates.length,
  openGates:rubric.homologationGates.filter(g=>g.status!=='HOMOLOGATED').length,
  numberOfDemonstrationCases:cases,
  actualTeacherReviews:rubric.reviewEvidence.realTeacherReviewsCollected,
  provenance:provenance.status,
  pedagogicalHomologation:false,assessmentAuthority:false,evidence:false,greenPass:false});
}
function inspectStudyPacket({caseId,reviews=[],mediator=null,simulation=false}={}){
 const comparison=comparator.inspect(caseId,reviews);
 const common={caseId,sourceComparisonStatus:comparison.status,
  simulated:simulation===true,canHomologate:false,
  assessmentAuthority:false,canonicalEvidence:false,greenPass:false,canonicalProgress:null};
 if(comparison.status==='UNKNOWN_REFERENCE'||comparison.status==='INVALID_REVIEW_SET')
  return Object.freeze({...common,status:'BLOCKED_UNVERIFIED_STUDY_PACKET',mediationStatus:null});
 if(comparison.reviewers!==2)
  return Object.freeze({...common,status:'AWAITING_TWO_INDEPENDENT_REVIEWS',mediationStatus:null});
 if(comparison.status==='CONSISTENT_REVIEWS_PENDING_HOMOLOGATION'&&!mediator)
  return Object.freeze({...common,status:'CONSISTENT_STUDY_ONLY_HUMAN_HOMOLOGATION_PENDING',mediationStatus:null});
 if(comparison.status==='CONSISTENT_REVIEWS_PENDING_HOMOLOGATION'&&mediator)
  return Object.freeze({...common,status:'UNNECESSARY_MEDIATION_REQUIRES_REVIEW',mediationStatus:null});
 if(!mediator)return Object.freeze({...common,status:'REQUIRES_PEDAGOGICAL_MEDIATION',mediationStatus:null});
 const m=mediate({caseId,reviews,mediator});
 return Object.freeze({...common,status:m.status==='MEDIATION_PROPOSAL_RECORDED'?
  'MEDIATION_PROPOSAL_ONLY_HOMOLOGATION_PENDING':'MEDIATION_STILL_BLOCKED',
  mediationStatus:m.status,proposedState:m.decision?.proposedState??null,
  teacherJudgmentMustStillBeVerified:true});
}
module.exports=Object.freeze({contract:rubric,inspectSources,summary,inspectStudyPacket});
if(require.main===module){
 const report=summary();
 if(process.argv.includes('--json'))process.stdout.write(JSON.stringify(report,null,2)+'\n');
 else console.log('H14.33 read-only homologation readiness '+JSON.stringify(report));
 if(report.provenance!=='ALL_REFERENCES_PINNED')process.exitCode=1;
}
