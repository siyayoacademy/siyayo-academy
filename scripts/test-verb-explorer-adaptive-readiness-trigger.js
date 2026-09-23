#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/verb-explorer-adaptive-readiness-trigger.js','utf8');

(async()=>{
  {
    const sandbox=vm.createContext({Object,Promise});
    sandbox.globalThis=sandbox;
    vm.runInContext(code,sandbox,{filename:'js/verb-explorer-adaptive-readiness-trigger.js'});
    const trigger=sandbox.SIYAYOVerbExplorerAdaptiveReadinessTrigger;
    assert(trigger&&typeof trigger.signal==='function','readiness trigger must expose signal()');
    assert.equal(await trigger.signal(),false,'missing LiveStart must WAIT/fail closed');
  }

  {
    let calls=0;
    const documentRef=Object.freeze({id:'verb-explorer-document'});
    const sandbox=vm.createContext({Object,Promise,document:documentRef});
    sandbox.globalThis=sandbox;
    sandbox.SIYAYOVerbExplorerAdaptiveLiveStart={
      tryCompose(options){
        calls+=1;
        assert.equal(options.document,documentRef,'signal must forward the live document without inventing authority');
        return Promise.resolve(false);
      }
    };
    vm.runInContext(code,sandbox,{filename:'js/verb-explorer-adaptive-readiness-trigger.js'});
    const trigger=sandbox.SIYAYOVerbExplorerAdaptiveReadinessTrigger;
    assert.equal(await trigger.signal(),false,'premature readiness signal must preserve WAIT');
    assert.equal(calls,1,'one readiness signal must request exactly one LiveStart attempt');
  }

  {
    let calls=0;
    let renders=0;
    let trailRefreshes=0;
    let resolveAttempt;
    const sandbox=vm.createContext({Object,Promise});
    sandbox.globalThis=sandbox;
    sandbox.SIYAYOVerbExplorerAdaptiveLiveStart={
      tryCompose(){
        calls+=1;
        return new Promise(resolve=>{resolveAttempt=resolve;});
      }
    };
    sandbox.SIYAYOVerbExplorerDependencyHeadProbeRuntime={
      render(){renders+=1;return true;}
    };
    sandbox.SIYAYOVerbExplorerLearnerTrailSurface={
      refresh(options){
        trailRefreshes+=1;
        assert.equal(options.document,undefined,'Trail refresh must receive the same live document reference');
        return true;
      }
    };
    vm.runInContext(code,sandbox,{filename:'js/verb-explorer-adaptive-readiness-trigger.js'});
    const trigger=sandbox.SIYAYOVerbExplorerAdaptiveReadinessTrigger;
    const first=trigger.signal();
    const second=trigger.signal();
    assert.equal(first,second,'concurrent readiness signals must share one pending trigger attempt');
    assert.equal(calls,1,'concurrent readiness signals must not duplicate LiveStart attempts');
    resolveAttempt(true);
    assert.equal(await first,true,'grounded LiveStart success must pass through unchanged');
    assert.equal(renders,1,'grounded Session readiness must refresh the live Dependency Head Probe once');
    assert.equal(trailRefreshes,1,'grounded Session readiness must render the initial Learner Trail immediately');
    assert.equal(await trigger.signal(),true,'a later readiness signal may request a fresh re-entrant attempt');
    assert.equal(calls,2,'later signal after settlement must be allowed exactly once');
    assert.equal(renders,2,'each later successful readiness transition may refresh the live probe once');
    assert.equal(trailRefreshes,2,'each later successful readiness transition may refresh the Learner Trail once');
  }

  {
    let calls=0;
    const injected={
      tryCompose(options){
        calls+=1;
        assert.equal(options.document,null);
        return true;
      }
    };
    const sandbox=vm.createContext({Object,Promise});
    sandbox.globalThis=sandbox;
    vm.runInContext(code,sandbox,{filename:'js/verb-explorer-adaptive-readiness-trigger.js'});
    const trigger=sandbox.SIYAYOVerbExplorerAdaptiveReadinessTrigger;
    assert.equal(await trigger.signal({liveStart:injected,document:null}),true,'explicit dependency injection must remain possible for contract tests');
    assert.equal(calls,1);
  }

  console.log('Adaptive Readiness Trigger: PASS — signal is authority-neutral, fail-closed, coalesced, delegates readiness exclusively to LiveStart, and refreshes Head Probe + Learner Trail only after grounded Session readiness.');
})().catch(error=>{console.error(error);process.exit(1);});
