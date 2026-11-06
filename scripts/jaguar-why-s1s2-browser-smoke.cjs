'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:850}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const exp of ['shopping-for-dinner','preparing-dinner']){
   await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience='+exp,{waitUntil:'networkidle'});
   for(const lang of ['en','es','pt']){
    await page.locator('[data-experience-language="'+lang+'"]').click();
    const q=page.locator('#questionGear [data-question-index]').filter({hasText:/^(WHY|POR QUÉ|POR QUÊ|POR QUE)$/i}).first();
    assert.ok(await q.count(),'WHY missing '+exp+' '+lang);await q.click();
    const panel=page.locator('#whyAssessmentPanel');await panel.waitFor({state:'visible',timeout:10000});
    assert.equal(await panel.locator('.why-probe-option').count(),2,'Expected 2 authored S1/S2 alternatives '+exp+' '+lang);
    const notice=await panel.locator('.why-contract-progress').first().textContent();
    assert.match(notice,/FREE|LIBRE|LIVRE/i,'Missing no-assessment disclosure');
    let box=await panel.locator('.why-probe-question-text').first().boundingBox();
    assert.ok(box&&box.width>180,'WHY question illegible '+exp+' '+lang+' '+JSON.stringify(box));
    assert.equal(await panel.locator('.why-probe-audio').count(),2,'Both response mini-speakers must remain visible');
    const audioLabels=await panel.locator('.why-probe-audio').allTextContents();
    // Audio clicks must not select a contextual choice or record an evaluation.
    await panel.locator('.why-probe-audio').first().click();
    assert.equal(await panel.locator('.why-probe-option[aria-pressed="true"]').count(),0,
      'Listening must not select or assess the answer');
    await panel.locator('.why-probe-option').first().click();
    assert.equal(await panel.locator('.why-probe-option[aria-pressed="true"]').count(),1);
   }
  }
  assert.deepEqual(errors,[], 'JavaScript errors during no-NICK WHY browser test');
  console.log('PASS Chromium WHY S1/S2 EN/ES/PT without NICK; free practice + layout + interactions');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
