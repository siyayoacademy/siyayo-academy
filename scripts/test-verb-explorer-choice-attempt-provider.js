#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const state=Object.freeze({
  currentExperienceId:'shopping-for-dinner',
  experienceLanguage:'en',
  experienceQuestion:'Which cheese should we choose?',
  experienceChoiceCandidate:'fresh-mild-cheese'
});
const evidenceContext=Object.freeze({
  currentExperienceId:'shopping-for-dinner',
  experienceLanguage:'en',
  experienceQuestion:'Which cheese should we choose?',
  experienceChoiceCandidate:'fresh-mild-cheese'
});
const evidence=Object.freeze({dimension:'choice-function',result:'pass',context:evidenceContext});
const learnerEvent=Object.freeze({choice:'fresh-mild-cheese',occurrenceId:'choice-select:9'});
const documentRef=Object.freeze({id:'choice-feedback-doc'});
let factoryInput=null;
let bridgeCalls=0;
let supportCalls=0;

const sandbox=vm.createContext({Object,String});
sandbox.globalThis=sandbox;
sandbox.SIYAYOVerbExplorerChoiceEvidenceBridge=Object.freeze({
  read(currentState,doc){
    bridgeCalls+=1;
    assert.equal(currentState,state);
    assert.equal(doc,documentRef);
    return evidence;
  }
});
sandbox.SIYAYOChoiceSupportSensor=Object.freeze({
  support(currentState){
    supportCalls+=1;
    assert.equal(currentState,state);
    return 'audio';
  }
});
sandbox.SIYAYOVerbExplorerChoiceAttemptFactory=Object.freeze({
  create(input){factoryInput=input;return Object.freeze({occurrenceId:input.learnerEvent.occurrenceId,dimension:input.evidence.dimension,result:input.evidence.result,support:input.support.value});}
});

vm.runInContext(fs.readFileSync('js/verb-explorer-choice-attempt-provider.js','utf8'),sandbox,{filename:'js/verb-explorer-choice-attempt-provider.js'});
const provider=sandbox.SIYAYOVerbExplorerChoiceAttemptProvider;
const attempt=provider.getAttempt('fresh-mild-cheese',state,'choice-card',learnerEvent,documentRef);
assert(attempt,'grounded observed Choice inputs should produce an Attempt');
assert.equal(attempt.occurrenceId,'choice-select:9');
assert.equal(attempt.dimension,'choice-function');
assert.equal(attempt.result,'pass');
assert.equal(attempt.support,'audio');
assert.equal(factoryInput.learnerEvent,learnerEvent);
assert.equal(factoryInput.state,state);
assert.equal(factoryInput.evidence,evidence);
assert.equal(factoryInput.support.value,'audio');
assert.equal(factoryInput.support.context,evidenceContext);
assert.equal(Object.isFrozen(factoryInput.support),true);
assert.equal(bridgeCalls,1);
assert.equal(supportCalls,1);

assert.equal(provider.getAttempt('aged-strong-cheese',state,null,learnerEvent,documentRef),null,'choice/event mismatch must fail closed');
assert.equal(bridgeCalls,1,'mismatched choice must not read semantic evidence');
assert.equal(supportCalls,1,'mismatched choice must not read support');

const originalBridge=sandbox.SIYAYOVerbExplorerChoiceEvidenceBridge;
sandbox.SIYAYOVerbExplorerChoiceEvidenceBridge=Object.freeze({read(){return null;}});
assert.equal(provider.getAttempt('fresh-mild-cheese',state,null,learnerEvent,documentRef),null,'missing observed evidence must fail closed');
sandbox.SIYAYOVerbExplorerChoiceEvidenceBridge=originalBridge;

sandbox.SIYAYOChoiceSupportSensor=Object.freeze({support(){return '';}});
assert.equal(provider.getAttempt('fresh-mild-cheese',state,null,learnerEvent,documentRef),null,'missing contextual support must fail closed');

console.log('Choice Attempt provider: PASS — observed semantic evidence + contextual support + real learner event reach the Factory; mismatches and missing observations fail closed.');
