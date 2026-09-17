#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const appended=[];
let resumeContext=null;
const context={
  console,Promise,setTimeout,clearTimeout,
  fetch(url){
    if(url==='data/learning/skills/which.json'){
      return Promise.resolve({ok:true,json:()=>Promise.resolve({
        id:'which.use.determiner',
        passContract:{requiredDimensions:['choice-function']}
      })});
    }
    return Promise.reject(new Error('unexpected fetch '+url));
  },
  document:{
    head:{appendChild(script){
      appended.push(script.src);
      const code=fs.readFileSync(script.src,'utf8');
      vm.runInContext(code,sandbox,{filename:script.src});
      if(typeof script.onload==='function')script.onload();
    }},
    createElement(tag){assert.equal(tag,'script');return {src:'',async:true,onload:null,onerror:null};},
    addEventListener(){},
    getElementById(){return null;},
    querySelector(){return null;}
  }
};
context.globalThis=context;
const sandbox=vm.createContext(context);

function load(path){vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});}

// Use the production dependency loader so contract authorities such as
// GreenPassAuthorityPolicy are present exactly as they are in the browser.
load('js/adaptive-browser-runtime.js');

// StateBridge remains read-only. This controlled ResumeRuntime is its live state authority.
sandbox.SIYAYOVerbExplorerResumeRuntime={
  captureContext(){return resumeContext;}
};

load('js/verb-explorer-adaptive-bootstrap.js');

Promise.resolve(sandbox.SIYAYOVerbExplorerAdaptiveReady)
  .then(async function(cycle){
    assert(cycle&&typeof cycle.submit==='function','bootstrap must remain alive while authorities are absent');
    assert(appended.includes('js/green-pass-authority-policy.js'),'real adaptive runtime must load Green Pass authority policy');
    assert(appended.includes('js/verb-explorer-adaptive-live-start.js'),'LIVE bootstrap must load LiveStart');

    const live=sandbox.SIYAYOVerbExplorerAdaptiveLiveStart;
    const coordinator=sandbox.SIYAYOVerbExplorerAdaptiveCoordinator;
    assert(live&&typeof live.tryCompose==='function');
    assert(coordinator&&typeof coordinator.snapshot==='function');
    assert.equal(coordinator.snapshot(),null,'initial browser startup without authorities must WAIT without Session');

    // Identity may arrive before the pedagogical Target. Neither alone authorizes S.
    sandbox.SIYAYOVerbExplorerLearnerIdentitySource.adopt('learner-live-27');
    assert.equal(await live.tryCompose({document:sandbox.document}),false,'identity alone must remain WAIT');
    assert.equal(coordinator.snapshot(),null);

    const adopted=sandbox.SIYAYOLeafAssessmentTargetAuthority.adopt({
      skill:'which.use.determiner',
      definitionPath:'data/learning/skills/which.json'
    });
    assert(adopted,'explicit late Leaf Target should be adopted');

    // The Explorer state may also become ready after page bootstrap. StateBridge reads it;
    // no Experience→Skill inference or writable StateBridge seam is introduced.
    resumeContext={currentExperienceId:'shopping-for-dinner'};

    assert.equal(await live.tryCompose({document:sandbox.document}),true,'late explicit authorities must ground one live Session');
    const first=coordinator.snapshot();
    assert(first&&first.session,'late-authority retry must create an active Session');
    assert.equal(first.context.skill,'which.use.determiner');
    assert.equal(first.context.currentExperience,'shopping-for-dinner');

    assert.equal(await live.tryCompose({document:sandbox.document}),false,'re-entry must not replace active Session');
    const second=coordinator.snapshot();
    assert.strictEqual(second.session,first.session,'active Session identity must be preserved');

    console.log('Adaptive browser late authority: PASS — real runtime preserves initial WAIT; late explicit Identity + Leaf Target + Resume state ground one Session; re-entry preserves it.');
  })
  .catch(function(error){console.error(error);process.exitCode=1;});
