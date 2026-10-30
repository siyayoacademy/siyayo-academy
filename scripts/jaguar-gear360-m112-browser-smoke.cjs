'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8765/verb-explorer.html',{waitUntil:'networkidle'});
  await page.locator('[data-mode="experience"]').click();
  for(const exp of ['shopping','preparing','having-dinner','after-dinner-conversation']){
   if(exp!=='shopping'){
    await page.locator('#nextExperience').click();
    const retained=page.locator('#questionGear .gear-option.active');
    assert.match((await retained.textContent()).trim(),/^(WHY|POR QUÉ|POR QUÊ)$/i,'WHY must remain selected across Experience transition');
   }
   const title=await page.locator('#experienceTitle').textContent();
   for(const lang of ['en','es','pt']){
    await page.locator('[data-experience-language="'+lang+'"]').click();
    const why=page.locator('#questionGear [data-question-index]').filter({hasText:/^(WHY|POR QUÉ|POR QUÊ)$/i}).first();
    if(!await why.count())throw new Error('WHY not available in '+exp+' '+lang+' '+title);
    await why.click();
    const host=page.locator('#gear360WhyStudy');
    await host.locator('.gear360-why-token').first().waitFor({state:'visible',timeout:10000});
    assert.equal(await host.isVisible(),true,'WHY hidden '+exp+' '+lang);
    assert.ok((await host.locator('.gear360-why-token').count())>0,'No words '+exp+' '+lang);
    assert.equal(await page.locator('#gear360WhyStudy').count(),1,'Duplicate host');
   }
  }
  assert.deepEqual(errors,[], 'JS errors');
  console.log('PASS REAL BROWSER: S1-S4 x EN/ES/PT WHY study without NICK');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
