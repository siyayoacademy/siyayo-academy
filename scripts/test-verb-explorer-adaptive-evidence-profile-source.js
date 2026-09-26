#!/usr/bin/env node

const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const profileCode=fs.readFileSync('js/adaptive-evidence-profile.js','utf8');
const sourceCode=fs.readFileSync('js/verb-explorer-adaptive-evidence-profile-source.js','utf8');
const sandbox=vm.createContext({console});
sandbox.globalThis=sandbox;

vm.runInContext(profileCode,sandbox,{filename:'js/adaptive-evidence-profile.js'});
vm.runInContext(sourceCode,sandbox,{filename:'js/verb-explorer-adaptive-evidence-profile-source.js'});

const api=sandbox.AdaptiveEvidenceProfile;
const source=sandbox.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
assert(source&&typeof source.begin==='function');
assert.equal(source.getProfile(),null,'Evidence Profile source starts in WAIT');

const profile=source.begin(' learner-1 ');
assert(profile,'canonical Adaptive Evidence Profile should be created');
assert.equal(profile.id,'learner-1');
assert.deepEqual(Array.from(profile.observations),[]);
assert.deepEqual(Array.from(profile.patterns),[]);
assert.deepEqual(Array.from(profile.reinforcementCandidates),[]);
assert.deepEqual(Array.from(profile.confirmedReinforcements),[]);
assert.strictEqual(source.getProfile(),profile,'source should retain the canonical Evidence Profile');

api.record(profile,{source:'test-observation',status:'observed'},{});
assert.strictEqual(source.getProfile(),profile,'canonical record must evolve the retained profile without replacing it');
assert.equal(source.getProfile().observations.length,1);

source.clear();
assert.equal(source.getProfile(),null,'clear returns the Evidence Profile source to WAIT');
assert.equal(source.begin('   '),null,'blank learner id must WAIT');
assert.equal(source.getProfile(),null,'blank id must not create an anonymous Evidence Profile');

const adopted=api.createProfile('learner-2');
assert.equal(source.adopt(adopted),true,'an existing canonical Evidence Profile may be adopted');
assert.strictEqual(source.getProfile(),adopted,'adopt must preserve the exact profile object');
assert.equal(source.adopt({id:'shape-only'}),false,'non-canonical profile shape must WAIT');
assert.strictEqual(source.getProfile(),adopted,'failed adoption must not erase the retained profile');

const noApiSandbox=vm.createContext({console});
noApiSandbox.globalThis=noApiSandbox;
vm.runInContext(sourceCode,noApiSandbox,{filename:'js/verb-explorer-adaptive-evidence-profile-source.js'});
const noApiSource=noApiSandbox.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
assert.equal(noApiSource.begin('learner-3'),null,'missing canonical API must WAIT');
assert.equal(noApiSource.getProfile(),null);

console.log('Verb Explorer adaptive Evidence Profile source: PASS — canonical AdaptiveEvidenceProfile creates and retains the runtime profile; invalid identity, shape, or API preserves WAIT.');
