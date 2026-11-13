'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:880}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const lang of ['en','es','pt']){
   await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience=shopping-for-dinner',{waitUntil:'networkidle'});
   await page.locator('[data-experience-language="'+lang+'"]').click();
   for(const [word,idx] of [['how-much',2],['who',5],['what',0],['where',1],['which',3],['why',4]]){
    await page.locator('#questionGear [data-question-index="'+idx+'"]').click();
    await page.locator('#dependencyFocusSurface').waitFor({state:'visible',timeout:10000});
    await page.locator('#dependencyHeadProbePanel').waitFor({state:'visible',timeout:10000});
    assert.ok((await page.locator('#dependencyHeadProbePanel').textContent()).trim().length>30,'empty probe '+word+'/'+lang);
    const disclosure=page.locator('#learningTrailWordPathModule');
    if(!(await disclosure.evaluate(el=>el.open)))await disclosure.locator(':scope > summary').click();
    const trail=page.locator('#learnerTrailSurface');
    await trail.waitFor({state:'visible',timeout:10000});
    assert.equal(await trail.locator('.wp-poly-table').count(),1,'missing original Word Path '+word+'/'+lang);
    assert.equal(await trail.locator('.wp-poly-table tbody tr').count(),4);
    assert.equal(await trail.locator('.learner-trail-mark').count(),1,'missing Trail marker');
    assert.equal(await trail.locator('.wp-patita-observations').count(),0,'PATITA in Word Path');
    console.log('PASS S1 '+word+' '+lang+' Focus + Probe + Trail + Word Path');
   }
  }
  assert.deepEqual(errors,[],'Uncaught JavaScript errors');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
