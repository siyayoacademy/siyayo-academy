const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const code=fs.readFileSync('js/learner-identity-provider-bridge.js','utf8');
function boot(extra={}){
  const context={console,...extra};
  context.globalThis=context;
  vm.runInNewContext(code,context);
  return context;
}

{
  let calls=[];
  const ctx=boot({
    SIYAYOLearnerIdentityAuthority:{getLearnerId:()=>null},
    SIYAYOVerbExplorerLearnerIdentityProvider:{provide:id=>{calls.push(id);return true;}}
  });
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),false);
  assert.deepStrictEqual(calls,[]);
}

{
  let calls=[];
  const ctx=boot({
    SIYAYOLearnerIdentityAuthority:{getLearnerId:()=> 'learner-01'},
    SIYAYOVerbExplorerLearnerIdentityProvider:{provide:id=>{calls.push(id);return true;}}
  });
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),true);
  assert.deepStrictEqual(calls,['learner-01']);
}

{
  let calls=[];
  const ctx=boot({
    SIYAYOLearnerIdentityAuthority:{getLearnerId:()=> '   '},
    SIYAYOVerbExplorerLearnerIdentityProvider:{provide:id=>{calls.push(id);return true;}}
  });
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),false);
  assert.deepStrictEqual(calls,[]);
}

{
  const ctx=boot({SIYAYOLearnerIdentityAuthority:{getLearnerId:()=> 'learner-02'}});
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),false);
}

{
  const ctx=boot({SIYAYOVerbExplorerLearnerIdentityProvider:{provide:()=>true}});
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),false);
}

{
  let calls=[];
  const ctx=boot({
    SIYAYOLearnerIdentityAuthority:{getLearnerId:()=> 'learner-03'},
    SIYAYOVerbExplorerLearnerIdentityProvider:{provide:id=>{calls.push(id);return false;}}
  });
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),false);
  assert.deepStrictEqual(calls,['learner-03']);
}

console.log('PASS learner identity authority -> provider bridge');
