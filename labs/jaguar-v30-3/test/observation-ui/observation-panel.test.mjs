import test from 'node:test';
import assert from 'node:assert/strict';
import {validateObservationSnapshot85E,createObservationPanel85E} from './observation-panel.mjs';
import {observationPreview85D} from '../storage-contract/restore-observer.mjs';

class MockNode{
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this._text='';this.dataset={};}
 set textContent(t){this._text=String(t);this.children=[];}
 get textContent(){return this._text+this.children.map(n=>n.textContent).join('');}
 append(...children){this.children.push(...children);}
 replaceChildren(...nodes){this._text='';this.children=[...nodes];}
 get innerHTML(){throw Error('UNSAFE INNER HTML');}
 set innerHTML(_x){throw Error('UNSAFE INNER HTML');}
}
const document={createElement:tag=>new MockNode(tag)};
const fresh=()=>observationPreview85D([]);
const observed=()=>observationPreview85D([{ok:true,kind:'OBSERVATIONS_ONLY',skillId:'which.use.determiner',
  questionWord:'WHICH',language:'en',originExperienceId:'shopping-for-dinner',
  events:[{questionWord:'WHICH',language:'en',originExperienceId:'shopping-for-dinner',
    purpose:'assessment',status:'pending'}]}]);
const tamper=(snapshot,patch,i=0)=>({...snapshot,cells:snapshot.cells.map((c,j)=>j===i?{...c,...patch}:c)});
const panel=(provider=async()=>fresh())=>{
 const element=new MockNode();return {element,ui:createObservationPanel85E({document,element,loadSnapshot:provider})};
};
const deferred=()=>{let resolve;return {promise:new Promise(r=>resolve=r),resolve:(x)=>resolve(x)};};
test('validate exact observation-only 4 QWs by 3 languages',()=>{
 const v=fresh();assert.equal(validateObservationSnapshot85E(v),true);
 assert.equal(new Set(v.cells.map(c=>c.questionWord+'/'+c.language)).size,12);
});
test('render three-language twelve-cell grid but no accepted progress',async()=>{
 const {ui,element}=panel(async()=>observed());
 assert.equal(await ui.refresh({viewKey:'view-a',displayLanguage:'pt'}),true);
 assert.equal(element.dataset.state,'observations-only');
 assert.match(element.textContent,/REGISTROS OBSERVADOS/);
 assert.match(element.textContent,/WHICH|QUAL/);
 assert.match(element.textContent,/ENESPT/);
 assert.match(element.textContent,/◐ 0 exploratórias · 1 pendentes/);
 assert.doesNotMatch(element.textContent,/1\/3|2\/3|3\/3|GREEN PASS|CONFIRMADO/);
});
test('visual headings available in EN ES PT',async()=>{
 const {ui,element}=panel();
 for(const l of ['en','es','pt']){
  assert.equal(await ui.refresh({viewKey:'viewer',displayLanguage:l}),true);
  assert.match(element.textContent,new RegExp(l==='en'?'OBSERVED RECORDS':l==='es'?'REGISTROS OBSERVADOS':'REGISTROS OBSERVADOS'));
 }
});
test('missing viewer key fails closed without requesting data',async()=>{
 let called=0;const {ui,element}=panel(async()=>{called++;return observed();});
 assert.equal(await ui.refresh({}),false);assert.equal(called,0);
 assert.equal(element.dataset.state,'empty');
});
test('loader failure yields unavailable not previous learner history',async()=>{
 let fail=false;const {ui,element}=panel(async()=>{if(fail)throw Error('offline');return observed();});
 await ui.refresh({viewKey:'a'});assert.match(element.textContent,/◐/);
 fail=true;assert.equal(await ui.refresh({viewKey:'b'}),false);
 assert.equal(element.dataset.state,'unavailable');assert.doesNotMatch(element.textContent,/◐/);
});
test('identity switch drops late response from previous learner',async()=>{
 const wait=deferred();const {ui,element}=panel(key=>key==='a'?wait.promise:Promise.resolve(fresh()));
 const pending=ui.refresh({viewKey:'a'}),latest=ui.refresh({viewKey:'b'});
 assert.equal(await latest,true);wait.resolve(observed());
 assert.equal(await pending,false);assert.doesNotMatch(element.textContent,/◐/);
});
test('clear invalidates a request in flight',async()=>{
 const wait=deferred();const {ui,element}=panel(()=>wait.promise);
 const pending=ui.refresh({viewKey:'a'});assert.equal(ui.clear(),true);
 wait.resolve(observed());assert.equal(await pending,false);
 assert.equal(element.dataset.state,'empty');assert.equal(element.children.length,0);
});
test('QW navigation consumes only latest snapshot',async()=>{
 const wait=deferred();const {ui,element}=panel(k=>k==='which'?wait.promise:Promise.resolve(observed()));
 const old=ui.refresh({viewKey:'which'}),current=ui.refresh({viewKey:'what',displayLanguage:'es'});
 assert.equal(await current,true);wait.resolve(fresh());assert.equal(await old,false);
 assert.match(element.textContent,/◐ 0 exploratorias · 1 pendientes/);
});
test('reject extra top-level subject or injected progress claims',()=>{
 const good=fresh();
 for(const extra of [{subject:'opaque-a'},{score:4},{greenPass:true},{nick:'A'}])
  assert.equal(validateObservationSnapshot85E({...good,...extra}),false);
});
test('reject cell privilege claims and unexpected keys',()=>{
 const good=fresh();
 for(const delta of [{acceptedProgress:3},{confirmed:true},{greenPass:true},{credit:9},
  {subject:'other'},{status:'confirmed'}])assert.equal(validateObservationSnapshot85E(tamper(good,delta)),false);
});
test('reject forged marker or invalid count',()=>{
 const good=fresh();
 for(const delta of [{observationMarker:'★'},{pendingOccurrences:-1},
  {exploratoryObservations:101},{pendingOccurrences:1},{exploratoryObservations:1.5}])
  assert.equal(validateObservationSnapshot85E(tamper(good,delta)),false);
});
test('reject duplicate, missing, foreign-QW or foreign-language cells',()=>{
 const good=fresh();assert.equal(validateObservationSnapshot85E({...good,cells:good.cells.slice(1)}),false);
 assert.equal(validateObservationSnapshot85E({...good,cells:[...good.cells.slice(0,11),good.cells[0]]}),false);
 assert.equal(validateObservationSnapshot85E(tamper(good,{questionWord:'HOW'})),false);
 assert.equal(validateObservationSnapshot85E(tamper(good,{language:'fr'})),false);
});
test('malformed or untrusted snapshot displays no partial data',async()=>{
 const good=observed();const {ui,element}=panel(async()=>({...good,subject:'secret'}));
 assert.equal(await ui.refresh({viewKey:'viewer'}),false);
 assert.equal(element.dataset.state,'unavailable');assert.doesNotMatch(element.textContent,/opaque|◐/);
});
test('render does not use innerHTML or insert raw event/identity payload',async()=>{
 const {ui,element}=panel(async()=>observed());
 await ui.refresh({viewKey:'a'});assert.equal(element.children.length,2);
 const out=element.textContent;assert.doesNotMatch(out,/choice-select|eventId|opaque-a|<script|ALUNO/);
});
test('only read-only methods are exposed; no canonical scoring or storage',()=>{
 const {ui}=panel();assert.deepEqual(Object.keys(ui).sort(),['clear','getState','refresh']);
 assert.equal(Object.hasOwn(ui,'submit'),false);assert.equal(Object.hasOwn(ui,'getRetainedProgress'),false);
 assert.equal(Object.hasOwn(ui,'getRetainedEvidence'),false);assert.equal(Object.hasOwn(ui,'greenPass'),false);
});
test('repeated refresh replaces UI instead of duplicating rows',async()=>{
 const {ui,element}=panel(async()=>fresh());
 await ui.refresh({viewKey:'a'});const before=element.textContent;
 await ui.refresh({viewKey:'a'});assert.equal(element.textContent,before);
 assert.equal(element.children.length,2);
});
test('invalid dependencies fail closed',()=>{
 assert.throws(()=>createObservationPanel85E({document,element:new MockNode()}),TypeError);
});
