'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:800}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const id of ['having-dinner','after-dinner-conversation']){
   await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience='+id,{waitUntil:'networkidle'});
   for(const language of ['en','es','pt']){
    await page.locator('[data-experience-language="'+language+'"]').click();
    const btn=page.locator('#questionGear [data-question-index]').filter({hasText:/^(WHY|POR QUÉ|POR QUÊ|POR QUE)$/i}).first();
    assert.ok(await btn.count(),'Missing WHY selection: '+id+' '+language);
    await btn.click();
    const panel=page.locator('#whyAssessmentPanel');
    await panel.waitFor({state:'visible',timeout:10000});
    const heading=await panel.locator('h3').first().textContent();
    assert.ok(heading&&/WHY|POR QUÉ|POR QUÊ|POR QUE/i.test(heading),'Wrong no-NICK practice '+id+' '+language);
    const question=panel.locator('.why-probe-question-text').first();
    await question.waitFor({state:'visible'});
    const shape=await question.boundingBox();
    assert.ok(shape&&shape.width>180,'Fragmented exploratory question width '+id+' '+language+': '+JSON.stringify(shape));
    const audio=panel.locator('.why-probe-audio');
    assert.ok(await audio.count()>=2,'Missing free-exploration response mini-speakers '+id+' '+language);
    assert.equal(await panel.locator('.why-probe-option[aria-pressed="true"]').count(),0);
    await audio.first().click();
    assert.equal(await panel.locator('.why-probe-option[aria-pressed="true"]').count(),0,'Listening must not mark an assessment choice');
    await page.locator('#learningTrailWordPathModule > summary').click();
    const trail=page.locator('#learnerTrailSurface');
    const state=await trail.evaluate(el=>({hidden:el.hidden,html:el.innerHTML.slice(0,350),display:getComputedStyle(el).display,parentHidden:el.parentElement?.hidden,detailsOpen:document.getElementById('learningTrailWordPathModule').open,outer:el.outerHTML.slice(0,430)}));console.log('TRAIL_DEBUG',id,language,JSON.stringify(state));
    await trail.waitFor({state:'visible',timeout:5000});
    assert.match(await trail.textContent(),/LEARNING TRAIL|RUTA DE APRENDIZAJE|TRILHA DE APRENDIZAGEM/i);
    assert.match(await trail.textContent(),/WHY|POR QUÉ|POR QUÊ|POR QUE/i);

   }
  }
  assert.deepEqual(errors,[],'Browser JavaScript exceptions');
  console.log('PASS Chromium full Explorer S3/S4 x EN ES PT without NICK');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
