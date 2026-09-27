#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const sandbox=vm.createContext({Object,String});
sandbox.globalThis=sandbox;
for(const path of [
  'js/choice-attempt-ownership.js',
  'js/choice-attempt-boundary.js',
  'js/verb-explorer-choice-attempt-factory.js'
]){
  vm.runInContext(fs.readFileSync(path,'utf8'),sandbox,{filename:path});
}

const state={
  currentExperienceId:'shopping-for-dinner',
  experienceLanguage:'en',
  experienceQuestion:3,
  experienceChoiceCandidate:'fresh-mild-cheese'
};
const evidence={result:'pass',context:state};
const support={value:'none',context:state};
const Factory=sandbox.SIYAYOVerbExplorerChoiceAttemptFactory;

assert.equal(Factory.create({state,evidence,support}),null,'bootstrap/state alone must never create A');
assert.equal(Factory.create({learnerEvent:{actor:'system',occurrenceId:'choice-select:1'},state,evidence,support}),null,'non-learner event must never create A');

const learnerEvent={
  observed:true,
  actor:'learner',
  source:'choice-select',
  occurrenceId:'choice-select:1',
  choice:'fresh-mild-cheese',
  experienceId:'shopping-for-dinner'
};
const attempt=Factory.create({learnerEvent,state,evidence,support});
assert.ok(attempt,'real learner event should permit A when grounded evidence/support exist');
assert.equal(attempt.occurrenceId,learnerEvent.occurrenceId);
assert.equal(attempt.dimension,'choice-function');
assert.equal(attempt.result,'pass');
assert.equal(attempt.context.currentExperienceId,'shopping-for-dinner');

const bootstrap=fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js','utf8');
const ownership=bootstrap.indexOf("SIYAYOChoiceAttemptOwnership");
const boundary=bootstrap.indexOf("SIYAYOChoiceAttemptBoundary");
const evidenceBridge=bootstrap.indexOf("SIYAYOVerbExplorerChoiceEvidenceBridge");
const factory=bootstrap.indexOf("SIYAYOVerbExplorerChoiceAttemptFactory");
const provider=bootstrap.indexOf("SIYAYOVerbExplorerChoiceAttemptProvider");
assert.ok(ownership>=0&&boundary>ownership&&evidenceBridge>boundary&&factory>evidenceBridge&&provider>factory,'bootstrap must load event-time Attempt authorities before provider');

console.log('Choice Attempt event-time boundary: PASS — bootstrap cannot create A; a grounded real learner event can.');
