#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const sandbox=vm.createContext({Object});
sandbox.globalThis=sandbox;
vm.runInContext(fs.readFileSync('js/verb-explorer-session-state-boundary.js','utf8'),sandbox,{filename:'js/verb-explorer-session-state-boundary.js'});

const boundary=sandbox.SIYAYOVerbExplorerSessionStateBoundary;
const session=Object.freeze({decision:Object.freeze({skill:'which.use.determiner',experienceId:'shopping-for-dinner'})});
const state=Object.freeze({currentExperienceId:'shopping-for-dinner'});

const aligned=boundary.align(session,state);
assert.ok(aligned);
assert.equal(aligned.skill,'which.use.determiner');
assert.equal(aligned.currentExperience,'shopping-for-dinner');
assert.equal(Object.isFrozen(aligned),true);

assert.equal(boundary.align(session,{currentExperienceId:'nice-party'}),null,'different Session/State experience must fail closed');
assert.equal(boundary.align({decision:{experienceId:'shopping-for-dinner'}},state),null,'missing Session-owned skill must fail closed');
assert.equal(boundary.align({decision:{skill:'which.use.determiner'}},state),null,'missing Session experience must fail closed');
assert.equal(boundary.align(session,{}),null,'missing observed Explorer experience must fail closed');

console.log('Session-State provenance boundary: PASS — Session owns skill, State owns observed location, and only matching experience releases grounded provenance.');
