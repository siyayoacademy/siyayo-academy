'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const lang of ['en','es','pt']){
   await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience=having-dinner',{waitUntil:'networkidle'});
   await page.locator('[data-experience-language="'+lang+'"]').click();
   for(const [qw,index] of [['who',1],['how',2],['what',0],['why',3]]){
    await page.locator('#questionGear [data-question-index="'+index+'"]').click();
    const focus=page.locator('#dependencyFocusSurface');
    const probe=page.locator('#dependencyHeadProbePanel');
    await focus.waitFor({state:'visible',timeout:10000});
    await probe.waitFor({state:'visible',timeout:10000});
    assert.ok((await probe.textContent()).trim().length>30,'empty probe '+qw+' '+lang);
    const details=page.locator('#learningTrailWordPathModule');
    if(!(await details.evaluate(el=>el.open)))await details.locator('summary').first().click();
    const trail=page.locator('#learnerTrailSurface');
    await trail.waitFor({state:'visible',timeout:10000});
    assert.equal(await trail.locator('.wp-poly-table').count(),1,'lost Word Path '+qw+' '+lang);
    assert.equal(await trail.locator('.wp-poly-table tbody tr').count(),4);
    assert.equal(await trail.locator('.learner-trail-mark').count(),1,'lost Trail marker');
    assert.equal(await trail.locator('.wp-patita-observations').count(),0,'PATITA contaminated Word Path');
    console.log('PASS S3 '+qw.toUpperCase()+' '+lang+' DF + Head Probe + Trail/Word Path');
   }
  }
  assert.deepEqual(errors,[],'browser runtime errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
