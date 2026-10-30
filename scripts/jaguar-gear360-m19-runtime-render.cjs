'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync('js/gear360-why-pedagogical-bridge.js','utf8');
const corpus=Object.fromEntries(['shopping','preparing','having','after-dinner'].flatMap(exp=>['en','es','pt'].map(lang=>{const key=exp+'-why-'+lang;return [key,JSON.parse(fs.readFileSync(path.join('data/learning/dependencies',key+'.json'),'utf8'))]})));
function element(tag){return {tag,children:[],hidden:false,textContent:'',attributes:{},appendChild(v){this.children.push(v)},replaceChildren(){this.children=[]},setAttribute(k,v){this.attributes[k]=v}}}
const view=element('section'),ids={experienceView:view};
// Mirror DOM getElementById: dynamically appended nodes must remain discoverable.
const document={createElement:element,getElementById(id){return ids[id]||view.children.find(el=>el.id===id)||null}};
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
// Simulate out-of-order network replies on fast Experience and language switches.
bridge.render({document,experience:{id:'shopping'},language:'en',questionWord:'why'});
bridge.render({document,experience:{id:'preparing'},language:'pt',questionWord:'why'});
assert.equal(pending.length,2);
const first=pending.shift(),second=pending.shift();
second.resolve({ok:true,json:()=>Promise.resolve(corpus['preparing-why-pt'])});await flush();
first.resolve({ok:true,json:()=>Promise.resolve(corpus['shopping-why-en'])});await flush();
const finalHost=document.getElementById('gear360WhyStudy');
assert.ok(finalHost.children.some(e=>e.textContent===corpus['preparing-why-pt'].sentence));
assert.ok(!finalHost.children.some(e=>e.textContent===corpus['shopping-why-en'].sentence));
bridge.render({document,experience:{id:'having-dinner'},language:'es',questionWord:'why'});
const stale=pending.shift();bridge.render({document,experience:{id:'having-dinner'},language:'es',questionWord:'what'});
stale.resolve({ok:true,json:()=>Promise.resolve(corpus['having-why-es'])});await flush();
assert.equal(finalHost.hidden,true);
assert.equal(finalHost.children.length,0);
assert.equal(view.children.filter(e=>e.id==='gear360WhyStudy').length,1,'Single stable study host');
console.log('PASS dynamic: S1-S4 x EN/ES/PT render independent of NICK, QW switch hides WHY');
})().catch(err=>{console.error(err);process.exitCode=1});
