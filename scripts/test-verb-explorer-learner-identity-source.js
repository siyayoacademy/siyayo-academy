#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const code = fs.readFileSync('js/verb-explorer-learner-identity-source.js', 'utf8');
const sandbox = vm.createContext({ Object, String });
sandbox.globalThis = sandbox;
vm.runInContext(code, sandbox, { filename: 'js/verb-explorer-learner-identity-source.js' });

const source = sandbox.SIYAYOVerbExplorerLearnerIdentitySource;
assert(source && typeof source.adopt === 'function');
assert.equal(source.getId(), null, 'identity source starts in WAIT');
assert.equal(source.adopt('   '), false, 'blank identity must preserve WAIT');
assert.equal(source.getId(), null, 'blank identity must not become anonymous implicitly');
assert.equal(source.adopt(null), false, 'missing identity must preserve WAIT');
assert.equal(source.getId(), null);

assert.equal(source.adopt(' learner-1 '), true, 'explicit learner identity may be adopted');
assert.equal(source.getId(), 'learner-1', 'identity is normalized and retained');

assert.equal(source.adopt('   '), false, 'invalid replacement must fail closed');
assert.equal(source.getId(), 'learner-1', 'failed replacement must not erase resolved identity');

source.clear();
assert.equal(source.getId(), null, 'clear returns identity boundary to WAIT');

console.log('Verb Explorer learner identity source: PASS — only explicit nonblank identity resolves; missing or blank identity remains WAIT; no anonymous identity is invented.');
