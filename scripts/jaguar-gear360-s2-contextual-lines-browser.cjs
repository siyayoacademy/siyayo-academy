'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const answers={
   when:{en:'We should cook the salmon before dinner.',es:'Debemos cocinar el salmón antes de la cena.',pt:'Devemos cozinhar o salmão antes do jantar.'},
   how:{en:'We are going to cook the rice in water.',es:'Vamos a cocinar el arroz en agua.',pt:'Vamos cozinhar o arroz em água.'},
   who:{en:'I am preparing the salad.',es:'Yo estoy preparando la ensalada.',pt:'Eu estou preparando a salada.'}
  };
  for(const lang of ['en','es','pt']){
   await page.goto('http://127.0.0.1:8765/verb-explorer.html?mode=experience&experience=preparing-dinner',{waitUntil:'networkidle'});
   await page.locator('[data-experience-language="'+lang+'"]').click();
   await page.locator('[data-experience-tense="present"]').click();
   await page.locator('[data-experience-form="affirmative"]').click();
   for(const [word,index] of [['when',2],['how',3],['who',6]]){
    await page.locator('#questionGear [data-question-index="'+index+'"]').click();
    const lines=page.locator('#livingLines');
    assert.equal(await lines.getAttribute('data-corpus-status'),'authored',word+'/'+lang+' missing authored response');
    assert.equal(await lines.locator('button.living-line').count(),2,'expected two speakable lines '+word+'/'+lang);
    assert.ok((await lines.textContent()).includes(answers[word][lang]),'wrong response '+word+'/'+lang);
    assert.equal(await lines.locator('.siyayo-speaker').count(),2,'missing speech affordance '+word+'/'+lang);
    assert.match(await lines.textContent(),/ILLUSTRATIVE RESPONSE|RESPUESTA ILUSTRATIVA|RESPOSTA ILUSTRATIVA/);
    await page.locator('#dependencyFocusSurface').waitFor({state:'visible'});
    await page.locator('#dependencyHeadProbePanel').waitFor({state:'visible'});
    let disclosure=page.locator('#learningTrailWordPathModule');
    if(!(await disclosure.evaluate(el=>el.open)))await disclosure.locator(':scope > summary').click();
    assert.equal(await page.locator('#learnerTrailSurface .wp-poly-table').count(),1);
    console.log('PASS S2 '+word+' '+lang+' illustrative response speech Trail HeadProbe');
   }
   await page.locator('#questionGear [data-question-index="2"]').click();
   await page.locator('[data-experience-tense="past"]').click();
   assert.equal(await page.locator('#livingLines').getAttribute('data-corpus-status'),'authoring-gap');
   assert.match(await page.locator('#livingLines').textContent(),/not yet authored|aún no redactado|ainda não elaborado/i);
  }
  assert.deepEqual(errors,[],'Browser JavaScript errors');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
