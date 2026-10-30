#!/usr/bin/env node
'use strict';
// M1.5 read-only delta census: no deploy, imports, SQL or network access.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const [mainDir,whyDir,integratedDir]=process.argv.slice(2);
assert.ok(mainDir&&whyDir&&integratedDir,'Usage: node m15.cjs <main> <why> <integration>');
const read=(d,p)=>fs.readFileSync(path.join(d,p),'utf8');
const get=(d)=>{const html=read(d,'verb-explorer.html');return {
  ids:new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1])),
  scripts:[...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g)].map(m=>m[1]),
  styles:[...html.matchAll(/<link\b[^>]*href=["']([^"']+\.css)["']/g)].map(m=>m[1]),
  html
};};
const main=get(mainDir),why=get(whyDir),integration=get(integratedDir);
const only=(a,b)=>[...a].filter(x=>!b.has(x));
const sourceRefs=[...why.scripts,...why.styles];
const missingSource=sourceRefs.filter(p=>!fs.existsSync(path.join(whyDir,p)));
const htmlOnly=only(why.ids,main.ids);
const sourceDriver=read(whyDir,'js/verb-explorer.js');
const driverIds=[...new Set([...sourceDriver.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map(m=>m[1]))];
const driverMissing=driverIds.filter(id=>!why.ids.has(id));
const integrationMissing=driverIds.filter(id=>!integration.ids.has(id));
const modules=['js/adaptive-why-contextual-reason-probe-specification-source.js','js/adaptive-why-contextual-reason-probe-result.js','js/adaptive-why-contextual-reason-probe-evidence-bridge.js','js/adaptive-why-contextual-reason-probe-attempt-boundary.js','js/verb-explorer-why-assessment-live.js'];
const recovered=modules.filter(p=>fs.existsSync(path.join(integratedDir,p)));
const findings={source:{scripts:why.scripts.length,styles:why.styles.length,htmlIds:why.ids.size},main:{scripts:main.scripts.length,styles:main.styles.length,htmlIds:main.ids.size},
  newSourceHtmlIds:htmlOnly,requiredStylesAbsentFromMain:why.styles.filter(p=>!main.styles.includes(p)),
  requiredScriptsAbsentFromMain:why.scripts.filter(p=>!main.scripts.includes(p)),
  sourceHtmlReferencesMissing:missingSource,sourceDriverIdsMissingFromSourceHtml:driverMissing,
  recoveredWhyModules:recovered,sourceDriverIdsMissingFromIntegrationHtml:integrationMissing,
  runtimeIntegrated:modules.every(p=>integration.scripts.includes(p))&&integration.scripts.includes('js/verb-explorer.js')&&integrationMissing.length===0};
console.log(JSON.stringify(findings,null,2));
assert.equal(missingSource.length,0,'STOP: source referenced assets missing');
// A runtime may create an element dynamically; record IDs absent in the static HTML as diagnostics, not automatic proof of breakage.
if(driverMissing.length)console.warn('REVIEW: dynamically created or unresolved DOM IDs',driverMissing);
assert.equal(recovered.length,modules.length,'STOP: incomplete recovered WHY modules');
if(findings.runtimeIntegrated)console.warn('REVIEW: runtime now wired; dynamic regression is required before promotion');
console.log('M1.5 PASS: structural source inventory completed; browser behavior NOT certified');
