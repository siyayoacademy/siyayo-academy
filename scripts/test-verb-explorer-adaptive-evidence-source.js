const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const profileCode=fs.readFileSync('js/adaptive-evidence-profile.js','utf8');
const sourceCode=fs.readFileSync('js/verb-explorer-adaptive-evidence-source.js','utf8');
const sandbox={SIYAYOVerbExplorerXespiritoEvidenceBridge:{interpret:()=>({
 signals:[{piece:'auxiliary-have',occurrences:2,status:'requires-reinforcement'}],
 conflictEvidenceCount:2,
 hasReinforcementSignal:true
})}};
vm.createContext(sandbox);
vm.runInContext(profileCode,sandbox);
vm.runInContext(sourceCode,sandbox);
const profile=sandbox.AdaptiveEvidenceProfile.createProfile('learner-1');
const result=sandbox.SIYAYOVerbExplorerAdaptiveEvidenceSource.record(profile,{});
assert.strictEqual(result,profile);
assert.equal(profile.observations.length,1);
assert.equal(profile.observations[0].source,'xespirito-repair-trace');
assert.equal(profile.observations[0].status,'pattern-observed');
assert.equal(profile.observations[0].requiresReinforcement,true);
assert.equal(profile.confirmedReinforcements.length,0);
assert.equal(sandbox.AdaptiveEvidenceProfile.recommend(profile).action,'observe');
console.log('Verb Explorer adaptive Evidence source: PASS — repeated evidence is recorded without inventing confirmation.');
