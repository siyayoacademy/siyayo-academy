'use strict';
// XPR-03: read-only branch-name discovery. Never adds watches, never approves, never merges.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),a=process.argv.slice(2);
const opt=x=>{const i=a.indexOf(x);return i<0?null:a[i+1]||null},has=x=>a.includes(x);
if(has('--help')){console.log('node scripts/siyayo-xpr03-h14-discovery.cjs --live | --fixture FILE [--output-dir DIR] [--strict]');process.exit(0)}
const live=has('--live'),file=opt('--fixture');
if(Number(live)+Number(Boolean(file))!==1){console.error('Use exactly one --live or --fixture FILE');process.exit(2)}
const watch=JSON.parse(fs.readFileSync(path.join(root,'docs/siyayo-cross-project-watchlist.json'),'utf8'));
const known=new Set(watch.watches.filter(w=>w.role==='laboratory'&&w.repository==='siyayoacademy/siyayo-academy').map(w=>w.branch));
const token=process.env.GH_TOKEN||process.env.GITHUB_TOKEN||'';
function normalize(v){return typeof v==='string'?v:(typeof v?.name==='string'?v.name:null)}
async function branches(){
 if(file){
  const f=JSON.parse(fs.readFileSync(file,'utf8'));
  if(f.error)throw Error('Fixture '+String(f.error));
  if(!Array.isArray(f.branches))throw Error('invalid fixture branches');
  return f.branches.map(normalize);
 }
 const values=[];
 for(let p=1;p<=20;p++){
  const headers={Accept:'application/vnd.github+json','User-Agent':'siyayo-xpr03-discovery','X-GitHub-Api-Version':'2022-11-28'};
  if(token)headers.Authorization='Bearer '+token;
  const url='https://api.github.com/repos/siyayoacademy/siyayo-academy/branches?per_page=100&page='+p;
  const r=await fetch(url,{headers,signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('GitHub HTTP '+r.status+' / access or rate limit');
  const page=await r.json();
  if(!Array.isArray(page))throw Error('invalid GitHub branches payload');
  values.push(...page.map(normalize));
  if(page.length<100)return values;
 }
 throw Error('Too many branches: pagination beyond safety limit');
}
function eligible(s){const m=/^jaguar\/h14-(\d+)-why-/.exec(s||'');return m&&Number(m[1])>=40}
async function main(){
 let found=[],error=null;
 try{found=(await branches()).filter(eligible);if(found.some(x=>typeof x!=='string'))throw Error('invalid branch name')}catch(e){error=String(e?.message||e).slice(0,200)}
 const names=[...new Set(found)].sort(),untracked=names.filter(x=>!known.has(x)),missing=error?[]:[...known].filter(x=>!names.includes(x)).sort();
 const decision=error||untracked.length||missing.length?'REVIEW_REQUIRED':'REGISTERED_H14_COVERAGE_MATCH';
 const report={id:'SIYAYO-XPR-03-H14-DISCOVERY',mode:live?'github_read_only':'offline_fixture',at_utc:new Date().toISOString(),checked_prefix:'jaguar/h14-<number>-why-',minimum_elo:40,known_registered:[...known].sort(),discovered:names,untracked,missing,unavailable:error,decision,coverage:'H14 WHY branches only; excludes other projects, unrelated labs and the current XPR branch',recommendation:decision==='REVIEW_REQUIRED'?'Inspect each new/missing branch; pin exact HEAD separately after review; never auto-adopt.':'No H14 branch-name discrepancies in the consulted list. HEAD and test quality are checked separately.'};
 const out=opt('--output-dir')||'reports';fs.mkdirSync(out,{recursive:true});
 fs.writeFileSync(path.join(out,'xpr03-discovery.json'),JSON.stringify(report,null,2)+'\n');
 const md=['# SIYAYO XPR-03 — H14 branch discovery','','Mode: '+report.mode+' · Decision: '+decision,'','Registered: '+known.size+' · discovered: '+names.length+' · untracked: '+untracked.length+' · missing: '+missing.length,'','## New/untracked','',...untracked.map(x=>'- '+x),'','## Missing registered','',...missing.map(x=>'- '+x),'','## Verification','',report.recommendation,'',error?'Fetch error: '+error:'No fetch error','','Discovery is read-only. No branch is added or updated by this tool.'];
 fs.writeFileSync(path.join(out,'xpr03-discovery.md'),md.join('\n'));
 console.log('XPR-03 '+decision+': registered='+known.size+' discovered='+names.length+' untracked='+untracked.length+' missing='+missing.length+(error?' ERROR='+error:''));
 if(has('--strict')&&decision!=='REGISTERED_H14_COVERAGE_MATCH')process.exitCode=2;
}
main().catch(e=>{console.error('XPR-03 fatal:',String(e?.message||e));process.exitCode=2});
