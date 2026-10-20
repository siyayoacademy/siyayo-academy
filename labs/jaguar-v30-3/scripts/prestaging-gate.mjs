// JAGUAR 87D — fail-closed PRE-STAGING inventory gate. Not a deploy authorization.
import {readFileSync,readdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const self=fileURLToPath(import.meta.url);
const root=resolve(dirname(self),'../../..');
const names=Object.freeze([...Array.from({length:8},(_,i)=>'LAB-'+String(i+1).padStart(2,'0')),
  ...Array.from({length:12},(_,i)=>'EXT-'+String(i+1).padStart(2,'0'))]);
const forbidden=/\b(?:wrangler\s+(?:deploy|publish)|pages\s+deploy|--remote|CLOUDFLARE_API_TOKEN|CF_API_TOKEN|CLOUDFLARE_ACCOUNT_ID)\b/i;
export function examinePreStaging87D(manifest,files){
 const findings=[],blockers=[],seen=new Set();
 const add=x=>findings.push(x);
 if(!manifest||typeof manifest!=='object'||Array.isArray(manifest))
  return {valid:false,verdict:'INVALID',findings:['manifest_invalid'],blockers};
 if(manifest.schema!=='SIYAYO-PRESTAGING-87D-1'||manifest.environment!=='ISOLATED_GITHUB_CI_ONLY'||
    manifest.explorerPin!=='c7e83709cacf8479847df0f3cee4ed8a563aaae6'||
    manifest.releaseAuthorized!==false||manifest.deploymentPermitted!==false)add('release_or_version_guard_failed');
 if(!Array.isArray(manifest.records)||manifest.records.length!==20)add('required_gate_count');
 for(const r of Array.isArray(manifest.records)?manifest.records:[]){
  if(!r||!names.includes(r.id)||seen.has(r.id)){add('invalid_or_duplicate_gate');continue;}
  seen.add(r.id);
  if(typeof r.description!=='string'||r.description.length<10)add('missing_gate_description:'+r.id);
  if(r.id.startsWith('LAB-')){
   if(r.kind!=='local'||r.status!=='lab_verified'||!/^\.github\/workflows\/jaguar-v30-3-[a-z-]+\.yml$/.test(r.evidence||''))
    add('invalid_lab_evidence:'+r.id);
  }else{
   if(r.kind!=='external'||r.status!=='blocked'||
      typeof r.verification!=='string'||r.verification.length<30)add('unverified_remote_claim:'+r.id);
   else blockers.push(r.id);
  }
 }
 for(const id of names)if(!seen.has(id))add('missing:'+id);
 if(!files||typeof files!=='object')add('sources_absent');
 else{
  const {worker='',wrangler='',jwt='',http='',browser='',workflows={}}=files;
  if(!/workers_dev\s*=\s*false/.test(wrangler)||
     !/00000000-0000-0000-0000-000000000030/.test(wrangler)||forbidden.test(wrangler))add('unsafe_wrangler');
  for(const old of ['/__lab/v30/write-once','/__lab/v30/read-once','/__lab/v30/read-other'])
   if(!worker.includes(old)||!worker.includes('route_disabled'))add('legacy_route_not_closed');
  if(!/crypto\.verify/.test(jwt)||!/isSessionActive/.test(jwt))add('jwt_boundary_drift');
  if(!/createHttpObservationHandler87B/.test(http)||!/method_not_allowed/.test(http)||
     !/Cache-Control/.test(http))add('http_boundary_drift');
  if(!/createExplorerObservationClient87C/.test(browser)||!browser.includes("credentials:'same-origin'")||
     !/logout\(\)/.test(browser))add('browser_boundary_drift');
  if(Object.keys(workflows).length<10)add('missing_workflows');
  for(const [name,body] of Object.entries(workflows)){
   if(!/^jaguar-v30-3-[a-z-]+\.yml$/.test(name)||
      !/jaguar\/v30-3-recovery-archive/.test(body)||
      !/permissions:\s*\n\s*contents:\s*read/.test(body)||forbidden.test(body))
    add('unsafe_workflow:'+name);
  }
 }
 return Object.freeze({valid:findings.length===0,verdict:findings.length?'INVALID':'BLOCKED',
  blockers:Object.freeze(blockers),findings:Object.freeze(findings)});
}
export function readPreStaging87D(){
 const file=p=>readFileSync(resolve(root,p),'utf8');
 const dir=resolve(root,'.github/workflows'),workflows={};
 for(const n of readdirSync(dir).filter(x=>x.startsWith('jaguar-v30-3-')&&x.endsWith('.yml')))
  workflows[n]=file('.github/workflows/'+n);
 return examinePreStaging87D(JSON.parse(file('labs/jaguar-v30-3/security/prestaging-readiness.json')),{workflows,
  worker:file('labs/jaguar-v30-3/src/worker-v30-integration.mjs'),
  wrangler:file('labs/jaguar-v30-3/test/wrangler.local.toml'),
  jwt:file('labs/jaguar-v30-3/test/http87/access-verifier.mjs'),
  http:file('labs/jaguar-v30-3/test/http87/read-only-http.mjs'),
  browser:file('labs/jaguar-v30-3/test/browser87/explorer-observation-client.mjs')});
}
if(process.argv[1]&&resolve(process.argv[1])===self){
 const result=readPreStaging87D();
 if(process.argv.includes('--require-ready')){
  console.error('STOP: staging release NOT authorized; '+result.blockers.length+' external controls remain unverified.');
  process.exitCode=2;
 }else if(!result.valid){
  console.error('INVALID audit: '+result.findings.join('; '));process.exitCode=1;
 }else console.log('PASS local audit consistency; STAGING BLOCKED: '+result.blockers.length+' external controls unverified.');
}
