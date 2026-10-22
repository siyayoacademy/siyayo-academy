import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const input=new URL('../governance/cloudflare-staging-architecture-89d.json',import.meta.url);
export const read89D=()=>JSON.parse(readFileSync(input,'utf8'));
export function inspect89D(v){
 const issues=[];
 const fail=x=>issues.push(x);
 if(!v||typeof v!=='object'||Array.isArray(v))return {valid:false,verdict:'INVALID',issues:['invalid_object']};
 if(v.schema!=='siyayo.staging.design.v1'||v.elo!=='V30.3.89D'||v.status!=='DESIGN_ONLY')fail('contract_identity');
 const s=v.security||{},r=v.release||{},p=v.proposed||{},src=v.sources||{},o=v.observed||{};
 const required=['noRemoteDeploy','noRemoteD1Mutation','noSecretOrAuthCookieInRepo','noRealLearnerData',
  'noPublicPreviewAsAuthBoundary','noNICKAsIdentity','noInventedSidAsCloudflareContract',
  'sameOriginOrExplicitReviewedProxy','denyUnverifiedAndRevokedSessions',
  'independentServerSideAssessmentAuthority','onlyObservationReadUntilApproval',
  'noExploratoryEvidenceToGreenPass','noChangesToLearningTrailOrWordPath'];
 for(const key of required)if(s[key]!==true)fail('missing_security_boundary:'+key);
 for(const k of ['remoteAuthorized','stagingReady','externalGatesCompleted','rollbackRehearsed','productionChangeAllowed'])
  if(r[k]!==false)fail('false_release_claim:'+k);
 if(r.expectedCloudflarePagesSkipPrefix!=='[CF-Pages-Skip]')fail('pages_preview_skip');
 if(src.explorerPin!=='c7e83709cacf8479847df0f3cee4ed8a563aaae6'||
    src.mainPin!=='c2149f5e63b8de716cf9b9dcdede213bd328344e')fail('source_pin_drift');
 if(p.worker?.name!=='siyayo-academy-staging-api'||p.worker?.state!=='NOT_CREATED'||
   p.worker?.publicWorkersDevDisabledOrEquivalentlyProtected!==true)fail('worker_scope');
 if(p.d1?.name!=='siyayo-academy-staging'||p.d1?.state!=='NOT_CREATED'||p.d1?.databaseId!==null||
  p.d1?.emptySyntheticOnly!==true)fail('database_scope');
 if(p.access?.state!=='NOT_CONFIGURED_FOR_STAGING'||p.access?.domain!=='TO_SELECT'||p.access?.bypassProtectionRequired!==true)
  fail('access_scope');
 if(p.publicPages?.name!=='siyayo-academy'||p.publicPages?.unchanged!==true||
    p.publicPages?.stagingD1Binding!==false||p.originalVisualWorker?.name!=='shiny-scene-4b76'||
    p.originalVisualWorker?.unchanged!==true)fail('historical_resources');
 if(o.d1DatabaseCountShown!==0||o.prodPagesBindings!==0||o.previewPagesBindings!==0||
    o.previewsProtectedByAccess!==false||o.previewSecretValueRead!==false)fail('unverified_observations');
 if(!Array.isArray(v.gates)||v.gates.length!==12||
  v.gates.some((g,i)=>g.id!=='EXT-'+String(i+1).padStart(2,'0')||g.state!=='blocked'))
  fail('twelve_external_gates');
 if(!Array.isArray(v.phases)||v.phases.length!==7||v.phases[0].state!=='designed'||
    v.phases.slice(1).some(s=>s.state!=='blocked'))fail('unsafe_phase_progress');
 return Object.freeze({valid:issues.length===0,verdict:issues.length?'INVALID':'BLOCKED',
  blockedExternalGates:12,issues:Object.freeze(issues)});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const r=inspect89D(read89D());
 if(process.argv.includes('--require-live')){
  console.error('STOP: staging design is not a Cloudflare deployment authorization');process.exitCode=2;
 }else if(!r.valid){console.error('INVALID: '+r.issues.join('; '));process.exitCode=1;}
 else console.log('PASS design consistency; CLOUDFlARE STAGING BLOCKED (12 external gates)');
}
