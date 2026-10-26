'use strict';
// SIYAYO WHY production safety gate. Default and intentional conclusion: NO-GO.
// This checker cannot deploy, merge, call Cloudflare, write D1, or mint Evidence.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const base=path.resolve(__dirname,'..');
const ref=(s)=>JSON.parse(fs.readFileSync(path.join(base,s),'utf8'));
const hg=Array.from({length:15},(_,i)=>'HG-'+String(i+1).padStart(2,'0'));
const dg=Array.from({length:7},(_,i)=>'DG-'+String(i+1).padStart(2,'0'));
function audit(candidate=ref('data/learning/references/siyayo-why-production-release-candidate-v0.1.json')){
 const problems=[],ask=(flag,msg)=>{if(!flag)problems.push(msg)};
 const source=ref('data/learning/references/jaguar-h14-67-final-why-experimental-handoff-v0.1.json');
 const plans=ref('data/learning/references/jaguar-h14-63-why-six-plan-contract-v0.1.json');
 const human=ref('data/learning/references/jaguar-h14-64-human-homologation-prep-v0.1.json');
 const draft=ref('data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
 const corpus=ref('data/learning/experience-seeds.json');
 ask(candidate?.id==='SIYAYO-WHY-PRODUCTION-RELEASE-CANDIDATE','INVALID_CANDIDATE_ID');
 ask(candidate?.source_head===source.parent_head,'SOURCE_HEAD_DRIFT');
 ask(candidate?.source_ci_result==='success'&&candidate?.source_ci_run_id===40410398591,'UNVERIFIED_CI_REFERENCE');
 ask(candidate?.release_mode==='CHECKS_ONLY__DO_NOT_DEPLOY','UNSAFE_RELEASE_MODE');
 ask(candidate?.release_candidate_authority==='NONE','AUTHORITY_CLAIMED');
 ask(candidate?.production_ready===false,'PRODUCTION_READY_CLAIMED');
 ask(candidate?.allow_cloudflare_deploy===false,'DEPLOY_UNBLOCKED');
 ask(candidate?.allow_main_merge===false,'MAIN_MERGE_UNBLOCKED');
 ask(candidate?.evidence_authorized===false,'EVIDENCE_UNBLOCKED');
 ask(candidate?.executable_changes?.length===0,'EXECUTABLE_CHANGES_PRESENT');
 ask(candidate?.comparison_snapshot?.diff_complete===false,'DIFF_COMPLETENESS_CLAIMED');
 ask(candidate?.intended_activities?.integrate_main===false &&
     candidate?.intended_activities?.integrate_pr3===false &&
     candidate?.intended_activities?.activate_why_s1_s2===false &&
     candidate?.intended_activities?.grant_evidence===false &&
     candidate?.intended_activities?.issue_green_pass===false &&
     candidate?.intended_activities?.write_d1_remote===false &&
     candidate?.intended_activities?.cloudflare_deploy===false,'SIDE_EFFECT_UNBLOCKED');
 for(const k of ['patita_observation_cannot_credit','nick_not_authentication',
  'assessment_evaluator_only','show_canonical_only','s3_s4_unchanged',
  'no_historical_hash_rewriting','func13_hidden','no_copy_of_mock_sql','no_wholesale_merge'])
  ask(candidate?.hard_rules?.[k]===true,'PROTECTION_DRIFT:'+k);
 for(const [name,ids] of [['pedagogy',hg],['technical',dg]]){
  const records=candidate?.blockers?.[name];
  ask(Array.isArray(records)&&records.length===ids.length,'GATE_COUNT_DRIFT:'+name);
  if(Array.isArray(records))
   for(const id of ids){const arr=records.filter(r=>r.id===id);
    ask(arr.length===1&&arr[0].status==='OPEN'&&
     arr[0][name==='pedagogy'?'verified_human_attestation':'verified_technical_attestation']===null,
     'GATE_UNEXPECTED_CLOSURE:'+id);
   }
 }
 ask(source.decisions.why_s1_to_s2_contract==='NO_GO_PEDAGOGICAL_AUTHORITY' &&
  source.decisions.why_s2_to_s1_contract==='NO_GO_PEDAGOGICAL_AUTHORITY','SOURCE_AUTHORITY_DRIFT');
 ask(source.decisions.deploy_cloudflare==='NO_GO' &&
  source.decisions.integrate_into_main_or_pr3==='NO_GO','SOURCE_RELEASE_DRIFT');
 ask(source.runtime_apply_allowlist.length===0,'SOURCE_ALLOWLIST_DRIFT');
 ask(plans.plans.length===6&&plans.plans.every(p=>p.contractAuthorized===false &&
  p.humanApproval===null),'SIX_PLAN_HOMOLOGATION_DRIFT');
 ask(human.openHgGates===15&&human.realTeacherReviews===0&&human.humanApproval===false,
   'HUMAN_HOMOLOGATION_DRIFT');
 ask(draft.contractRegistry.filter(c=>c.status==='DRAFT_NOT_AUTHORIZED').length===2,
   'DRAFT_CONTRACTS_CHANGED');
 for(const id of ['shopping-for-dinner','preparing-dinner']){
  const question=corpus.items.find(x=>x.id===id)?.thinkingMind?.find(q=>q.questionWord==='why');
  ask(Boolean(question?.presentationGrounding)&&!question?.assessmentTarget&&!question?.assessmentResumeTarget,
   'LIVE_S1_S2_TARGET_PROMOTED:'+id);
 }
 ask(corpus.items.find(x=>x.id==='having-dinner')?.thinkingMind?.find(q=>q.questionWord==='why')
  ?.assessmentTarget?.skill==='why.use.contextual-reason','CANONICAL_S3_CHANGED');
 const isText=x=>typeof x==='string'&&x.length>0;
 const protectedFiles=source.protected_files;
 ask(Array.isArray(protectedFiles)&&protectedFiles.length===25,'SOURCE_FILE_COUNT_DRIFT');
 if(Array.isArray(protectedFiles))
 for(const file of protectedFiles){
   if(!isText(file.path)||!/^[a-f0-9]{40}$/.test(file.git_blob_sha)){problems.push('INVALID_SOURCE_HASH');continue;}
   let bytes;
   try{bytes=fs.readFileSync(path.join(base,file.path));}
   catch{problems.push('MISSING_SOURCE:'+file.path);continue;}
   const sha=crypto.createHash('sha1').update(Buffer.from('blob '+bytes.length+'\0')).update(bytes).digest('hex');
   ask(sha===file.git_blob_sha,'SOURCE_BLOB_DRIFT:'+file.path);
 }
 return Object.freeze({status:problems.length?'STOP_UNSAFE_RELEASE_PACKAGE':'PRE_PRODUCTION_SAFETY_GATE_VERIFIED__LIVE_NO_GO',
    problems:Object.freeze(problems),readyForProduction:false,canDeploy:false,
    canMerge:false,canActivateAssessment:false,mayIssueEvidence:false,
    hgOpen:15,dgOpen:7,
    statement:'Static repository gate only. It does not confirm live Cloudflare status, trusted human approval or D1 staging.'});
}
module.exports={audit};
if(require.main===module){const v=audit();console.log(JSON.stringify(v,null,2));
 if(v.problems.length)process.exitCode=1;}
