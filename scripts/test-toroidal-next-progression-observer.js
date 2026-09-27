#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

let sink=null;
const sandbox=vm.createContext({Object});
sandbox.globalThis=sandbox;
sandbox.AdaptiveProgressionDecision={resolve({convergence,learnerEvent}){if(convergence.status!=='CANDIDATE_SUPPORTED_FOR_CONSIDERATION')return null;if(learnerEvent.intent!=='advance')return null;return Object.freeze({status:'PROGRESSION_DECISION_READY',occurrenceId:learnerEvent.occurrenceId});}};
sandbox.SIYAYOVerbExplorerProgressionConvergenceSource=()=>({status:'CANDIDATE_SUPPORTED_FOR_CONSIDERATION'});
sandbox.SIYAYOVerbExplorerProgressionDecisionSink=d=>{sink=d;};
vm.runInContext(fs.readFileSync('js/verb-explorer-toroidal-next-observer.js','utf8'),sandbox,{filename:'observer'});

const event={observed:true,actor:'learner',relevantToProgression:true,intent:'advance',source:'toroidal-next-select',occurrenceId:'toroidal-next-select:1',fromExperienceId:'shopping-for-dinner',toExperienceId:'preparing-dinner'};
const decision=sandbox.SIYAYOVerbExplorerToroidalNextObserver(event);
assert.equal(decision.status,'PROGRESSION_DECISION_READY');
assert.equal(sink,decision);

sandbox.SIYAYOVerbExplorerProgressionConvergenceSource=()=>({status:'CONVERGENCE_UNRESOLVED'});
sink=null;
assert.equal(sandbox.SIYAYOVerbExplorerToroidalNextObserver(event),null);
assert.equal(sink,null);

const bootstrap=fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js','utf8');
assert.ok(bootstrap.indexOf('SIYAYOVerbExplorerToroidalNextObserver')<bootstrap.indexOf('SIYAYOVerbExplorerLiveNextWire'));

console.log('Toroidal NEXT progression observer: PASS — progression is recorded only with convergence; unresolved pedagogy stays silent and navigation remains outside this observer.');
