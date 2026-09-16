#!/usr/bin/env node

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

let clickHandler=null;
let observed=null;
let captured=0;
const target={id:'buildSentence'};
const sandbox=vm.createContext({
  Promise,
  document:{
    addEventListener(type,handler){if(type==='click')clickHandler=handler;}
  }
});
sandbox.globalThis=sandbox;
sandbox.SIYAYOVerbExplorerLearnerEvent={
  fromSentenceBuilt(composition,state){
    if(composition.canonicalCandidate!==true||composition.systemStructure!==true)return null;
    return Object.freeze({type:'sentence-built',state});
  }
};
sandbox.SIYAYOVerbExplorerAdaptiveStateBridge={
  capture(){
    captured+=1;
    return Object.freeze({
      currentExperienceId:'shopping-for-dinner',
      experienceLanguage:'en',
      experienceQuestion:2,
      experienceChoiceCandidate:'fresh-mild-cheese',
      experienceWordType:'sentence'
    });
  }
};

vm.runInContext(fs.readFileSync('js/verb-explorer-sentence-built-observer.js','utf8'),sandbox,{filename:'js/verb-explorer-sentence-built-observer.js'});
const observer=sandbox.SIYAYOVerbExplorerSentenceBuiltObserver;
assert(observer);
assert.equal(observer.install({onObserved(value){observed=value;}}),true);
assert.equal(observer.install(),false,'observer installation must be idempotent');
assert.equal(typeof clickHandler,'function');

clickHandler({target:{closest(selector){return selector==='#buildSentence'?target:null;}}});
assert.equal(observed,null,'observation must wait until the existing handler finishes');

Promise.resolve().then(()=>{
  assert.equal(captured,1);
  assert(observed);
  assert.equal(observed.type,'sentence-built');
  assert.equal(observed.state.currentExperienceId,'shopping-for-dinner');
  assert.equal(observed.state.experienceLanguage,'en');
  assert.equal(observed.state.experienceQuestion,2);
  assert.equal(observed.state.experienceChoiceCandidate,'fresh-mild-cheese');

  observed=null;
  clickHandler({target:{closest(){return null;}}});
  return Promise.resolve();
}).then(()=>{
  assert.equal(observed,null,'unrelated clicks must not create observations');
  assert.equal(captured,1,'unrelated clicks must not capture adaptive state');
  console.log('Sentence-built observer: PASS — real BUILD SENTENCE boundary is observed after the existing handler with grounded state only.');
}).catch(error=>{
  console.error(error);
  process.exitCode=1;
});
