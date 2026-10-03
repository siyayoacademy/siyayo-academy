#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox=vm.createContext({});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('js/choice-mode-sensor.js','utf8'),sandbox,{filename:'js/choice-mode-sensor.js'});
vm.runInContext(fs.readFileSync('js/verb-explorer-choice-mode-bridge.js','utf8'),sandbox,{filename:'js/verb-explorer-choice-mode-bridge.js'});
const bridge=sandbox.SIYAYOVerbExplorerChoiceModeBridge;
assert(bridge&&typeof bridge.fromObservation==='function');
const observation=Object.freeze({
 type:'sentence-built',canonicalCandidate:true,systemStructure:true,
 currentExperienceId:'shopping-for-dinner',experienceLanguage:'en',
 experienceQuestion:'Which cheese should we choose?',experienceChoiceCandidate:'fresh-mild-cheese'
});
const signal=bridge.fromObservation(observation);
assert(signal,'grounded sentence observation should produce a mode signal');
assert.equal(signal.value,'controlled-production');
assert.equal(signal.context.currentExperienceId,'shopping-for-dinner');
assert.equal(signal.context.experienceLanguage,'en');
assert.equal(signal.context.experienceQuestion,'Which cheese should we choose?');
assert.equal(signal.context.experienceChoiceCandidate,'fresh-mild-cheese');
assert.equal(Object.isFrozen(signal),true);
assert.equal(Object.isFrozen(signal.context),true);
assert.equal('occurrenceId' in signal,false,'mode bridge must not invent occurrence identity');
assert.notEqual(signal.value,'transfer','controlled production must not be promoted to transfer');
assert.equal(bridge.fromObservation(Object.freeze(Object.assign({},observation,{experienceLanguage:''}))),null,'ungrounded observation must fail closed');
assert.equal(bridge.fromObservation(Object.freeze(Object.assign({},observation,{canonicalCandidate:false}))),null,'non-canonical composition must fail closed through the sensor');
console.log('Choice mode bridge: PASS — grounded BUILD SENTENCE observation becomes contextual controlled-production without invented occurrence identity or transfer.');
