const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

let live={
  currentExperienceId:'shopping-for-dinner',
  experienceLanguage:'en',
  experienceTense:'present',
  experienceForm:'interrogative',
  experienceQuestion:3,
  experiencePerspective:'debating',
  experienceChoiceCandidate:'choose',
  experienceWordType:'verb',
  experienceNounId:'cheese',
  experienceAdjectiveId:null,
  lineOffset:6
};

const context={console};
context.globalThis=context;
context.SIYAYOVerbExplorerResumeRuntime=Object.freeze({captureContext(){return Object.assign({},live);}});
const sandbox=vm.createContext(context);
vm.runInContext(fs.readFileSync('js/verb-explorer-adaptive-state-bridge.js','utf8'),sandbox,{filename:'js/verb-explorer-adaptive-state-bridge.js'});

const bridge=sandbox.SIYAYOVerbExplorerAdaptiveStateBridge;
assert(bridge,'state bridge should exist');
const state=bridge.getState();
assert(state,'grounded state should be captured');
assert.strictEqual(state.currentExperienceId,'shopping-for-dinner');
assert.strictEqual(state.experienceChoiceCandidate,'choose');
assert.strictEqual(state.experiencePerspective,'debating');
assert.strictEqual(state.lineOffset,6);
assert(Object.isFrozen(state),'adaptive state snapshot should be frozen');
assert.strictEqual(Object.prototype.hasOwnProperty.call(state,'profile'),false,'bridge must not invent profile');
assert.strictEqual(Object.prototype.hasOwnProperty.call(state,'session'),false,'bridge must not invent session');
assert.strictEqual(Object.prototype.hasOwnProperty.call(state,'attempt'),false,'bridge must not invent attempt');
assert.strictEqual(Object.prototype.hasOwnProperty.call(state,'context'),false,'bridge must not invent pedagogical context');

live.experienceChoiceCandidate='buy';
assert.strictEqual(state.experienceChoiceCandidate,'choose','captured snapshot must not drift with later live mutations');
assert.strictEqual(bridge.getResumeState().experienceChoiceCandidate,'buy','new capture should reflect current live state');

sandbox.SIYAYOVerbExplorerResumeRuntime=null;
assert.strictEqual(bridge.getState(),null,'missing runtime must fail closed');

console.log('Verb Explorer adaptive state bridge: PASS — grounded frozen state only; no profile/session/attempt/context invented; missing runtime fails closed.');
