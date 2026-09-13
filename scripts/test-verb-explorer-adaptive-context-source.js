#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const sandbox=vm.createContext({Object,String});
sandbox.globalThis=sandbox;
for(const file of ['js/verb-explorer-session-state-boundary.js','js/verb-explorer-adaptive-context-source.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
}

const source=sandbox.SIYAYOVerbExplorerAdaptiveContextSource;
const session=Object.freeze({decision:Object.freeze({skill:'which.use.determiner',experienceId:'shopping-for-dinner'})});
const state=Object.freeze({currentExperienceId:'shopping-for-dinner'});
const base=Object.freeze({passContract:Object.freeze({id:'which-pass'}),evidencePackets:Object.freeze([{id:'prior'}]),language:'en'});

const context=source.compose(session,state,base);
assert.ok(context);
assert.equal(context.skill,'which.use.determiner');
assert.equal(context.currentExperience,'shopping-for-dinner');
assert.equal(context.passContract,base.passContract);
assert.equal(context.evidencePackets,base.evidencePackets);
assert.equal(context.language,'en');
assert.equal(Object.isFrozen(context),true);

assert.equal(source.compose(session,state,{skill:'other.skill'}),null,'conflicting skill provenance must fail closed');
assert.equal(source.compose(session,state,{currentExperience:'nice-party'}),null,'conflicting experience provenance must fail closed');
assert.equal(source.compose(session,{currentExperienceId:'nice-party'},base),null,'Session/State disagreement must fail closed');
assert.equal(source.compose({decision:{experienceId:'shopping-for-dinner'}},state,base),null,'missing Session-owned skill must fail closed');

console.log('Adaptive Context provenance: PASS — base context is preserved only when it agrees with Session-owned skill and State-observed experience.');
