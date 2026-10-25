'use strict';
// Read-only verification of H14.40 reconciliation. NOT Worker/DB integration.
const fs=require('node:fs'),crypto=require('node:crypto');
const spec=require('../data/learning/references/jaguar-h14-40-durable-idempotency-reconciliation-v0.1.json');
const skill=require('../data/learning/skills/why.json');
const h146=require('../data/learning/references/jaguar-h14-6-why-origin-scoped-contract-draft-v0.1.json');
function blobSha(p){const v=fs.readFileSync(p);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+v.length+'\0'),v])).digest('hex');}
function audit(){
 const problems=[];
 for(const [path,sha] of [[spec.reuse.migration,spec.reuse.migrationBlobSha],
  [spec.reuse.storageContract,spec.reuse.storageContractBlobSha],
  [spec.reuse.currentShadow,spec.reuse.shadowBlobSha]]){
  try{if(blobSha(path)!==sha)problems.push('SOURCE_DRIFT:'+path);}
  catch{problems.push('MISSING_SOURCE:'+path);}
 }
 const sql=fs.readFileSync(spec.reuse.migration,'utf8');
 const contract=fs.readFileSync(spec.reuse.storageContract,'utf8');
 if(!sql.includes('PRIMARY KEY (learner_subject, event_id)'))problems.push('PK_NOT_SUBJECT_SCOPED');
 for(const text of ['current_experience_id','origin_experience_id','source_occurrence_id','payload_sha256','contract_version','pending','observed_exploratory']){
  if(!sql.includes(text))problems.push('MISSING_SQL_FIELD_OR_STATE:'+text);
 }
 if(/CREATE\s+TABLE\s+[^;]*\bdimension\b/i.test(sql)||/CREATE\s+TABLE\s+[^;]*\bintent\b/i.test(sql))
  problems.push('VERSIONED_DIMENSION_OR_INTENT_ASSUMPTION_OUTDATED');
 if(!contract.includes('ON CONFLICT(learner_subject,event_id) DO NOTHING'))problems.push('NON_ATOMIC_DUPLICATE_POLICY');
 if(!contract.includes('identity.principal.subject'))problems.push('MISSING_IDENTITY_BOUNDARY');
 if(!contract.includes("return fail('occurrence_conflict')"))problems.push('MISSING_CONFLICT_REJECTION');
 if(!/purpose==='exploration'\?'observed_exploratory':'pending'/.test(contract))problems.push('STATUS_POLICY_NOT_FOUND');
 if(skill.id!=='why.use.contextual-reason')problems.push('WHY_SKILL_DRIFT');
 const drafts=h146.contractRegistry.filter(c=>c.status==='DRAFT_NOT_AUTHORIZED');
 if(drafts.length!==2||drafts.some(x=>x.authority!==false||x.canMintEvidence!==false))
  problems.push('UNAUTHORIZED_WHY_DRAFT');
 if(spec.reconciliationGaps.length!==7||spec.reconciliationGaps.some(g=>g.status!=='OPEN'))
  problems.push('MISSING_FUTURE_GATES');
 if(Object.values(spec.authority).some(v=>v!==false))problems.push('PROPOSAL_AUTHORITY_DRIFT');
 return Object.freeze({id:spec.id,status:problems.length?'STOP_RECONCILIATION_DRIFT':'REUSE_85C_CONTRACT_READY_FOR_STUDY_ONLY',
  source85c:spec.reuse.migration,sourceShaVerified:problems.length===0,
  existingSchemaReused:true,newMigrationCreated:false,
  dbPrimaryKey:spec.keyReconciliation.canonical85CPrimaryKey,
  clientNickCannotOwnRecords:true,
  sameUUIDAcrossDistinctSubjectsAllowed:true,
  contradictoryH1439GlobalRuleAcknowledged:true,
  gapsOpen:spec.reconciliationGaps.length,problems:Object.freeze(problems),
  existingS3S4Unchanged:true,canCreateCanonicalEvidence:false,canDeploy:false});
}
module.exports=Object.freeze({audit});
if(require.main===module){const r=audit();if(process.argv.includes('--json'))console.log(JSON.stringify(r,null,2));else console.log(r.status,JSON.stringify(r.problems));if(r.problems.length)process.exitCode=1;}
