#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

let navigated=null, observed=null;
const nextElement={dataset:{nextExperience:'preparing-dinner'},closest(){return nextCard;}};
const nextCard={dataset:{},classList:{remove(){},add(){}},setAttribute(){},tabIndex:null};
const document={getElementById(id){return id==='nextExperience'?nextElement:null;}};
const sandbox=vm.createContext({Object,Date,document});
sandbox.globalThis=sandbox;
sandbox.SIYAYOVerbExplorerResumeRuntime={captureContext(){return {currentExperienceId:'shopping-for-dinner'};}};
sandbox.SIYAYOVerbExplorerExperienceNavigation={goToExperience(id){navigated=id;}};
sandbox.SIYAYOVerbExplorerToroidalNextObserver=function(event){observed=event;throw new Error('adaptive observer failure must not gate navigation');};

vm.runInContext(fs.readFileSync('js/verb-explorer-live-next-wire.js','utf8'),sandbox,{filename:'js/verb-explorer-live-next-wire.js'});
assert.equal(sandbox.SIYAYOVerbExplorerLiveNextWire.install({document}),true);
const result=nextCard.onclick();
assert.equal(navigated,'preparing-dinner');
assert.ok(observed);
assert.equal(observed.actor,'learner');
assert.equal(observed.source,'toroidal-next-select');
assert.equal(observed.intent,'advance');
assert.equal(observed.relevantToProgression,true);
assert.equal(observed.fromExperienceId,'shopping-for-dinner');
assert.equal(observed.toExperienceId,'preparing-dinner');
assert.match(observed.occurrenceId,/^toroidal-next-select:/);
assert.equal(result.status,'NAVIGATED');
assert.equal(result.toExperienceId,'preparing-dinner');

console.log('Toroidal NEXT observation: PASS — learner navigation stays free even if adaptive observation fails, while a progression-shaped event is emitted in parallel.');
