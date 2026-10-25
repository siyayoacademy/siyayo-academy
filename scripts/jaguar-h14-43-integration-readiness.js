'use strict';
// Read-only handoff verification. No adapter, evaluator, DB or network writes.
const fs=require('node:fs'),crypto=require('node:crypto');
const manifest=require('../data/learning/references/jaguar-h14-43-selective-integration-manifest-v0.1.json');
function blob(path){const b=fs.readFileSync(path);return crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex');}
function audit(s=manifest){
 const problems=[];
 if(!Array.isArray(s.inventory)||!s.inventory.length)problems.push('EMPTY_INVENTORY');
 for(const item of s.inventory||[]){try{if(blob(item.path)!==item.gitBlobSha)problems.push('SOURCE_DRIFT:'+item.path);}catch{problems.push('MISSING_SOURCE:'+item.path);}}
 if(s.runtimeApplyAllowlist?.length!==0)problems.push('UNAUTHORIZED_RUNTIME_ALLOWLIST');
 if(Object.values(s.preservation||{}).some(v=>v!==false))problems.push('PRESERVATION_DRIFT');
 const expected=['DG-01','DG-02','DG-03','DG-04','DG-05','DG-06','DG-07'];
 if(JSON.stringify(s.gates?.map(g=>g.id))!==JSON.stringify(expected)||s.gates.some(g=>g.status!=='OPEN'))problems.push('GATE_DRIFT');
 for(const key of ['main','pr3Head','pr3Base','registryHead','labHead'])if(!/^[a-f0-9]{40}$/.test(s.snapshot?.[key]||''))problems.push('MISSING_HEAD:'+key);
 for(const key of ['runtimeIntegration','stagingDeployment','production'])if(s.decision?.[key]!=='NO_GO')problems.push('UNSUPPORTED_GO:'+key);
 if(s.decision?.technicalHandoff!=='GO')problems.push('HANDOFF_DECISION_DRIFT');
 for(const item of s.snapshot?.comparison||[])try{if(blob(item.path)!==item.lab)problems.push('PROTECTED_LAB_DRIFT:'+item.path);}catch{problems.push('MISSING_PROTECTED:'+item.path);}
 return {status:problems.length?'STOP_MANIFEST_DRIFT':'HANDOFF_VERIFIED_RUNTIME_NO_GO',sourceCount:s.inventory?.length||0,openGates:s.gates?.length||0,technicalPreparationComplete:problems.length===0,runtimeIntegrationAllowed:false,productionAllowed:false,problems};
}
module.exports={audit};
if(require.main===module){const r=audit();console.log(JSON.stringify(r,null,2));if(r.problems.length)process.exitCode=1;}
