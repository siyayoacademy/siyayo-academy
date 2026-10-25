'use strict';
// SIYAYO XPR-02, read-only GitHub HEAD audit. Only local report files are written.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),argv=process.argv.slice(2);
const flag=x=>argv.includes(x),arg=x=>{const i=argv.indexOf(x);return i<0?null:argv[i+1]||null};
if(flag('--help')){console.log('node scripts/siyayo-xpr02-drift-audit.cjs --live | --fixture FILE [--output-dir DIR] [--strict]');process.exit(0)}
const live=flag('--live'),fixturePath=arg('--fixture');
if(Number(live)+Number(Boolean(fixturePath))!==1){console.error('Choose exactly one --live or --fixture FILE');process.exit(2)}
const reg=JSON.parse(fs.readFileSync(path.join(root,'docs/siyayo-cross-project-registry.json'),'utf8'));
const list=JSON.parse(fs.readFileSync(path.join(root,'docs/siyayo-cross-project-watchlist.json'),'utf8'));
const fixture=fixturePath?JSON.parse(fs.readFileSync(fixturePath,'utf8')):null;
const modules=new Set(reg.entries.map(m=>m.id)),projects=new Map(reg.projects.map(p=>[p.id,p]));
const supportedWatchlistVersions=new Set(['1.0.0','1.1.0']);
if(!supportedWatchlistVersions.has(list.schema_version))throw Error('unsupported watchlist schema_version: '+JSON.stringify(list.schema_version));
if(!Array.isArray(list.watches)||list.watches.length<4)throw Error('invalid watchlist');
for(const w of list.watches){
 if(!projects.has(w.project_id)||projects.get(w.project_id).repository!==w.repository)throw Error('unexpected repository');
 if(!/^[0-9a-f]{40}$/.test(w.expected_sha)||!/^[a-zA-Z0-9_./-]+$/.test(w.branch)||w.branch.includes('..'))throw Error('bad HEAD reference');
}
const aia=[
 [/^(js\/siyayo-responsive-preview\.js|css\/siyayo-responsive-stage\.css)$/,['SIA:RS-01']],
 [/^(js\/verb-explorer\.js|verb-explorer\.html)$/,['SIA:EXP-01','SIA:GEAR-06','SIA:LIVE-07','SIA:NEXT-09','SIA:SPEECH-A']],
 [/^data\/learning\/experience-seeds\.json$/,['SIA:EXP-01','SIA:CTX-02','SIA:GEAR-06','SIA:LIVE-07','SIA:FUNC-13']],
 [/^data\/learning\/dependencies\//,['SIA:DEP-03','SIA:HEAD-04']],
 [/^data\/learning\/skills\//,['SIA:EVAL-08','SIA:TRAIL-10','SIA:WORD-11']],
 [/^js\/verb-explorer-patita-interaction-trail\.js$/,['SIA:PATITA-12']],
 [/^js\/verb-explorer-dependency-/ ,['SIA:DEP-03','SIA:HEAD-04']],
 [/^js\/.*assessment|^js\/adaptive-.*(attempt|evidence)/,['SIA:EVAL-08','SIA:TRAIL-10','SIA:WORD-11']],
 [/^js\/verb-explorer-learner-trail/,['SIA:TRAIL-10']],
 [/^js\/verb-explorer-polyglot-word-path/,['SIA:WORD-11']],
 [/^css\/verb-explorer\.css$/,['SIA:LIVE-07','SIA:GEAR-06']],
 [/^labs\/jaguar-v30-3\//,[],'LAB_ONLY_NO_RUNTIME_ADOPTION'],
 [/^docs\/|^scripts\/siyayo-xpr02-|^\.github\/workflows\/siyayo-xpr02-/,[],'DOCUMENTATION_OR_TEST_ONLY']
];
const mce=[
 [/^(js\/ris-responsive-preview\.js|css\/ris-responsive-stage\.css|css\/ris-internal-responsive\.css)$/,['MCE:MCE-RS-01']],
 [/^index\.html$/,['MCE:MCE-HEAD-01','MCE:MCE-NAV-02','MCE:MCE-HYM-A','MCE:MCE-STANZA-B','MCE:MCE-STAGE-06','MCE:MCE-FLAG-05']],
 [/^data\/santo-cruzeiro-universal\.json$/,['MCE:MCE-HYM-A','MCE:MCE-STANZA-B'],'DOCUMENTARY_ONLY_NOT_LIVE_RENDERER'],
 [/^data\/modelo-(a|b)-/,['MCE:MCE-STANZA-B'],'RESEARCH_NOT_RUNTIME'],
 [/^hinarios\//,['MCE:MCE-HYM-HUB-13']],
 [/^homenagem\//,['MCE:MCE-TRIBUTE-09']],
 [/^decreto-1970\//,['MCE:MCE-DOC-08']],
 [/^vida-e-obra\//,['MCE:MCE-BIO-10']],
 [/^calendario\//,['MCE:MCE-CAL-11']],
 [/^nossa-irmandade\//,['MCE:MCE-LINKS-12']],
 [/^(ris-(green|blue)\.png|eagle-(white|blue-white)\.png)$/,['MCE:MCE-FLAG-05','MCE:MCE-STAGE-06']],
 [/^assets\/images\/retrato-decreto\.jpg$/,['MCE:MCE-DOC-08']],
 [/^assets\/images\//,['MCE:MCE-TRIBUTE-09']],
 [/^docs\/|^README/,[],'DOCUMENTATION_ONLY']
];
function mapPath(project,file){
 const matches=(project==='SIA'?aia:mce).filter(x=>x[0].test(file));
 if(!matches.length)return {modules:[],classification:'UNMAPPED_REVIEW_REQUIRED'};
 const set=[...new Set(matches.flatMap(x=>x[1]))].sort();
 for(const id of set)if(!modules.has(id))throw Error('missing registry module '+id);
 return {modules:set,classification:matches.map(x=>x[2]).find(Boolean)||'POTENTIAL_CONSUMER_NOT_PROVEN'};
}
const token=process.env.GH_TOKEN||process.env.GITHUB_TOKEN||'';
async function fetchJson(url){
 const h={Accept:'application/vnd.github+json','User-Agent':'siyayo-xpr02-drift','X-GitHub-Api-Version':'2022-11-28'};
 if(token)h.Authorization='Bearer '+token;
 const r=await fetch(url,{headers:h,signal:AbortSignal.timeout(20000)});
 if(!r.ok)throw Error('GitHub HTTP '+r.status+' / access or rate limit');
 return r.json();
}
async function head(w){
 if(fixture){const f=fixture.branches?.[w.id];if(!f)throw Error('missing fixture head');if(f.error)throw Error(String(f.error));return f.sha}
 const r=await fetchJson('https://api.github.com/repos/'+w.repository+'/branches/'+encodeURIComponent(w.branch));return r.commit?.sha;
}
async function compare(w,sha){
 if(fixture){const f=fixture.comparisons?.[w.id];if(!f)throw Error('missing fixture comparison');if(f.error)throw Error(String(f.error));return f}
 return fetchJson('https://api.github.com/repos/'+w.repository+'/compare/'+w.expected_sha+'...'+sha);
}
async function main(){
 const result=[];
 for(const w of list.watches){
  const r={watch_id:w.id,project_id:w.project_id,role:w.role,repository:w.repository,branch:w.branch,expected_sha:w.expected_sha,current_sha:null,status:'UNKNOWN',comparison_status:null,changed_paths:[],potential_modules:[],related_cross_project_links:[],notes:[]};
  try{
   const current=await head(w);
   if(!/^[0-9a-f]{40}$/.test(current||''))throw Error('missing valid commit SHA');
   r.current_sha=current;
   if(current===w.expected_sha){r.status='MATCH';r.comparison_status='identical'}
   else{
    const d=await compare(w,current),files=Array.isArray(d.files)?d.files:[];
    r.comparison_status=d.status||'unknown';
    if(files.length>=300)r.notes.push('300 paths: potentially truncated GitHub comparison');
    if(!files.length)r.notes.push('no changed path details: manual review');
    r.changed_paths=files.map(f=>{const p=String(f.filename||'').replace(/[\r\n]/g,' ');const impact=mapPath(w.project_id,p);return {path:p,git_status:f.status||'unknown',potential_modules:impact.modules,classification:impact.classification}});
    const changed=new Set(r.changed_paths.flatMap(p=>p.potential_modules));
    r.potential_modules=[...changed].sort();
    r.related_cross_project_links=reg.cross_project_links.filter(l=>changed.has(l.from)||changed.has(l.to)).map(l=>({id:l.id,from:l.from,to:l.to,type:l.type}));
    if(d.status!=='ahead')r.notes.push('Non-fast-forward or unknown lineage: review independently');
    if(w.role==='laboratory')r.notes.push('lab changes do not imply Explorer integration');
    r.status='DRIFT_REVIEW_REQUIRED';
   }
  }catch(e){r.status='UNKNOWN';r.notes.push(String(e?.message||e).slice(0,180))}
  result.push(r);
 }
 const counts={match:result.filter(x=>x.status==='MATCH').length,drift:result.filter(x=>x.status==='DRIFT_REVIEW_REQUIRED').length,unknown:result.filter(x=>x.status==='UNKNOWN').length};
 const report={id:'SIYAYO-XPR-02-DRIFT-AUDIT',mode:live?'live_github_read_only':'offline_fixture',generated_at:new Date().toISOString(),summary:counts,decision:counts.drift||counts.unknown?'REVIEW_REQUIRED':'NO_REGISTERED_DRIFT',limitations:[
 'Only registered branches are checked; new laboratories require explicit watchlist entries.',
 'Path mappings are potential consumers, not confirmed dependency edges.',
 'Matching HEADs never prove visual, functional or pedagogical homologation.',
 'Registry HEAD drift requires manual catalog re-indexing.',
 'GitHub compare may truncate paths at 300 files.',
 'MCE hymn JSON is documentary: index.html does not fetch it.'
 ],results:result};
 const md=['# SIYAYO XPR-02 — HEAD Drift Audit','','Mode: '+report.mode+' · UTC '+report.generated_at,'Decision: '+report.decision,'','| Watch | Expected | Current | Result |','|---|---|---|---|'];
 for(const r of result)md.push('| '+r.watch_id+' | '+r.expected_sha.slice(0,12)+' | '+(r.current_sha||'UNKNOWN').slice(0,12)+' | '+r.status+' |');
 md.push('','## Review details','');
 for(const r of result.filter(x=>x.status!=='MATCH')){
  md.push('### '+r.watch_id+' — '+r.status,'','Comparison '+(r.comparison_status||'unknown'));
  for(const p of r.changed_paths)md.push('- '+p.path+' — '+p.classification+'; modules: '+(p.potential_modules.join(', ')||'unmapped'));
  for(const l of r.related_cross_project_links)md.push('- Cross-project review '+l.id+' ('+l.from+' → '+l.to+')');
  for(const n of r.notes)md.push('- Note: '+n);
  md.push('');
 }
 md.push('## Limitations','',...report.limitations.map(x=>'- '+x),'','No merge, deploy, backend migration, assessment authority or approval.','');
 const dir=arg('--output-dir')||'reports';fs.mkdirSync(dir,{recursive:true});
 fs.writeFileSync(path.join(dir,'xpr02-report.json'),JSON.stringify(report,null,2)+'\n');
 fs.writeFileSync(path.join(dir,'xpr02-report.md'),md.join('\n'));
 console.log('XPR-02 '+report.decision+': MATCH '+counts.match+', DRIFT '+counts.drift+', UNKNOWN '+counts.unknown);
 if(flag('--strict')&&report.decision!=='NO_REGISTERED_DRIFT')process.exitCode=2;
}
main().catch(e=>{console.error('XPR-02 fatal:',String(e?.message||e));process.exitCode=2});
