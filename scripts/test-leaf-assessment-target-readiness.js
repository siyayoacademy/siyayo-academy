#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/leaf-assessment-target-readiness.js','utf8');

(async()=>{
  function load(options={}){
    const calls={adopt:0,signal:0};
    const sandbox=vm.createContext({Object,Promise});
    sandbox.globalThis=sandbox;
    if(options.authority!==false){
      sandbox.SIYAYOLeafAssessmentTargetAuthority={
        adopt(target){
          calls.adopt+=1;
          return options.adoptResult!==false;
        }
      };
    }
    if(options.trigger!==false){
      sandbox.SIYAYOVerbExplorerAdaptiveReadinessTrigger={
        signal(){
          calls.signal+=1;
          return Promise.resolve(options.signalResult===true);
        }
      };
    }
    vm.runInContext(code,sandbox,{filename:'js/leaf-assessment-target-readiness.js'});
    return {boundary:sandbox.SIYAYOLeafAssessmentTargetReadiness,calls};
  }

  {
    const {boundary,calls}=load({adoptResult:true,signalResult:false});
    assert(boundary&&typeof boundary.adopt==='function','Leaf readiness boundary must expose adopt()');
    assert.equal(await boundary.adopt({skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'}),false,'successful Target adoption may still preserve WAIT');
    assert.deepEqual(calls,{adopt:1,signal:1},'successful explicit Target adoption must signal readiness exactly once');
  }

  {
    const {boundary,calls}=load({adoptResult:false});
    assert.equal(await boundary.adopt({skill:'verb-function',definitionPath:'data/learning/skills/which.json'}),false,'rejected Target must fail closed');
    assert.deepEqual(calls,{adopt:1,signal:0},'rejected Target must never signal readiness');
  }

  {
    const {boundary,calls}=load({authority:false});
    assert.equal(await boundary.adopt({skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'}),false,'missing Target authority must WAIT');
    assert.deepEqual(calls,{adopt:0,signal:0});
  }

  {
    const {boundary,calls}=load({trigger:false});
    assert.equal(await boundary.adopt({skill:'which.use.determiner',definitionPath:'data/learning/skills/which.json'}),false,'missing readiness trigger must fail closed after valid adoption');
    assert.deepEqual(calls,{adopt:1,signal:0});
  }

  console.log('Leaf Assessment Target Readiness: PASS — explicit Leaf Target adoption signals readiness only after authority accepts it; rejected or missing dependencies remain WAIT.');
})().catch(error=>{console.error(error);process.exit(1);});
