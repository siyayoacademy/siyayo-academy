#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/verb-explorer-adaptive-live-start.js','utf8');

function build(){
  const calls={load:0,compose:0};
  let learnerId=null;
  let target=null;
  let active=false;
  const documentRef=Object.freeze({id:'verb-explorer-document'});
  const sandbox=vm.createContext({Object,Promise});
  sandbox.globalThis=sandbox;
  sandbox.SIYAYOVerbExplorerLearnerIdentitySource={getId:()=>learnerId};
  sandbox.SIYAYOLeafAssessmentTargetAuthority={getTarget:()=>target};
  sandbox.SIYAYOLeafCanonicalSkillBridge={loadTarget(){calls.load+=1;return Promise.resolve(true);}};
  sandbox.SIYAYOVerbExplorerAdaptiveComposer={compose(input){
    calls.compose+=1;
    assert.equal(input.document,documentRef);
    if(active)return false;
    active=true;
    return true;
  }};
  vm.runInContext(code,sandbox,{filename:'js/verb-explorer-adaptive-live-start.js'});
  return {
    live:sandbox.SIYAYOVerbExplorerAdaptiveLiveStart,
    calls,documentRef,
    setIdentity(value){learnerId=value;},
    setTarget(value){target=value;},
    clearSession(){active=false;}
  };
}

(async()=>{
  const t=build();

  assert.equal(await t.live.tryCompose({document:t.documentRef}),false,'missing identity + Target must WAIT');
  assert.equal(t.calls.load,0,'WAIT must not load Skill');
  assert.equal(t.calls.compose,0,'WAIT must not compose');

  t.setIdentity('learner-27');
  assert.equal(await t.live.tryCompose({document:t.documentRef}),false,'identity alone must WAIT for explicit Leaf Target');
  assert.equal(t.calls.load,0);
  assert.equal(t.calls.compose,0);

  t.setTarget({skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'});
  assert.equal(await t.live.tryCompose({document:t.documentRef}),true,'resolved authorities may ground one Session');
  assert.equal(t.calls.load,1);
  assert.equal(t.calls.compose,1);

  assert.equal(await t.live.tryCompose({document:t.documentRef}),false,'active Session must reject silent recomposition');
  assert.equal(t.calls.load,2,'re-entry may revalidate the explicit Target');
  assert.equal(t.calls.compose,2,'Composer remains the active-Session authority');

  t.clearSession();
  assert.equal(await t.live.tryCompose({document:t.documentRef}),true,'explicit lifecycle clear permits later composition');
  assert.equal(t.calls.compose,3);

  {
    let resolveLoad;
    const calls={load:0,compose:0};
    const sandbox=vm.createContext({Object,Promise});
    sandbox.globalThis=sandbox;
    sandbox.SIYAYOVerbExplorerLearnerIdentitySource={getId:()=> 'learner-27'};
    sandbox.SIYAYOLeafAssessmentTargetAuthority={getTarget:()=>({skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'})};
    sandbox.SIYAYOLeafCanonicalSkillBridge={loadTarget(){calls.load+=1;return new Promise(resolve=>{resolveLoad=resolve;});}};
    sandbox.SIYAYOVerbExplorerAdaptiveComposer={compose(){calls.compose+=1;return true;}};
    vm.runInContext(code,sandbox,{filename:'js/verb-explorer-adaptive-live-start.js'});
    const live=sandbox.SIYAYOVerbExplorerAdaptiveLiveStart;
    const first=live.tryCompose({document:t.documentRef});
    const second=live.tryCompose({document:t.documentRef});
    assert.equal(first,second,'concurrent startup attempts must share one pending composition');
    assert.equal(calls.load,1,'concurrent retry must not duplicate Skill loading');
    resolveLoad(true);
    assert.equal(await first,true);
    assert.equal(calls.compose,1,'concurrent retry must compose exactly once');
  }

  {
    const sandbox=vm.createContext({Object,Promise});
    sandbox.globalThis=sandbox;
    vm.runInContext(code,sandbox,{filename:'js/verb-explorer-adaptive-live-start.js'});
    assert.equal(await sandbox.SIYAYOVerbExplorerAdaptiveLiveStart.tryCompose(),false,'missing dependencies must WAIT/fail closed');
  }

  console.log('Adaptive Live Start: PASS — WAIT is re-entrant; explicit authorities ground one Session; concurrent retries coalesce; Composer preserves active Session.');
})().catch(error=>{console.error(error);process.exit(1);});
