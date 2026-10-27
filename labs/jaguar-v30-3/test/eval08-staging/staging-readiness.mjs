// SIYAYO EVAL-08 — staging wiring/readiness boundary, NOT a deploy adapter.
// Refuses remote activation while V30.3.89A/89D independent proofs remain open.
// No credentials, no remote calls, no D1 mutation, and no public evaluation route.
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const staging=require('../../governance/cloudflare-staging-architecture-89d.json');
const live=require('../../security/cloudflare-live-proof.json');
const oldRelease=require('../../../../data/learning/references/siyayo-why-production-release-candidate-v0.1.json');
const gate=(reason,extra={})=>Object.freeze({
 ok:false,status:'STAGING_NOT_AUTHORIZED',reason,
 canDeploy:false,canMigrateD1:false,canActivateAssessment:false,
 canExposeWorker:false,canGrantGreenPass:false,...extra
});
const names=Array.from({length:12},(_,n)=>'EXT-'+String(n+1).padStart(2,'0'));
const truth=(v)=>v===true;
const exact=(v,keys)=>v&&typeof v==='object'&&!Array.isArray(v)&&
 Object.keys(v).sort().join('|')===keys.slice().sort().join('|');
const clean=(s)=>typeof s==='string'&&/^[a-z0-9_-]{3,64}$/.test(s);
/** Read-only inventory. This object MUST NOT serve as user-controlled authorization. */
export function inspectStagingReadiness(){
 const issues=[];
 const add=(v,msg)=>{if(!v)issues.push(msg);};
 add(staging.schema==='siyayo.staging.design.v1'&&staging.status==='DESIGN_ONLY','staging_design_drift');
 add(staging.proposed?.worker?.name==='siyayo-academy-staging-api'&&
     staging.proposed.worker.state==='NOT_CREATED'&&
     staging.proposed.d1?.name==='siyayo-academy-staging'&&
     staging.proposed.d1.databaseId===null&&
     staging.proposed.d1.state==='NOT_CREATED','staging_isolation_drift');
 add(staging.proposed.publicPages.unchanged===true&&
     staging.proposed.publicPages.stagingD1Binding===false&&
     staging.proposed.originalVisualWorker.unchanged===true,'protected_project_drift');
 add(live.id==='SIYAYO-CLOUDFLARE-LIVE-PROOF-89A'&&
     live.status==='BLOCKED_ACCOUNT_NOT_CONNECTED'&&
     live.cloudflareAccountIdentity==='UNRESOLVED','no_account_evidence_drift');
 add(live.remoteCloudflareAccountVerified===false&&
     live.accessApplicationVerified===false&&
     live.stagingHostnameVerified===false&&
     live.dedicatedStagingD1Verified===false&&
     live.remoteDeploymentAuthorized===false&&
     live.remoteMutationAuthorized===false&&
     live.cloudflareAccountCredentialsStored===false,'unexpected_remote_permission');
 add(Array.isArray(live.liveProofs)&&live.liveProofs.length===12&&
     names.every(id=>live.liveProofs.filter(r=>r.id===id&&r.state==='blocked').length===1),'external_controls_drift');
 add(Array.isArray(staging.gates)&&staging.gates.length===12&&
     names.every(id=>staging.gates.filter(r=>r.id===id&&r.state==='blocked').length===1),'staging_gates_drift');
 add(oldRelease.allow_cloudflare_deploy===false&&
     oldRelease.allow_main_merge===false&&
     oldRelease.production_ready===false&&
     oldRelease.evidence_authorized===false,'release_authority_drift');
 return Object.freeze({...gate(issues.length?'inventory_drift':'external_authorization_pending'),issues:Object.freeze(issues),
  externalGatesOpen:12,technicalGatesOpen:7,pedagogicalGatesOpen:15,
  intendedWorker:staging.proposed.worker.name,
  intendedDatabase:staging.proposed.d1.name,
  liveVerified:false,
  safeToPrepareNonDeployFiles:issues.length===0});
}
/**
 * Fail-closed staging binding inspector.
 * Metadata can only REJECT a configuration; even a perfect shape cannot
 * assert Access/JWKS/revocation or grant D1 mutation without live proofs.
 */
export function inspectProposedBindings(config){
 if(!exact(config,['workerName','d1Binding','d1DatabaseName','d1DatabaseId',
   'workersDev','publicPreviewAllowed','d1Migrated','accessPolicyProof','accountProof']))
   return gate('invalid_config_shape');
 if(!clean(config.workerName)||config.workerName!==staging.proposed.worker.name||
   config.d1Binding!=='ASSESSMENT_DB'||config.d1DatabaseName!==staging.proposed.d1.name||
   config.d1DatabaseId!==null||config.workersDev!==false||
   config.publicPreviewAllowed!==false||config.d1Migrated!==false||
   config.accessPolicyProof!==null||config.accountProof!==null)
   return gate('unverified_staging_binding_or_public_bypass');
 return Object.freeze({...gate('credentials_access_and_d1_not_verified'),
   intendedWorker:config.workerName,intendedDatabase:config.d1DatabaseName,
   bindingName:config.d1Binding,localContractOnly:true});
}
const headers=Object.freeze({
 'Content-Type':'application/json; charset=utf-8',
 'Cache-Control':'no-store, max-age=0',
 'Pragma':'no-cache',
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer'
});
/** Network-safe default. All HTTP routes remain unavailable without real auth. */
export function createDisabledStagingHandler(){
 return Object.freeze({async fetch(){
   return new Response(JSON.stringify({ok:false,reason:'staging_not_activated'}),{
     status:404,headers});
 }});
}
