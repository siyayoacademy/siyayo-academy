#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({ console });
sandbox.globalThis = sandbox;

vm.runInContext(fs.readFileSync('js/green-pass-profile.js', 'utf8'), sandbox, {
  filename: 'js/green-pass-profile.js'
});
vm.runInContext(fs.readFileSync('js/verb-explorer-adaptive-profile-source.js', 'utf8'), sandbox, {
  filename: 'js/verb-explorer-adaptive-profile-source.js'
});

const source = sandbox.SIYAYOVerbExplorerAdaptiveProfileSource;
assert(source && typeof source.begin === 'function');
assert.equal(source.getProfile(), null, 'Profile source starts in WAIT');

const profile = source.begin(' learner-1 ');
assert(profile, 'canonical Green Pass profile should be created');
assert.equal(profile.id, 'learner-1');
assert.equal(profile.attempts, 0);
assert.equal(profile.correct, 0);
assert.equal(profile.accuracy, 0);
assert.deepEqual(Object.keys(profile.bySkill), []);
assert.deepEqual(Array.from(profile.reinforcement), []);
assert.equal(profile.greenPass, false);
assert.strictEqual(source.getProfile(), profile, 'source should retain canonical P');

source.clear();
assert.equal(source.getProfile(), null, 'clear returns P to WAIT');
assert.equal(source.begin('   '), null, 'blank learner id must WAIT');
assert.equal(source.getProfile(), null, 'blank id must not create anonymous P implicitly');

const evolved = sandbox.GreenPassProfile.recordAttempt(profile, {
  language: 'en', chapter: 'questions', skill: 'which.use.determiner', correct: true, confidence: 0.9
});
assert(source.adopt(evolved), 'evolved canonical profile may be adopted');
assert.strictEqual(source.getProfile(), evolved, 'adopt must preserve the exact evolved P object');
assert.equal(source.adopt(null), false, 'missing profile must WAIT');
assert.strictEqual(source.getProfile(), evolved, 'failed adopt must not erase existing P');

source.clear();
const savedApi = sandbox.GreenPassProfile;
delete sandbox.GreenPassProfile;
assert.equal(source.begin('learner-2'), null, 'missing canonical GreenPassProfile API must WAIT');
assert.equal(source.getProfile(), null);
sandbox.GreenPassProfile = savedApi;

console.log('Verb Explorer adaptive Profile source: PASS — canonical GreenPassProfile creates P; blank identity or missing API preserves WAIT; evolved P is adopted without reset.');
