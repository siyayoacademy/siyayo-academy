#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=process.cwd(),dir=path.join(root,'artifacts/h14-16');fs.mkdirSync(dir,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}
 const target=path.resolve(root,'.'+pathname);
 if(!(target===root||target.startsWith(root+path.sep))||!fs.existsSync(target)||!fs.statSync(target).isFile()){res.writeHead(404).end('not found');return}
 res.setHeader('Content-Type',types[path.extname(target)]||'application/octet-stream');fs.createReadStream(target).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port+'/verb-explorer.html?mode=experience';
 const browser=await chromium.launch({headless:true});
 let checks=0;const problems=[];
 try{
  for(const device of [{id:'desktop',width:1440,height:900},{id:'portrait',width:390,height:844},{id:'landscape',width:844,height:390}]){
   const context=await browser.newContext({viewport:{width:device.width,height:device.height}});
   const page=await context.newPage();
   page.on('pageerror',err=>problems.push(device.id+': '+err.message));
   await page.goto(base+'&h14_14=preview',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#h14SpecializedPreview')?.hidden===false,{timeout:30000});
   await page.waitForFunction(()=>document.querySelector('#h14PreviewFunctionText')?.textContent?.length>0,{timeout:30000});
   assert.equal(await page.locator('#h14SpecializedPreview').isVisible(),true);checks++;
   assert.equal(await page.locator('#learningTrailWordPathModule').count(),1);checks++;
   assert.equal(await page.locator('#livingLines').count(),1);checks++;
   const width=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(width<=3,device.id+' horizontal overflow '+width);checks++;
   for(const [language,label] of [['en','English'],['es','Español'],['pt','Português']]){
    await page.locator('[data-experience-language="'+language+'"]').click();
    await page.waitForFunction(l=>document.querySelector('#h14PreviewContext')?.textContent?.includes(' · '+l.toUpperCase()+' ·'),language);
    assert.ok((await page.locator('#h14PreviewContext').textContent()).includes(language.toUpperCase()));checks++;
   }
   await page.locator('[data-h14-function="existence"]').click();
   assert.equal(await page.locator('[data-h14-function="existence"]').getAttribute('aria-pressed'),'true');checks++;
   await page.locator('[data-perspective="narrating"]').click();
   await page.waitForFunction(()=>document.querySelector('#h14PreviewPerspectiveCard')?.dataset.perspectiveColor==='yellow');
   assert.equal(await page.locator('#h14PreviewPerspectiveCard').getAttribute('data-perspective-color'),'yellow');checks++;
   await page.locator('[data-experience-form="negative"]').click();
   await page.waitForFunction(()=>document.querySelector('#h14PreviewFunctionText')?.textContent?.includes('Not authored'));
   checks++;
   await page.screenshot({path:path.join(dir,device.id+'.png'),fullPage:true});
   await context.close();
  }
  const normal=await browser.newPage();
  await normal.goto(base,{waitUntil:'domcontentloaded'});
  assert.equal(await normal.locator('#h14SpecializedPreview').isVisible(),false);checks++;
  await normal.close();
  assert.equal(problems.length,0,'Browser errors: '+problems.join('; '));checks++;
  console.log('PASS H14.16 '+checks+' Chromium browser assertions, desktop/portrait/landscape, EN/ES/PT, Perspective, Mode, default-OFF, artifacts');
 }finally{await browser.close();await new Promise(r=>server.close(r))}
})().catch(err=>{console.error(err);process.exitCode=1});
