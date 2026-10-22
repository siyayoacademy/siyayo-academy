// JAGUAR V30.3.84 static CI isolation gate: NOT a substitute for authentication.
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'..'), root=resolve(base,'..','..');
const paths={config:resolve(base,'test/wrangler.local.toml'),smoke:resolve(base,'scripts/cloudflare-local-smoke.sh'),localCI:resolve(root,'.github/workflows/jaguar-v30-3-cloudflare-local.yml'),regressionCI:resolve(root,'.github/workflows/jaguar-v30-3-regression.yml'),worker:resolve(base,'src/worker-v30-integration.mjs')};
export function validateIsolation(x) {
  const findings=[];
  const check=(ok,reason)=>{if(!ok)findings.push(reason);};
  const {config='',smoke='',localCI='',regressionCI='',worker=''}=x;
  check(/workers_dev\s*=\s*false\b/.test(config),'workers_dev must be false');
  check(/database_id\s*=\s*["']00000000-0000-0000-0000-000000000030["']/.test(config),'D1 ID must be test placeholder');
  check(/main\s*=\s*["']\.\.\/src\/worker-v30-integration\.mjs["']/.test(config),'config must target isolated Worker');
  check(!/^\s*(?:account_id|route|routes|zone_id|preview_urls)\s*=/mi.test(config),'config may not expose account/route/zone');
  check(!/\[env\./.test(config),'config may not contain remote environments');
  check(/d1\s+execute\s+ASSESSMENT_DB\s+--local\b/.test(smoke),'D1 migration must use --local');
  check(/dev\s+--local\b/.test(smoke),'Wrangler dev must use --local');
  check(/--ip\s+127\.0\.0\.1\b/.test(smoke),'Wrangler must bind loopback');
  check(/--persist-to\s+["']?\$STATE/.test(smoke),'local persisted D1 state required');
  check(/WRANGLER_SEND_METRICS=false/.test(smoke),'telemetry opt-out required');
  for(const [label,yml] of [['local CI',localCI],['regression CI',regressionCI]]) {
    check(/branches:\s*\n\s*-\s*jaguar\/v30-3-recovery-archive/.test(yml),label+' branch scope');
    check(/permissions:\s*\n\s*contents:\s*read\b/.test(yml),label+' read-only token');
    check(!/\b(?:CLOUDFLARE_API_TOKEN|CF_API_TOKEN|CLOUDFLARE_ACCOUNT_ID)\b/.test(yml),label+' must not access Cloudflare secrets');
  }
  for(const [label,content] of [['config',config],['smoke',smoke],['local CI',localCI],['regression CI',regressionCI]]) {
    check(!/\bwrangler\s+(?:deploy|publish)\b|\bpages\s+deploy\b|\bwrangler-action\b|\b--remote\b/i.test(content),label+' contains remote deploy instruction');
  }
  check(["'/__lab/v30/write-once'","'/__lab/v30/read-once'","'/__lab/v30/read-other'"].every(s=>worker.includes(s)),'three blocked HTTP paths required');
  check(/includes\(url\.pathname\)/.test(worker) && /route_disabled/.test(worker) && /status:\s*404/.test(worker),'Worker must deny experimental routes');
  check(/url\.pathname\s*!==\s*'\/__lab\/v30\/health'/.test(worker),'health route guard required');
  return findings;
}
export function readIsolationInputs(){
  return Object.fromEntries(Object.entries(paths).map(([key,path])=>[key,readFileSync(path,'utf8')]));
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const findings=validateIsolation(readIsolationInputs());
  if(findings.length){console.error('STOP: V30.3 isolation failed\n'+findings.map(x=>'- '+x).join('\n'));process.exitCode=1;}
  else console.log('PASS: V30.3 local-only CI, loopback, D1 fixture, experimental paths closed');
}
