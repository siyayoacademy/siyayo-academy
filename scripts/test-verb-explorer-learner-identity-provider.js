#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/verb-explorer-learner-identity-provider.js','utf8');

function build(options={}){
  let adoptCalls=0;
  const adopted=[];
  const sandbox=vm.createContext({Object});
  sandbox.globalThis=sandbox;

  if(options.withSource!==false){
    sandbox.SIYAYOVerbExplorerLearnerIdentitySource=Object.freeze({
      adopt(id){
        adoptCalls+=1;
        adopted.push(id);
        return options.adoptResult===false?false:true;
      }
    });
  }

  vm.runInContext(code,sandbox,{filename:'js/verb-explorer-learner-identity-provider.js'});
  return {sandbox,adopted,getAdoptCalls:()=>adoptCalls};
}

{
  const t=build();
  const provider=t.sandbox.SIYAYOVerbExplorerLearnerIdentityProvider;
  assert.equal(provider.provide('learner-01'),true);
  assert.deepEqual(t.adopted,['learner-01']);
  assert.equal(t.getAdoptCalls(),1);
}

for(const value of [null,undefined,'','   ',42,{},[]]){
  const t=build();
  assert.equal(t.sandbox.SIYAYOVerbExplorerLearnerIdentityProvider.provide(value),false,'invalid identity must WAIT');
  assert.equal(t.getAdoptCalls(),0,'invalid identity must never reach Identity Source');
}

{
  const t=build({withSource:false});
  assert.equal(t.sandbox.SIYAYOVerbExplorerLearnerIdentityProvider.provide('learner-01'),false,'missing Identity Source must WAIT');
}

{
  const t=build({adoptResult:false});
  assert.equal(t.sandbox.SIYAYOVerbExplorerLearnerIdentityProvider.provide('learner-01'),false,'Identity Source rejection must remain WAIT');
  assert.equal(t.getAdoptCalls(),1);
}

{
  const t=build();
  assert.equal(t.sandbox.SIYAYOVerbExplorerLearnerIdentityProvider.provide('  learner-02  '),true);
  assert.deepEqual(t.adopted,['  learner-02  '],'provider must not rewrite identity; canonical Source owns normalization');
}

console.log('Learner Identity Provider: PASS — explicit identity is forwarded only to canonical Source; missing, invalid, or rejected authority remains WAIT.');
