#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

let location='shopping-for-dinner',moves=0,births=0,configurations=0;
const sandbox=vm.createContext({Object});
sandbox.globalThis=sandbox;
sandbox.SIYAYOVerbExplorerTransitionRuntime={execute(){moves++;throw new Error('Adoption must never navigate');}};
sandbox.SIYAYOVerbExplorerNextSessionSource={begin(){births++;return {decision:{skill:'which.use.determiner',experienceId:'preparing-dinner'}};}};
sandbox.SIYAYOVerbExplorerAdaptiveProfileSource={getProfile(){return {id:'learner'};}};
sandbox.SIYAYOVerbExplorerAdaptiveStateBridge={getState(){return {currentExperienceId:location};}};
sandbox.SIYAYOVerbExplorerAdaptiveCoordinatorConfig={configure(){configurations++;return true;}};
vm.runInContext(fs.readFileSync('js/verb-explorer-next-session-activation.js','utf8'),sandbox,{filename:'next-session-activation'});
const activate=sandbox.SIYAYOVerbExplorerNextSessionActivation.activate;
const input={
  transitionAuthorization:{status:'transition-authorized',fromExperience:'shopping-for-dinner',toExperience:'preparing-dinner'},
  previousSession:{decision:{experienceId:'shopping-for-dinner'}},
  passContract:{requiredEvidence:[]}
};
assert.equal(activate(input),null,'still visiting S1 cannot adopt S2');
assert.equal(births,0,'arrival must be checked before constructing S2');
location='having-dinner';
assert.equal(activate(input),null,'a different Experience cannot adopt S2');
assert.equal(births,0);
location='preparing-dinner';
const adopted=activate(input);
assert.equal(adopted.status,'S2_ACTIVE');
assert.equal(adopted.experienceId,'preparing-dinner');
assert.equal(births,1);
assert.equal(configurations,1);
assert.equal(moves,0,'adoption must not execute navigation');
console.log('S2 arrival adoption: PASS');
