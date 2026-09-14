#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const code=fs.readFileSync('js/learner-identity-authority.js','utf8');
const sandbox=vm.createContext({Object});
sandbox.globalThis=sandbox;
vm.runInContext(code,sandbox,{filename:'js/learner-identity-authority.js'});
const authority=sandbox.SIYAYOLearnerIdentityAuthority;

assert.equal(authority.getIdentity(),null,'identity must begin unresolved');
assert.equal(authority.getLearnerId(),null,'missing authority identity is WAIT');

assert.equal(authority.establish({learnerId:' learner-01 '}),true);
assert.equal(authority.getLearnerId(),'learner-01','authority owns canonical learner id normalization');
assert.deepEqual({...authority.getIdentity()},{learnerId:'learner-01'});
assert.equal(Object.isFrozen(authority.getIdentity()),true);

for(const invalid of [null,undefined,{}, {learnerId:null},{learnerId:''},{learnerId:'   '},{learnerId:42}]){
  assert.equal(authority.establish(invalid),false,'invalid identity must be rejected');
  assert.equal(authority.getLearnerId(),'learner-01','invalid replacement must not erase valid identity');
}

authority.clear();
assert.equal(authority.getLearnerId(),null,'clear returns authority to WAIT');

console.log('Learner Identity Authority: PASS — explicit canonical learnerId only; missing/invalid identity remains WAIT; no identity invention.');
