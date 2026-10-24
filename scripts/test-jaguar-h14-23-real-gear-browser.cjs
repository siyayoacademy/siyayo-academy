#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{chromium}=require('playwright');
const root=process.cwd(),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server=http.createServer((req,res)=>{let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return;}
const f=path.resolve(root,'.'+p);if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end('not found');return;}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:390,height:844}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:'+server.address().port+'/verb-explorer.html?mode=experience',{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>window.SIYAYOVerbExplorerExperienceRuntime?.activeExperienceId?.()&&document.querySelector('#experienceLanguageGear .active'),{timeout:30000});
await page.addScriptTag({url:'/js/verb-explorer-h14-23-gear-snapshot-adapter.js'});
const read=()=>page.evaluate(()=>window.SIYAYOH1423GearSnapshotAdapter.read({document,runtime:window.SIYAYOVerbExplorerExperienceRuntime,navigation:window.SIYAYOVerbExplorerExperienceNavigation}));
let s=await read();assert.ok(s,'actual Gear Stack reading must succeed');assert.equal(s.language,'en');assert.equal(s.tense,'present');assert.equal(s.mode,'affirmative');assert.equal(s.period,null);assert.equal(s.perspective,null);assert.equal(s.assessmentAuthority,false);
await page.locator('[data-experience-language="pt"]').click();s=await read();assert.equal(s.language,'pt');
await page.locator('[data-perspective="narrating"]').click();s=await read();assert.equal(s.perspective,'narrating');
await page.locator('[data-experience-form="negative"]').click();s=await read();assert.equal(s.mode,'negative');assert.equal(s.perspective,null,'changing MODE clears Perspective in Explorer');
await page.locator('[data-experience-tense="past"]').click();s=await read();assert.equal(s.tense,'past');
await page.locator('[data-word-type="noun"]').click();s=await read();assert.equal(s.wordType,'noun');assert.equal(s.grammarLocked,true,'noun grammar lock should propagate');
assert.equal(await page.locator('#h14SpecializedPreview').isVisible(),false,'FUNC-13 remains hidden in normal Explorer');
assert.equal(await page.locator('#learningTrailWordPathModule').count(),1);
assert.equal(errors.length,0,errors.join('; '));
console.log('PASS H14.23 actual Chromium Gear Stack: language PT, tense PAST, mode NEGATIVE, perspective, grammar lock, FUNC-13 default off');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1});
