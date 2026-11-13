'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:850}});
 const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
 await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience=after-dinner-conversation',{waitUntil:'networkidle'});
 for(const lang of ['en','es','pt']){
  await page.locator('[data-experience-language="'+lang+'"]').click();
  for(const qw of ['what','who','how','why']){
   const label={what:{en:'WHAT',es:'QUÉ',pt:'O QUE'},who:{en:'WHO',es:'QUIÉN',pt:'QUEM'},how:{en:'HOW',es:'CÓMO',pt:'COMO'},why:{en:'WHY',es:'POR QUÉ',pt:'POR QUE'}}[qw][lang];
   const gear=page.locator('#questionGear button').filter({hasText: new RegExp('^'+label+'$','i')}).first();
   assert.equal(await gear.count(),1,'Missing '+lang+' '+qw+' disk');
   await gear.click();
   const focus=page.locator('#dependencyFocusSurface');
   const probe=page.locator('#dependencyHeadProbePanel');
   await focus.waitFor({state:'visible',timeout:10000});
   await probe.waitFor({state:'visible',timeout:10000});
   const p=await probe.textContent();
   assert.ok(p&&p.trim().length>20,'Missing Head Probe '+qw+' '+lang);
   console.log('PASS S4 '+qw.toUpperCase()+' '+lang.toUpperCase()+' focus/head-probe visible');
  }
 }
 assert.deepEqual(pageErrors,[],'Browser runtime errors');
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
