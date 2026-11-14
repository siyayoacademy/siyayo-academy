'use strict';
const assert=require('node:assert/strict'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const lang of ['en','es','pt']){
   await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience=preparing-dinner',{waitUntil:'networkidle'});
   await page.locator('[data-experience-language="'+lang+'"]').click();
   for(const [qw,idx] of [['what',0],['where',1],['when',2],['how',3],['which',4],['why',5],['who',6]]){
    await page.locator('#questionGear [data-question-index="'+idx+'"]').click();
    await page.locator('#dependencyFocusSurface').waitFor({state:'visible',timeout:10000});
    await page.locator('#dependencyHeadProbePanel').waitFor({state:'visible',timeout:10000});
    assert.ok((await page.locator('#dependencyHeadProbePanel').textContent()).trim().length>30,'Empty Head Probe '+qw+'/'+lang);
    const disclosure=page.locator('#learningTrailWordPathModule');
    if(!(await disclosure.evaluate(el=>el.open)))await disclosure.locator(':scope > summary').click();
    const trail=page.locator('#learnerTrailSurface');
    await trail.waitFor({state:'visible',timeout:10000});
    assert.equal(await trail.locator('.wp-poly-table').count(),1,'Original Word Path missing '+qw+'/'+lang);
    assert.equal(await trail.locator('.wp-poly-table tbody tr').count(),4);
    assert.equal(await trail.locator('.learner-trail-mark').count(),1,'Trail glyph missing '+qw+'/'+lang);
    assert.equal(await trail.locator('.wp-patita-observations').count(),0,'PATITA diagnostic leaked into Word Path');
    console.log('PASS S2 '+qw.toUpperCase()+' '+lang.toUpperCase()+' DF + Head Probe + Trail + Word Path');
   }
  }
  assert.deepEqual(errors,[],'Browser JavaScript errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
