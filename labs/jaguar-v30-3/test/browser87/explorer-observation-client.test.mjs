// V30.3.87C — browser transport, logout, QW/language/identity race tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createExplorerObservationClient87C} from './explorer-observation-client.mjs';
import {observationPreview85D} from '../storage-contract/restore-observer.mjs';
class Element{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this._text='';this.children=[];this.dataset={};}
 set textContent(x){this._text=String(x);this.children=[];}
 get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this._text='';this.children=[...nodes];}
 set innerHTML(_){throw Error('unsafe html');}
}
const doc={createElement:tag=>new Element(tag)};
const ctx=(patch={})=>({viewerKey:'view-a',questionWord:'WHICH',language:'en',experienceId:'shopping-for-dinner',...patch});
const preview=()=>observationPreview85D([{
 ok:true,kind:'OBSERVATIONS_ONLY',questionWord:'WHICH',skillId:'which.use.determiner',
 language:'en',originExperienceId:'shopping-for-dinner',
 events:[{questionWord:'WHICH',language:'en',originExperienceId:'shopping-for-dinner',
  purpose:'assessment',status:'pending'}]
}]);
const json=(body=preview(),status=200,contentType='application/json')=>new Response(
 JSON.stringify(body),{status,headers:{'content-type':contentType,'cache-control':'no-store'}}
);
const setup=(transport=async()=>json())=>{
 const element=new Element();
 const client=createExplorerObservationClient87C({document:doc,element,fetchSameOrigin:transport});
 return {client,element};
};
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};

