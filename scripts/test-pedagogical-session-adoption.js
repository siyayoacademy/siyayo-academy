#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

let calls=0,last=null;
const sandbox=vm.createContext({Object});
sandbox.globalThis=sandbox;
sandbox.SIYAYOVerbExplorerNextSessionActivation={activate(input){calls++;last=input;return {status:'S2_ACTIVE',experienceId:input.transitionAuthorization.toExperience};}};
vm.runInContext(fs.readFileSync('js/verb-explorer-pedagogical-session-adoption.js','utf8'),sandbox,{filename:'adoption'});
const Adoption=sandbox.SIYAYOVerbExplorerPedagogicalSessionAdoption;
const authorization={status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner'};
const base={transitionAuthorization:authorization,previousSession:{decision:{experienceId:'shopping-for-dinner'}},passContract:{requiredEvidence:[]}};

assert.equal(Adoption.activate(base),null,'navigation/authorization alone must not activate S2');
assert.equal(calls,0);
assert.equal(Adoption.activate({...base,learnerEvent:{observed:true,actor:'learner',intent:'advance',source:'toroidal-next-select',experienceId:'preparing-dinner'}}),null,'NEXT navigation event is not session adoption');
assert.equal(calls,0);
assert.equal(Adoption.activate({...base,learnerEvent:{observed:true,actor:'learner',intent:'continue-assessment',source:'pedagogical-session-adopt',experienceId:'having-dinner'}}),null,'adoption must target the authorized Experience');
assert.equal(calls,0);

const adopted=Adoption.activate({...base,learnerEvent:{observed:true,actor:'learner',intent:'continue-assessment',source:'pedagogical-session-adopt',experienceId:'preparing-dinner'}});
assert.equal(adopted.status,'S2_ACTIVE');
assert.equal(calls,1);
assert.equal(last.transitionAuthorization,authorization);

console.log('Pedagogical Session adoption: PASS — visiting/NEXT never activates S2; only an explicit learner adoption event for the authorized target may delegate to NextSessionActivation.');
