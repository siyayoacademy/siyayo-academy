const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

// Synthetic input boundary; all profile, interpretation and Session modules are real.
let trace=[
  {status:'conflict',responsiblePiece:'auxiliary-have'},
  {status:'conflict',responsiblePiece:'auxiliary-have'}
];
const box=vm.createContext({SIYAYOXespiritoBridge:{getRepairTrace:()=>trace}});
for(const name of [
  'adaptive-evidence-profile','adaptive-learning-router',
  'adaptive-pedagogical-orchestrator','adaptive-attempt-loop',
  'xespirito-evidence-interpreter','verb-explorer-xespirito-evidence-bridge',
  'verb-explorer-adaptive-evidence-profile-source',
  'verb-explorer-adaptive-evidence-source','verb-explorer-adaptive-session-source'
]) vm.runInContext(fs.readFileSync('js/'+name+'.js','utf8'),box,{filename:name});

const owner=box.SIYAYOVerbExplorerAdaptiveEvidenceProfileSource;
const recorder=box.SIYAYOVerbExplorerAdaptiveEvidenceSource;
const sessions=box.SIYAYOVerbExplorerAdaptiveSessionSource;
const context=Object.freeze({currentExperience:'having-dinner'});
assert.equal(sessions.begin(owner.getProfile(),context),null);
const profile=owner.begin('chain-test');
assert.strictEqual(recorder.record(owner.getProfile(),context),profile);
assert.equal(profile.observations.length,1);
assert.equal(profile.patterns.length,1);
assert.equal(profile.confirmedReinforcements.length,0);

// Observe identity at the consumer while retaining canonical recommendation logic.
let received=null,calls=0;
const recommend=box.AdaptiveEvidenceProfile.recommend;
box.AdaptiveEvidenceProfile.recommend=function(p){received=p;calls++;return recommend(p);};
const before=JSON.stringify(profile);
const session=sessions.begin(owner.getProfile(),context);
assert.strictEqual(received,profile);
assert.strictEqual(owner.getProfile(),profile);
assert.equal(calls,1);
assert.equal(session.decision.experienceId,'having-dinner');
assert.equal(session.decision.action,'continue-assessment');
assert.equal(session.decision.focus,'assessment');
assert.equal(session.trace.length,1);
assert.equal(session.trace[0].event,'experience-selected');
assert.equal(JSON.stringify(profile),before);

assert.equal(sessions.begin(profile,null),null);
assert.equal(sessions.begin(profile,{currentExperience:' '}),null);
assert.equal(calls,1);
trace=[];
assert.equal(recorder.record(profile,context),null);
assert.equal(JSON.stringify(profile),before);
owner.clear();
assert.equal(sessions.begin(owner.getProfile(),context),null);
assert.equal(profile.observations.length,1);
console.log('Evidence Session chain: PASS — exact profile identity reaches canonical recommendation; unconfirmed evidence stays unconfirmed; missing inputs preserve WAIT.');