test('context selects what to show but never claims authenticated login',()=>{
 const {client}=setup();assert.equal(client.selectContext(ctx()),true);
 assert.equal(client.state().outcome,'ready');assert.equal(client.state().questionWord,'WHICH');
 assert.equal(client.state().active,true);
});
test('real read uses same-origin GET, no JWT, nickname, query, token or body',async()=>{
 let captured;
 const {client}=setup(async(url,opts)=>{captured={url,opts};return json();});
 client.selectContext(ctx());assert.equal(await client.refresh(),true);
 assert.equal(captured.url,'/__lab/v30/observations');
 assert.equal(captured.opts.method,'GET');
 assert.equal(captured.opts.credentials,'same-origin');
 assert.equal(captured.opts.mode,'same-origin');
 assert.equal(captured.opts.cache,'no-store');
 assert.equal(captured.opts.redirect,'error');
 assert.equal(captured.opts.referrerPolicy,'no-referrer');
 assert.deepEqual(Object.keys(captured.opts.headers),['Accept']);
 assert.equal(JSON.stringify(captured.opts).includes('view-a'),false);
 assert.equal(JSON.stringify(captured.opts).includes('Cf-Access-Jwt'),false);
});
test('authenticated response shows observation panel but not 1/3 or Green Pass',async()=>{
 const {client,element}=setup();client.selectContext(ctx({language:'pt'}));
 assert.equal(await client.refresh(),true);
 assert.equal(client.state().outcome,'shown');
 assert.match(element.textContent,/REGISTROS OBSERVADOS/);
 assert.match(element.textContent,/◐ 0 exploratórias · 1 pendentes/);
 assert.doesNotMatch(element.textContent,/1\/3|2\/3|3\/3|Green Pass awarded/);
});
test('switching language localizes view without changing canonical scores',async()=>{
 const {client,element}=setup();
 for(const l of ['en','es','pt']){
  client.selectContext(ctx({language:l}));assert.equal(await client.refresh(),true);
  assert.equal(client.state().language,l);
  assert.doesNotMatch(element.textContent,/2\/3|3\/3/);
 }
});
test('changing Question Word or Experience clears previous view immediately',async()=>{
 const {client,element}=setup();client.selectContext(ctx());await client.refresh();
 assert.match(element.textContent,/◐/);
 client.selectContext(ctx({questionWord:'WHAT',experienceId:'preparing-dinner'}));
 assert.equal(element.children.length,0);
 assert.equal(client.state().questionWord,'WHAT');
});
test('change of NICK-view key clears the prior learner observation view',async()=>{
 const {client,element}=setup();client.selectContext(ctx());await client.refresh();
 client.selectContext(ctx({viewerKey:'view-b'}));
 assert.equal(element.children.length,0);
 assert.equal(client.state().outcome,'ready');
});
test('logout clears history and disallows refresh until another selection',async()=>{
 const {client,element}=setup();client.selectContext(ctx());await client.refresh();
 assert.equal(client.logout(),true);assert.equal(client.state().outcome,'signed_out');
 assert.equal(element.children.length,0);assert.equal(client.state().active,false);
 assert.equal(await client.refresh(),false);
});
test('an old request cannot overwrite a newer learner after switch',async()=>{
 const old=deferred();const {client,element}=setup((_u,opts)=>opts.signal.aborted?json():old.promise);
 client.selectContext(ctx());const pending=client.refresh();
 client.selectContext(ctx({viewerKey:'view-b'}));old.resolve(json());
 assert.equal(await pending,false);assert.equal(element.children.length,0);
});
test('new user success stays visible after old user response',async()=>{
 const first=deferred();let count=0;
 const {client,element}=setup(()=>++count===1?first.promise:Promise.resolve(json()));
 client.selectContext(ctx());const pending=client.refresh();
 client.selectContext(ctx({viewerKey:'view-b',language:'pt'}));
 const newer=client.refresh();assert.equal(await newer,true);
 first.resolve(json());assert.equal(await pending,false);
 assert.match(element.textContent,/REGISTROS OBSERVADOS/);
 assert.equal(client.state().language,'pt');
});
test('logout while read is pending prevents late restoration',async()=>{
 const delayed=deferred(),{client,element}=setup(()=>delayed.promise);
 client.selectContext(ctx());const pending=client.refresh();client.logout();
 delayed.resolve(json());assert.equal(await pending,false);
 assert.equal(element.children.length,0);assert.equal(client.state().active,false);
});
test('repeat refresh cancels prior response and only latest renders',async()=>{
 const first=deferred();let count=0;
 const {client,element}=setup(()=>++count===1?first.promise:Promise.resolve(json()));
 client.selectContext(ctx());const a=client.refresh(),b=client.refresh();
 assert.equal(await b,true);first.resolve(json());
 assert.equal(await a,false);assert.equal(client.state().outcome,'shown');
 assert.match(element.textContent,/◐/);
});
test('401 invalidates current viewer and leaves no content',async()=>{
 const {client,element}=setup(async()=>json({error:'unauthenticated'},401));
 client.selectContext(ctx());assert.equal(await client.refresh(),false);
 assert.equal(client.state().active,false);
 assert.equal(element.children.length,0);
 assert.equal(client.state().outcome,'authentication_required');
});
test('403 returns forbidden without exposing previous learner history',async()=>{
 let status=200;const {client,element}=setup(async()=>status===200?json():json({error:'forbidden'},status));
 client.selectContext(ctx());await client.refresh();status=403;
 assert.equal(await client.refresh(),false);assert.equal(client.state().outcome,'forbidden');
 assert.doesNotMatch(element.textContent,/◐/);
});
test('404 not-found does not invent an empty validated canonical history',async()=>{
 const {client,element}=setup(async()=>json({error:'not_found'},404));
 client.selectContext(ctx());assert.equal(await client.refresh(),false);
 assert.equal(client.state().outcome,'not_found');
 assert.equal(element.dataset.state,'unavailable');
});
test('503 and unexpected server HTTP errors fail closed',async()=>{
 for(const status of [500,503,405,302]){
  const {client,element}=setup(async()=>new Response(null,{status}));
  client.selectContext(ctx());assert.equal(await client.refresh(),false);
  assert.equal(client.state().outcome,'unavailable');
  assert.equal(element.dataset.state,'unavailable');
 }
});
test('Access login HTML cannot be accepted as JSON evidence',async()=>{
 const {client,element}=setup(async()=>new Response('<html>login</html>',{status:200,headers:{'content-type':'text/html'}}));
 client.selectContext(ctx());assert.equal(await client.refresh(),false);
 assert.equal(element.dataset.state,'unavailable');
});
test('malformed JSON and unexpected privilege fields fail closed',async()=>{
 const malformed=async()=>new Response('{bad',{status:200,headers:{'content-type':'application/json'}});
 const forged=async()=>json({...preview(),greenPass:true});
 for(const f of [malformed,forged]){
  const {client,element}=setup(f);client.selectContext(ctx());
  assert.equal(await client.refresh(),false);assert.equal(element.dataset.state,'unavailable');
 }
});
test('excessive JSON size rejected before being interpreted',async()=>{
 const huge=async()=>new Response(' '.repeat(8200),{status:200,headers:{'content-type':'application/json'}});
 const {client}=setup(huge);client.selectContext(ctx());assert.equal(await client.refresh(),false);
});
test('transport rejection fails closed with no partial observations',async()=>{
 const {client,element}=setup(async()=>{throw Error('network_error')});
 client.selectContext(ctx());assert.equal(await client.refresh(),false);
 assert.equal(element.dataset.state,'unavailable');
});
test('invalid selection clears previous history and requests are not made',async()=>{
 let calls=0;const {client,element}=setup(async()=>{calls++;return json()});
 client.selectContext(ctx());await client.refresh();
 const samples=[
  ctx({questionWord:'HOW'}),ctx({language:'fr'}),
  ctx({experienceId:'../admin'}),ctx({viewerKey:''}),
  {...ctx(),greenPass:true},{...ctx(),subject:'opaque-other'}
 ];
 for(const bad of samples){
  assert.equal(client.selectContext(bad),false);
  assert.equal(client.state().active,false);assert.equal(element.children.length,0);
 }
 assert.equal(calls,1);
});
test('public client API has no submit, auth-header getter, or progress writer',()=>{
 const {client}=setup();
 assert.deepEqual(Object.keys(client).sort(),['logout','refresh','selectContext','state']);
 assert.equal(Object.hasOwn(client,'getRetainedEvidence'),false);
 assert.equal(Object.hasOwn(client,'getRetainedProgress'),false);
});
test('state never exposes viewer key, cookie, subject or JWT',()=>{
 const {client}=setup();client.selectContext(ctx({viewerKey:'private-view-id'}));
 const printed=JSON.stringify(client.state());
 assert.equal(printed.includes('private-view-id'),false);
 assert.equal(printed.includes('subject'),false);
 assert.equal(printed.includes('jwt'),false);
});
test('constructor requires an explicit same-origin fetch dependency',()=>{
 assert.throws(()=>createExplorerObservationClient87C({document:doc,element:new Element()}),TypeError);
});
