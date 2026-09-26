#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/verb-explorer-learner-identity-surface.js','utf8');

function build(){
  const listeners={};
  const panel={dataset:{},__siyayoLearnerIdentityInstalled:false};
  const input={value:'',disabled:false,addEventListener(type,fn){listeners['input:'+type]=fn;}};
  const confirm={disabled:false,addEventListener(type,fn){listeners['confirm:'+type]=fn;}};
  const status={textContent:''};
  const doc={getElementById(id){
    return {learnerIdentityPanel:panel,learnerIdentityInput:input,learnerIdentityConfirm:confirm,learnerIdentityStatus:status}[id]||null;
  }};
  let current=null;
  const provided=[];
  let readinessCalls=0;
  const sandbox=vm.createContext({
    Object,Promise,
    document:doc,
    SIYAYOVerbExplorerLearnerIdentitySource:{getId(){return current;}},
    SIYAYOVerbExplorerLearnerIdentityProvider:{provide(id){provided.push(id);current=id;return true;}},
    SIYAYOVerbExplorerAdaptiveReadinessTrigger:{signal(){readinessCalls+=1;return Promise.resolve(false);}}
  });
  sandbox.globalThis=sandbox;
  vm.runInContext(code,sandbox,{filename:'js/verb-explorer-learner-identity-surface.js'});
  return {api:sandbox.SIYAYOVerbExplorerLearnerIdentitySurface,panel,input,confirm,status,listeners,provided,getReadiness:()=>readinessCalls,getCurrent:()=>current};
}

(async()=>{
  const t=build();
  assert.equal(t.api.install(),true);
  assert.equal(t.panel.dataset.identityState,'waiting');
  assert.equal(t.input.disabled,false);
  assert.equal(t.confirm.disabled,false);

  t.input.value='   ';
  t.listeners['confirm:click']();
  await Promise.resolve();
  assert.equal(t.provided.length,0,'blank identity must never reach provider');

  t.input.value='Aldo';
  t.listeners['confirm:click']();
  await Promise.resolve();
  await Promise.resolve();
  assert.deepEqual(t.provided,['Aldo'],'explicit human-entered identity must be forwarded exactly once');
  assert.equal(t.getCurrent(),'Aldo');
  assert.equal(t.getReadiness(),1,'identity confirmation may re-enter readiness once');
  assert.equal(t.panel.dataset.identityState,'ready');
  assert.equal(t.input.disabled,true);
  assert.equal(t.confirm.disabled,true);
  assert.match(t.status.textContent,/LEARNER READY · Aldo/);

  t.input.value='Another';
  t.listeners['confirm:click']();
  await Promise.resolve();
  assert.deepEqual(t.provided,['Aldo'],'resolved identity must not be silently replaced');

  console.log('Verb Explorer learner identity surface: PASS — only explicit human-entered identity reaches the canonical provider, no identity is invented or persisted, and readiness is re-signaled once after acceptance.');
})().catch(error=>{console.error(error);process.exit(1);});
