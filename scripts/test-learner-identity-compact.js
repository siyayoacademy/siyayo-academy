#!/usr/bin/env node
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync('js/verb-explorer-learner-identity-surface.js','utf8');
function build(language){
 const nodes={},listeners={};let identity=null,session={progress:2},calls=0,renders=0,signals=0;
 for(const id of ['learnerIdentityPanel','learnerIdentityInput','learnerIdentityConfirm','learnerIdentityStatus','learnerIdentityEditor','learnerIdentityCompact','learnerIdentityName','learnerIdentityChange','learnerIdentityCancel','dependencyFocusSurface','dependencyHeadProbePanel']){
  nodes[id]={dataset:{},value:'',hidden:false,textContent:'',disabled:false,focus(){},querySelector(){return null;},addEventListener(type,fn){listeners[id+':'+type]=fn;}};
 }
 let order=['learnerIdentityPanel','dependencyFocusSurface','dependencyHeadProbePanel'];
 const parent={insertBefore(node,before){order=order.filter(x=>nodes[x]!==node);let at=before?order.indexOf(Object.keys(nodes).find(x=>nodes[x]===before)):-1;order.splice(at<0?order.length:at,0,Object.keys(nodes).find(x=>nodes[x]===node));}};
 for(const id of order){nodes[id].parentNode=parent;Object.defineProperty(nodes[id],'nextSibling',{get(){return nodes[order[order.indexOf(id)+1]]||null;}});Object.defineProperty(nodes[id],'nextElementSibling',{get(){return this.nextSibling;}});}
 const sandbox={Object,Promise,document:{getElementById(id){return nodes[id]||null;}},
 SIYAYOVerbExplorerLearnerIdentitySource:{getId(){return identity;}},
 SIYAYOVerbExplorerLearnerIdentityProvider:{provide(id){calls++;identity=id;session={progress:0};return true;}},
 SIYAYOVerbExplorerAdaptiveReadinessTrigger:{signal(){signals++;return false;}},
 SIYAYOVerbExplorerExperienceRuntime:{activeLanguage(){return language;},render(){renders++;}}};
 sandbox.globalThis=sandbox;vm.runInNewContext(code,sandbox);sandbox.SIYAYOVerbExplorerLearnerIdentitySurface.install();
 return {nodes,order:()=>order,click(id){listeners[id+':click']();},tick:async()=>{for(let i=0;i<5;i++)await Promise.resolve();},api:sandbox.SIYAYOVerbExplorerLearnerIdentitySurface,identity:()=>identity,session:()=>session,calls:()=>calls,renders:()=>renders,signals:()=>signals};
}
(async()=>{
 for(const lang of ['en','es','pt']){
  const t=build(lang),n=t.nodes;
  assert.equal(n.learnerIdentityEditor.hidden,false);assert.equal(n.learnerIdentityCompact.hidden,true);
  n.learnerIdentityInput.value='Aldo';t.click('learnerIdentityConfirm');await t.tick();
  assert.equal(n.learnerIdentityEditor.hidden,true);assert.equal(n.learnerIdentityName.textContent,'Aldo');
  assert.deepEqual(t.order(),['dependencyFocusSurface','learnerIdentityPanel','dependencyHeadProbePanel']);
  const session=t.session(),calls=t.calls(),signals=t.signals(),renders=t.renders();
  t.click('learnerIdentityChange');n.learnerIdentityInput.value='Another';t.click('learnerIdentityCancel');
  assert.equal(t.identity(),'Aldo');assert.equal(t.session(),session);assert.equal(t.calls(),calls);assert.equal(t.renders(),renders);assert.equal(t.signals(),signals);
  t.click('learnerIdentityChange');n.learnerIdentityInput.value=' ';t.click('learnerIdentityConfirm');await t.tick();
  assert.equal(t.identity(),'Aldo');assert.equal(t.session(),session);assert.equal(n.learnerIdentityEditor.hidden,false);
  n.learnerIdentityInput.value='Aldo';t.click('learnerIdentityConfirm');await t.tick();assert.equal(t.calls(),calls);assert.equal(n.learnerIdentityEditor.hidden,true);
  t.click('learnerIdentityChange');n.learnerIdentityInput.value='<Nick & two>';t.click('learnerIdentityConfirm');await t.tick();
  assert.equal(t.identity(),'<Nick & two>');assert.notEqual(t.session(),session);assert.equal(n.learnerIdentityName.textContent,'<Nick & two>');assert.equal(t.calls(),calls+1);
  const labels={en:'Change learner',es:'Cambiar estudiante',pt:'Trocar aluno'};
  assert.equal(n.learnerIdentityChange.textContent,labels[lang]);
  t.api.refresh();assert.equal(t.calls(),calls+1);
 }
 console.log('PASS: compact EN/ES/PT identity, anchor order, cancel/blank/same nick preserve Session, explicit replacement only, safe text display.');
})().catch(e=>{console.error(e);process.exit(1);});
