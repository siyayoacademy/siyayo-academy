#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const sandbox=vm.createContext({Object,String,Array});
sandbox.globalThis=sandbox;
sandbox.GreenPassAuthorityPolicy=Object.freeze({
  defaultAuthority:'legacy',
  contractAuthoritySkills:Object.freeze(['which.use.determiner']),
  fallbackAuthority:'legacy'
});
for(const file of ['js/verb-explorer-session-state-boundary.js','js/verb-explorer-adaptive-context-source.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
}

const source=sandbox.SIYAYOVerbExplorerAdaptiveContextSource;
const session=Object.freeze({decision:Object.freeze({skill:'which.use.determiner',experienceId:'shopping-for-dinner'})});
const state=Object.freeze({currentExperienceId:'shopping-for-dinner'});
const base=Object.freeze({passContract:Object.freeze({id:'which-pass'}),evidencePackets:Object.freeze([{id:'prior'}]),language:'en'});

const context=source.compose(session,state,base);
assert.ok(context);
assert.equal(context.skill,'which.use.determiner');
assert.equal(context.currentExperience,'shopping-for-dinner');
assert.equal(context.passContract,base.passContract);
assert.equal(context.evidencePackets,base.evidencePackets);
assert.equal(context.language,'en');
assert.equal(Object.isFrozen(context),true);

assert.equal(source.compose(session,state,{skill:'other.skill'}),null,'conflicting skill provenance must fail closed');
assert.equal(source.compose(session,state,{currentExperience:'nice-party'}),null,'conflicting experience provenance must fail closed');
assert.equal(source.compose(session,{currentExperienceId:'nice-party'},base),null,'Session/State disagreement must fail closed');
assert.equal(source.compose({decision:{experienceId:'shopping-for-dinner'}},state,base),null,'missing Session-owned skill must fail closed');

const legacySession=Object.freeze({decision:Object.freeze({skill:'verb-function',experienceId:'having-dinner'})});
const legacyState=Object.freeze({currentExperienceId:'having-dinner'});
const legacyContext=source.compose(legacySession,legacyState,{language:'en'});
assert.ok(legacyContext,'legacy/general fallback skill must remain available without a Pass Contract');
assert.equal(legacyContext.skill,'verb-function');
assert.equal(source.compose(legacySession,legacyState,{passContract:Object.freeze({id:'which-pass'})}),null,'legacy fallback must not masquerade as a contract-resolved skill');

const unknownSession=Object.freeze({decision:Object.freeze({skill:'unknown.skill',experienceId:'shopping-for-dinner'})});
assert.equal(source.compose(unknownSession,state,base),null,'unadopted skill must not enter contract context');

console.log('Adaptive Context provenance: PASS — contract context accepts only explicitly adopted skills while legacy fallback remains operational outside contract evaluation.');
