'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync('js/gear360-why-pedagogical-bridge.js','utf8');
const corpus=Object.fromEntries(['shopping','preparing','having','after-dinner'].flatMap(exp=>['en','es','pt'].map(lang=>{const key=exp+'-why-'+lang;return [key,JSON.parse(fs.readFileSync(path.join('data/learning/dependencies',key+'.json'),'utf8'))]})));
function element(tag){return {tag,children:[],hidden:false,textContent:'',attributes:{},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},setAttribute(k,v){this.attributes[k]=v}}}
const view=element('section'),ids={experienceView:view};
const document={createElement:element,getElementById(id){return ids[id]||null}};
const pending=[];
const context={document,fetch(url){return new Promise(resolve=>pending.push({url,resolve}))}};context.globalThis=context;
vm.runInNewContext(source,context,{filename:'gear360-why-pedagogical-bridge.js'});
const bridge=context.SIYAYOGear360WhyPedagogicalBridge;
assert.equal(typeof bridge.render,'function');
const idsBySlug={shopping:'shopping',preparing:'preparing',having:'having-dinner','after-dinner':'after-dinner-conversation'};
async function flush(){for(let n=0;n<6;n++)await Promise.resolve()}
(async()=>{
for(const [slug,id] of Object.entries(idsBySlug))for(const language of ['en','es','pt']){
 bridge.render({document,experience:{id},language,questionWord:'why'});
 assert.equal(pending.length,1,'Every WHY selection must fetch exactly one corpus');
 const item=pending.shift(),name=slug+'-why-'+language;
 assert.ok(item.url.endsWith(name+'.json'),item.url);
 item.resolve({ok:true,json:()=>Promise.resolve(corpus[name])});await flush();
 const host=ids.gear360WhyStudy||view.children.find(e=>e.id==='gear360WhyStudy');
 assert.ok(host,'Pedagogical host must exist');
 assert.equal(host.hidden,false);
 assert.ok(host.children.some(e=>e.textContent===corpus[name].sentence),'Rendered contextual sentence '+name);
 bridge.render({document,experience:{id},language,questionWord:'what'});
 assert.equal(host.hidden,true,'Switching to WHAT hides WHY');
}
console.log('PASS dynamic: S1-S4 x EN/ES/PT render independent of NICK, QW switch hides WHY');
})().catch(err=>{console.error(err);process.exitCode=1});
