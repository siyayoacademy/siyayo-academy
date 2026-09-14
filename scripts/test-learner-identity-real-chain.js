const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const files=[
  'js/learner-identity-authority.js',
  'js/verb-explorer-learner-identity-source.js',
  'js/verb-explorer-learner-identity-provider.js',
  'js/learner-identity-provider-bridge.js'
];

function boot(){
  const context={console};
  context.globalThis=context;
  for(const file of files)vm.runInNewContext(fs.readFileSync(file,'utf8'),context,{filename:file});
  return context;
}

{
  const ctx=boot();
  assert.strictEqual(ctx.SIYAYOLearnerIdentityAuthority.getLearnerId(),null);
  assert.strictEqual(ctx.SIYAYOVerbExplorerLearnerIdentitySource.getId(),null);
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),false);
  assert.strictEqual(ctx.SIYAYOVerbExplorerLearnerIdentitySource.getId(),null);
}

{
  const ctx=boot();
  assert.strictEqual(ctx.SIYAYOLearnerIdentityAuthority.establish({learnerId:' learner-01 '}),true);
  assert.strictEqual(ctx.SIYAYOLearnerIdentityAuthority.getLearnerId(),'learner-01');
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),true);
  assert.strictEqual(ctx.SIYAYOVerbExplorerLearnerIdentitySource.getId(),'learner-01');
}

{
  const ctx=boot();
  assert.strictEqual(ctx.SIYAYOLearnerIdentityAuthority.establish({learnerId:'learner-01'}),true);
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),true);
  assert.strictEqual(ctx.SIYAYOVerbExplorerLearnerIdentitySource.getId(),'learner-01');

  assert.strictEqual(ctx.SIYAYOLearnerIdentityAuthority.establish({learnerId:'   '}),false);
  assert.strictEqual(ctx.SIYAYOLearnerIdentityAuthority.getLearnerId(),'learner-01');
  assert.strictEqual(ctx.SIYAYOVerbExplorerLearnerIdentitySource.getId(),'learner-01');
}

{
  const ctx=boot();
  assert.strictEqual(ctx.SIYAYOVerbExplorerLearnerIdentitySource.adopt('learner-01'),true);
  assert.strictEqual(ctx.SIYAYOLearnerIdentityAuthority.establish({learnerId:'learner-02'}),true);
  assert.strictEqual(ctx.SIYAYOLearnerIdentityProviderBridge.provideEstablished(),false,'conflicting authority identity must WAIT');
  assert.strictEqual(ctx.SIYAYOVerbExplorerLearnerIdentitySource.getId(),'learner-01','conflict must preserve retained Source identity');
}

console.log('PASS real learner identity chain — missing identity WAIT; matching identity flows; conflicting identity fails closed without switch');
