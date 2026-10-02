#!/usr/bin/env node
const assert=require('node:assert/strict');
const progress=require('../js/adaptive-pass-contract-progress-view.js');
const evaluator=require('../js/green-pass-profile.js');
const contract=require('../data/learning/skills/which.json').passContract;
const choice={dimension:'choice-function',result:'pass',support:'none'};
const local={mode:'local',dimension:'determiner-use',result:'pass',support:'none'};
const transfer={dimension:'determiner-use',result:'pass',support:'none',mode:'transfer'};
for(const [packets,expected,status] of [
  [[],0,'WAITING_FOR_EVIDENCE'],
  [[choice],1,'WAITING_FOR_EVIDENCE'],
  [[choice,local],2,'WAITING_FOR_EVIDENCE'],
  [[choice,local,transfer],3,'GREEN_PASS']
]){
  const projected=progress.project(contract,packets,evaluator);
  assert.equal(projected.completed,expected);
  assert.equal(projected.total,3);
  assert.equal(projected.status,status);
}
assert.equal(progress.project(contract,[choice,{...local,support:'audio'}],evaluator).completed,1,
  'supported probe cannot count as independent unassisted use');
assert.equal(progress.project(contract,[choice,local,{...transfer,support:'audio'}],evaluator).completed,2,
  'supported transfer cannot close Green');
assert.equal(progress.project(contract,[],null),null);
console.log('Pass Contract progress view: PASS — 0/3 to 3/3 only from canonical accepted evidence.');
