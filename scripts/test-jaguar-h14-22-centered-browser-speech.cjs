#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const base=process.cwd(),dir=path.join(base,'artifacts/h14-22');
fs.mkdirSync(dir,{recursive:true});
const matrix=JSON.parse(fs.readFileSync('data/learning/references/jaguar-h14-7-five-functions-experience-matrix-v0.1.json','utf8'));
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let u;try{u=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return;}
 const f=path.resolve(base,'.'+u);
 if(!f.startsWith(base+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end('not found');return;}
 res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res);
});
const dimensions=[
 {id:'desktop',width:1440,height:900},
 {id:'tablet',width:768,height:1024},
 {id:'smartphone-portrait',width:390,height:844},
 {id:'small-portrait',width:320,height:700},
 {id:'smartphone-landscape',width:844,height:390}
];
const log=[];
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
 browser=await chromium.launch({headless:true});
 for(const device of dimensions){
  const context=await browser.newContext({viewport:{width:device.width,height:device.height}});
  await context.addInitScript(()=>{
   const calls=[];window.__h1422SpeechCalls=calls;
   class FakeUtterance{constructor(text){this.text=text;this.lang='';this.onstart=null;this.onend=null;this.onerror=null;}}
   Object.defineProperty(window,'SpeechSynthesisUtterance',{configurable:true,value:FakeUtterance});
   Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{
    cancel(){calls.push({action:'cancel'});},
    speak(utterance){calls.push({action:'speak',text:utterance.text,lang:utterance.lang});if(utterance.onstart)utterance.onstart();}
   }});
  });
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/labs/func13-function-window-h14-21/index.html',{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>document.querySelector('#func13Status')?.textContent.includes('ESTUDO APENAS'),{timeout:30000});
  const measurement=await page.evaluate(()=>{
    const rect=sel=>document.querySelector(sel).getBoundingClientRect();
    const card=rect('#func13Speak'),text=rect('.speech-content'),svg=rect('.gold-speaker-svg');
    const controls=rect('#func13Functions'),details=rect('#func13Study');
    const buttons=[...document.querySelectorAll('#func13Functions button')].map(b=>({label:b.textContent.trim(),r:b.getBoundingClientRect().toJSON()}));
    const centers=[],sorted=[...buttons].sort((a,b)=>a.r.top-b.r.top||a.r.left-b.r.left);
    for(const b of sorted){let row=centers.find(x=>Math.abs(x.top-b.r.top)<3);if(!row){row={top:b.r.top,left:b.r.left,right:b.r.right,labels:[]};centers.push(row);}row.left=Math.min(row.left,b.r.left);row.right=Math.max(row.right,b.r.right);row.labels.push(b.label);}
    return {viewport:window.innerWidth,scroll:document.documentElement.scrollWidth,
      cardCenter:(card.left+card.right)/2,textCenter:(text.left+text.right)/2,
      svgColor:getComputedStyle(document.querySelector('.gold-speaker-svg')).color,
      buttonRows:centers.map(r=>({count:r.labels.length,labels:r.labels,center:(r.left+r.right)/2})),
      stripCenter:(controls.left+controls.right)/2,
      buttonCount:buttons.length,
      cardBottom:card.bottom,buttonTop:controls.top,buttonBottom:controls.bottom,studyTop:details.top,
      studyColumns:getComputedStyle(document.querySelector('#func13Study')).gridTemplateColumns.split(' ').length,
      centeredStudy:[...document.querySelectorAll('#func13Study .study-cell')].every(x=>getComputedStyle(x).textAlign==='center')
    };
  });
  assert.equal(measurement.buttonCount,5,'five functions must remain present');
  assert.ok(measurement.scroll<=measurement.viewport+3,device.id+' viewport overflow '+(measurement.scroll-measurement.viewport));
  assert.ok(Math.abs(measurement.cardCenter-measurement.textCenter)<=2,device.id+' sentence not centered on full card');
  assert.equal(measurement.svgColor,'rgb(230, 195, 117)',device.id+' gold SVG');
  assert.ok(measurement.cardBottom<=measurement.buttonTop+2&&measurement.buttonBottom<=measurement.studyTop+35,device.id+' three-band order');
  assert.ok(measurement.centeredStudy,device.id+' pedagogy content not centered');
  for(const row of measurement.buttonRows)assert.ok(Math.abs(row.center-measurement.stripCenter)<=12,
      device.id+' unbalanced button row: '+row.labels.join(', ')+'; delta '+Math.abs(row.center-measurement.stripCenter));
  if(device.width<=760){assert.equal(measurement.studyColumns,1,device.id+' study should stack');assert.ok(measurement.buttonRows.length>=2,'buttons must wrap in portrait');}
  else assert.equal(measurement.studyColumns,3,device.id+' studies should be 3 columns');
  const firstLabels=measurement.buttonRows.flatMap(x=>x.labels);
  assert.deepEqual(firstLabels,['QUALITY','STATE','MOVEMENT','ACTION','EXISTENCE']);
  for(const func of ['quality','state','movement','action','existence']){
    await page.locator('#func13Functions [data-function="'+func+'"]').click();
    assert.equal(await page.locator('#func13Functions [data-function="'+func+'"]').getAttribute('aria-pressed'),'true');
    const others=await page.locator('#func13Functions [aria-pressed="true"]').count();assert.equal(others,1,'only one function chosen');
  }
  for(const locale of [{id:'en',speak:'en-US'},{id:'es',speak:'es-ES'},{id:'pt',speak:'pt-BR'}]){
    await page.locator('#func13Functions [data-function="movement"]').click();
    await page.selectOption('#language',locale.id);
    const expected=matrix.cells.find(x=>x.experienceId==='shopping-for-dinner'&&x.functionId==='movement').example[locale.id];
    assert.equal(await page.locator('#func13SpeechText').textContent(),expected);
    assert.equal(await page.locator('#func13SpeechText').getAttribute('lang'),locale.speak);
    assert.equal(await page.locator('#func13Speak').isDisabled(),false,'authored sample and mock voice should be playable');
    await page.locator('#func13SpeechText').click(); // click TEXT, not SVG: whole card must speak
    const calls=await page.evaluate(()=>window.__h1422SpeechCalls.filter(x=>x.action==='speak'));
    assert.deepEqual(calls.at(-1),{action:'speak',text:expected,lang:locale.speak});
  }
  await page.selectOption('#mode','negative');
  assert.equal(await page.locator('#func13Speak').isDisabled(),true,'nonauthored mode must not speak');
  await page.selectOption('#mode','affirmative');
  await page.selectOption('#tense','past');
  assert.equal(await page.locator('#func13Speak').isDisabled(),true,'nonauthored tense must not speak');
  await page.selectOption('#tense','present');
  await page.locator('#func13Functions [data-function="existence"]').click();
  await page.selectOption('#experience','preparing-dinner');
  await page.locator('#func13Functions [data-function="quality"]').click();
  await page.selectOption('#experience','shopping-for-dinner');
  assert.equal(await page.locator('#func13Functions [data-function="existence"]').getAttribute('aria-pressed'),'true','local function memory per experience');
  assert.equal(await page.locator('#periodGap').count(),1);assert.equal(await page.locator('#experiencePeriodGear').count(),0);
  assert.equal(errors.length,0,device.id+' browser exception: '+errors.join('; '));
  await page.screenshot({path:path.join(dir,device.id+'.png'),fullPage:true});
  log.push({device:device.id,viewport:device.width+'x'+device.height,buttonRows:measurement.buttonRows.map(x=>x.labels.join(' / ')),studyColumns:measurement.studyColumns,centerErrorPx:+Math.abs(measurement.cardCenter-measurement.textCenter).toFixed(2),status:'PASS'});
  console.log('PASS '+device.id+': '+JSON.stringify(log.at(-1)));
  await context.close();
 }
 const summary=['# JAGUAR H14.22 — Chromium automated observations','','This is browser automation, not human design or audio quality homologation. Speech is intercepted to check exactly which text and locale would be spoken; no actual voice was auditioned.','', '|View|Button rows|Study columns|Speech-card center error px|Result|','|---|---|---:|---:|---|',...log.map(x=>'|'+x.device+' '+x.viewport+'|'+x.buttonRows.join(' ; ')+'|'+x.studyColumns+'|'+x.centerErrorPx+'|'+x.status+'|'),'','No screenshot or test proves pedagogical assessment correctness. FUNC-13 remains hidden in normal Explorer; PERIOD remains a Gear Stack backlog item.'];
 fs.writeFileSync(path.join(dir,'RESULTS.md'),summary.join('\n'));
 console.log('PASS H14.22: 5 viewports, centered function rows, Type A whole-card speech events in EN/ES/PT, no evaluation');
 }finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1});
