#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const which = require('../data/learning/skills/which.json');

const code = fs.readFileSync('js/verb-explorer-canonical-skill-source.js', 'utf8');
const sandbox = vm.createContext({ console });
sandbox.globalThis = sandbox;
sandbox.GreenPassAuthorityPolicy = Object.freeze({
  contractAuthoritySkills: Object.freeze(['which.use.determiner'])
});
vm.runInContext(code, sandbox, { filename: 'js/verb-explorer-canonical-skill-source.js' });

const source = sandbox.SIYAYOVerbExplorerCanonicalSkillSource;
assert(source && typeof source.adopt === 'function');
assert.equal(source.getSkill(), null, 'canonical skill source starts in WAIT');
assert.equal(source.getPassContract(), null);
assert.equal(source.adopt(null), false, 'missing definition must WAIT');
assert.equal(source.adopt({ id: 'which.use.determiner' }), false, 'definition without Pass Contract must WAIT');
assert.equal(source.adopt({ id: 'not.adopted', passContract: {} }), false, 'non-adopted contract skill must WAIT');

assert.equal(source.adopt(which), true, 'explicit adopted canonical definition may resolve');
assert.strictEqual(source.getDefinition(), which, 'definition identity must be preserved');
assert.equal(source.getSkill(), 'which.use.determiner');
assert.strictEqual(source.getPassContract(), which.passContract, 'Pass Contract must come from canonical definition');

assert.equal(source.adopt({ id: 'not.adopted', passContract: {} }), false, 'invalid replacement must fail closed');
assert.strictEqual(source.getDefinition(), which, 'failed replacement must not erase resolved definition');

source.clear();
assert.equal(source.getDefinition(), null, 'clear returns canonical skill boundary to WAIT');

const noPolicy = vm.createContext({ console });
noPolicy.globalThis = noPolicy;
vm.runInContext(code, noPolicy, { filename: 'js/verb-explorer-canonical-skill-source.js' });
assert.equal(noPolicy.SIYAYOVerbExplorerCanonicalSkillSource.adopt(which), false, 'missing authority policy must WAIT');

console.log('Verb Explorer canonical skill source: PASS — only explicit adopted definitions with Pass Contract resolve; unresolved or unauthorized definitions remain WAIT.');
