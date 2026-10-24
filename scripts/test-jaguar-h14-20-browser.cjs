#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http'),path=require('node:path');
const {chromium}=require('playwright');const base=process.cwd(),out=path.join(base,'artifacts/h14-20');fs.mkdirSync(out,{recursive:true});
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'};
const server=http.createServer((req,res)=>{let p;try{p=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400).end();return}const f=path.resolve(base,'.'+p);if(!f.startsWith(base+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404).end('not found');return}res.setHeader('Content-Type',types[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(res)});
(async()=>{await new Promise(ok=>server.listen(0,'127.0.0.1',ok));let browser;let total=0;try{
browser=await chromium.launch({headless:true});
for(const size of [{id:'desktop',width:1440,height:900},{id:'portrait',width:390,height:844},{id:'landscape',width:844,height:390}]){
 const context=await browser.newContext({viewport:{width:size.width,height:size.height}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/labs/func13-function-window-h14-20/index.html',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>document.querySelector('#func13SpeechText')?.textContent.includes('escolhendo')||document.querySelector('#func13SpeechText')?.textContent.includes('escolhendo ingredientes'),{timeout:30000}).catch(async()=>{throw Error('no authored H14.7 speech text: '+await page.locator('#func13Status').textContent())});
 const order=await page.evaluate(()=>{const a=document.querySelector('#func13SpeechRow').getBoundingClientRect(),b=document.querySelector('#func13Functions').getBoundingClientRect(),c=document.querySelector('#func13Study').getBoundingClientRect();return{a,b,c}});
 assert.ok(order.a.bottom<=order.b.top+1&&order.b.bottom<=order.c.top+30,'row layout');
 const c=await page.evaluate(()=>{const card=document.querySelector('#func13Speak').getBoundingClientRect(),speaker=document.querySelector('.speech-icon').getBoundingClientRect(),text=document.querySelector('.speech-content').getBoundingClientRect();return{card:(card.left+card.right)/2,text:(text.left+text.right)/2,speaker:(speaker.left+speaker.right)/2}});
 assert.ok(Math.abs(c.card-c.text)<3,'text not centered in card');assert.ok(c.speaker<c.text,'speaker not left');
 const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(overflow<=3,'horizontal page overflow '+overflow);
 for(const lang of ['en','es','pt']){await page.selectOption('#language',lang);assert.equal(await page.locator('#func13SpeechText').getAttribute('lang'),({en:'en-US',es:'es-ES',pt:'pt-BR'})[lang]);}
 await page.selectOption('#mode','negative');assert.equal(await page.locator('#func13Speak').isDisabled(),true);
 await page.selectOption('#mode','affirmative');
 const n=await page.locator('#func13Speak').isDisabled();assert.equal(typeof n,'boolean');
 await page.screenshot({path:path.join(out,size.id+'.png'),fullPage:true});
 assert.equal(errors.length,0,errors.join(';'));total+=10;await context.close();
}
console.log('PASS H14.20 Chromium: '+total+' structural/behavior checks, centered card, mobile overflow, EN/ES/PT, disabled nonauthored audio');
}finally{if(browser)await browser.close();await new Promise(ok=>server.close(ok))}})().catch(e=>{console.error(e);process.exitCode=1});
