#!/usr/bin/env node
'use strict';
// JAGUAR M1 source-to-main dependency closure. Read-only; no deploy or DB operations.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const [baseline,source]=process.argv.slice(2);
assert.ok(baseline&&source,'Usage: node script.js <main-checkout> <why-checkout>');
const read=(dir,p)=>fs.readFileSync(path.join(dir,p),'utf8');
const exists=(dir,p)=>fs.existsSync(path.join(dir,p));
const html=read(source,'verb-explorer.html'),js=read(source,'js/verb-explorer.js');
const refs=[
  ...Array.from(html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g),m=>m[1]),
  ...Array.from(html.matchAll(/<link\b[^>]*href=["']([^"']+\.css)["']/g),m=>m[1]),
  ...Array.from(js.matchAll(/["'](data\/[A-Za-z0-9_./-]+\.json)["']/g),m=>m[1])
].filter(p=>!p.startsWith('http'));
const unique=[...new Set(refs)];
const missingSource=unique.filter(p=>!exists(source,p));
const missingBaseline=unique.filter(p=>!exists(baseline,p));
const baselineHtml=read(baseline,'verb-explorer.html');
const scriptList=h=>Array.from(h.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g),m=>m[1]);
// Cover dynamically constructed WHY Dependency Focus corpus paths as well as literal references.
const whyDependencyPaths=['shopping','preparing','having','after-dinner'].flatMap(exp=>
  ['en','es','pt'].map(language=>'data/learning/dependencies/'+exp+'-why-'+language+'.json'));
const missingWhyCorpus=whyDependencyPaths.filter(p=>!exists(source,p));
const missingWhyCorpusMain=whyDependencyPaths.filter(p=>!exists(baseline,p));
const presentation=read(source,'js/verb-explorer-why-assessment-live.js');
const driver=read(source,'js/verb-explorer.js');
const wired=html.includes('js/verb-explorer-why-assessment-live.js')&&driver.includes('SIYAYOVerbExplorerWhyAssessmentLive');
const exploratoryDecoupled=presentation.includes('function mountExploration(')&&
  presentation.includes('return [\'having-dinner\',\'after-dinner-conversation\'].includes(text(experience.id))');
const report={
  source:'jaguar/why-explorer-live-wire-20261029',target:'main',
  scriptTags:{main:scriptList(baselineHtml).length,why:scriptList(html).length},
  directlyReferencedFiles:unique.length,
  missingInWhySource:missingSource,
  missingInMain:missingBaseline,
  whyCorpus:{sourceMissing:missingWhyCorpus,mainMissing:missingWhyCorpusMain},
  whyModuleWired:wired,
  exploratoryFallbackRecognized:exploratoryDecoupled,
  whyModuleExistsInMain:exists(baseline,'js/verb-explorer-why-assessment-live.js'),
  whyContractExistsInMain:exists(baseline,'data/learning/skills/why.json'),
  mandatoryRuntime:['js/verb-explorer.js','verb-explorer.html','js/verb-explorer-why-assessment-live.js','data/learning/skills/why.json']
};
console.log(JSON.stringify(report,null,2));
assert.equal(missingWhyCorpus.length,0,'STOP: source WHY S1-S4 EN/ES/PT corpus incomplete');
assert.ok(wired,'STOP: WHY runtime not wired to driver and HTML');
assert.ok(exploratoryDecoupled,'STOP: WHY pedagogical fallback missing');
assert.equal(missingSource.length,0,'STOP: source branch itself has missing direct dependencies');
assert.ok(scriptList(html).length>scriptList(baselineHtml).length,'unexpected baseline: re-evaluate before integration');
assert.equal(report.whyModuleExistsInMain,false,'baseline changed, reconcile before continuing');
assert.equal(report.whyContractExistsInMain,false,'baseline changed, reconcile before continuing');
console.log('M1 SOURCE DEPENDENCY CENSUS PASS — target gaps are explicitly reported, no code promoted');
