'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const context of [
      {experience:'shopping-for-dinner',word:'which'},
      {experience:'preparing-dinner',word:'which'},
      {experience:'having-dinner',word:'who'},
      {experience:'having-dinner',word:'how'},
      {experience:'after-dinner-conversation',word:'what'},
      {experience:'after-dinner-conversation',word:'why'}
    ]){
      await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience='+context.experience,{waitUntil:'networkidle'});
      for(const lang of ['en','es','pt']){
        await page.locator('[data-experience-language="'+lang+'"]').click();
        const current=await page.evaluate(({word})=>{
          const buttons=[...document.querySelectorAll('#questionGear button')];
          const candidate=buttons.find(b=>(b.textContent||'').trim().toLowerCase()===word);
          return candidate?.dataset.questionIndex;
        },{word:context.word});
        // Question labels are localized; use the canonical index from corpus order.
        const idx={ 'shopping-for-dinner':{which:3},'preparing-dinner':{which:4},'having-dinner':{who:1,how:2},'after-dinner-conversation':{what:0,why:2}}[context.experience][context.word];
        await page.locator('#questionGear [data-question-index="'+idx+'"]').click();
        const details=page.locator('#learningTrailWordPathModule');
        if(!(await details.evaluate(el=>el.open)))await details.locator('summary').first().click();
        const trail=page.locator('#learnerTrailSurface');
        await trail.waitFor({state:'visible',timeout:10000});
        const matrix=trail.locator('.wp-poly-table');
        assert.equal(await matrix.count(),1,'missing canonical polyglot matrix '+JSON.stringify(context)+' '+lang);
        assert.equal(await matrix.locator('tbody tr').count(),4,'four canonical skill families must remain');
        assert.equal(await matrix.locator('tbody tr:first-child td').count(),3,'three languages required');
        assert.ok(await trail.locator('.learner-trail-mark').count(),'missing original milestone visual');
        assert.ok(await trail.locator('.learner-trail-experience').count(),'missing experience label');
        assert.ok(await trail.locator('.learner-trail-current-word').count(),'missing current word');
        assert.equal(await trail.locator('.wp-patita-observations').count(),0,'PATITA test log must not pollute Word Path');
        assert.equal(await trail.locator('[data-observation-kind]').count(),0,'diagnostic logs must stay outside original Trail');
        const values=await matrix.locator('td.wp-poly-cell .wp-poly-value').allTextContents();
        assert.equal(values.length,12);
        assert.ok(values.every(x=>x.trim()==='—'),'no NICK cannot mint canonical progress');
        console.log('PASS Trail/Word Path original shell '+context.experience+' '+context.word+' '+lang);
      }
    }
    assert.deepEqual(errors,[],'browser errors');
  }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
