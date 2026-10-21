// JAGUAR V30.3.89A — pre-staging READ-ONLY account discovery & proof manifest.
// No dashboard login, network requests, Access tokens, D1 or remote deployment.
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const file=resolve(dirname(fileURLToPath(import.meta.url)),'../security/cloudflare-live-proof.json');
const ids=Array.from({length:12},(_,i)=>'EXT-'+String(i+1).padStart(2,'0'));
const keys=['remoteCloudflareAccountVerified','accessApplicationVerified',
 'stagingHostnameVerified','dedicatedStagingD1Verified','remoteDeploymentAuthorized',
 'remoteMutationAuthorized','cloudflareAccountCredentialsStored'];
const no=v=>v===false;
export function inspectCloudflareProof89(value){
 const errors=[];
 if(!value||typeof value!=='object'||Array.isArray(value))return {ok:false,verdict:'INVALID',errors:['invalid_manifest']};
 if(value.id!=='SIYAYO-CLOUDFLARE-LIVE-PROOF-89A'||
    value.status!=='BLOCKED_ACCOUNT_NOT_CONNECTED'||
    value.environment!=='LAB_AND_READ_ONLY_ACCOUNT_DISCOVERY_ONLY'||
    value.officialExplorerCommit!=='c7e83709cacf8479847df0f3cee4ed8a563aaae6')
   errors.push('identity_or_environment_changed');
 for(const field of keys)if(!no(value[field]))errors.push('unverified_live_claim:'+field);
 if(value.cloudflareAccountIdentity!=='UNRESOLVED')errors.push('unverified_account_claim');
 if(!Array.isArray(value.liveProofs)||value.liveProofs.length!==12)
   errors.push('missing_external_proof');
 else {
   const seen=new Set();
   for(const item of value.liveProofs){
     if(!item||!ids.includes(item.id)||seen.has(item.id)||item.state!=='blocked'||
        typeof item.purpose!=='string'||item.purpose.length<20)
      errors.push('invalid_external_proof');
     if(item?.id)seen.add(item.id);
   }
   for(const id of ids)if(!seen.has(id))errors.push('missing_'+id);
 }
 if(!Array.isArray(value.phases)||value.phases.length!==6||
   value.phases.some(p=>!p||typeof p.description!=='string'||p.description.length<25))
   errors.push('missing_proof_workflow');
 if(!Array.isArray(value.publicSources)||value.publicSources.length<3||
   value.publicSources.some(s=>typeof s!=='string'||!s.startsWith('https://developers.cloudflare.com/')))
   errors.push('unsupported_source');
 return Object.freeze({ok:errors.length===0,verdict:errors.length?'INVALID':'BLOCKED',
  errors:Object.freeze(errors),remainingExternalControls:12,
  next:'Connect Cloudflare dashboard in an explicitly authorized read-only browser profile.'});
}
export function readCloudflareProof89(){return inspectCloudflareProof89(JSON.parse(readFileSync(file,'utf8')));}
const cli=process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url);
if(cli){
 const result=readCloudflareProof89();
 if(!result.ok){console.error('INVALID preflight: '+result.errors.join('; '));process.exitCode=1;}
 else if(process.argv.includes('--require-live')){
  console.error('STOP: REAL CLOUDFARE ACCESS PROOF NOT YET AVAILABLE; 12 external controls remain blocked.');
  process.exitCode=2;
 }else console.log('PASS readiness inventory; NOT LIVE-VERIFIED; all 12 release controls BLOCKED.');
}
