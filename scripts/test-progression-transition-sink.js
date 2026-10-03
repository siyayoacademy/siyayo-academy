#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

let trail=null;
const currentSession={decision:{experienceId:'shopping-for-dinner',skill:'which.use.determiner'}};
const sandbox=vm.createContext({Object});
sandbox.globalThis=sandbox;
sandbox.AdaptiveSessionTransitionBoundary=require('../js/adaptive-session-transition-boundary.js');
sandbox.SIYAYOVerbExplorerActiveSessionSource=()=>currentSession;
sandbox.SIYAYOVerbExplorerTransitionTrailSink=e=>{trail=e;};
vm.runInContext(fs.readFileSync('js/verb-explorer-progression-decision-sink.js','utf8'),sandbox,{filename:'sink'});

const decision={
 status:'PROGRESSION_DECISION_READY',occurrenceId:'toroidal-next-select:1',
 advanceSelection:{action:'advance',status:'selected',experienceId:'preparing-dinner',fromExperience:'shopping-for-dinner'},
 nextDecision:{action:'advance',experienceId:'preparing-dinner',skill:'which.use.determiner',focus:'assessment'}
};
const authorization=sandbox.SIYAYOVerbExplorerProgressionDecisionSink(decision);
assert.ok(authorization);
assert.equal(authorization.status,'transition-authorized');
assert.equal(authorization.fromExperience,'shopping-for-dinner');
assert.equal(authorization.toExperience,'preparing-dinner');
assert.equal(trail.type,'pedagogical-transition-authorized');
assert.equal(trail.skill,'which.use.determiner');

trail=null;
assert.equal(sandbox.SIYAYOVerbExplorerProgressionDecisionSink({...decision,advanceSelection:{...decision.advanceSelection,fromExperience:'having-dinner'}}),null);
assert.equal(trail,null);

const source=fs.readFileSync('js/verb-explorer-progression-decision-sink.js','utf8');
assert.ok(!source.includes('TransitionRuntime.execute'));
assert.ok(!source.includes('NextSessionActivation.activate'));
assert.ok(!source.includes('goToExperience'));

console.log('Progression transition sink: PASS — converged decision may authorize S1→S2 and record a pedagogical trail; the sink cannot navigate or activate S2.');
