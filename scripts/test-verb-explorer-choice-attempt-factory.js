#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const sandbox=vm.createContext({});
sandbox.globalThis=sandbox;
for(const file of ['js/choice-attempt-ownership.js','js/choice-attempt-boundary.js','js/verb-explorer-choice-attempt-factory.js']){
 vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});
}
const factory=sandbox.SIYAYOVerbExplorerChoiceAttemptFactory;
assert(factory&&typeof factory.create==='function');
const state=Object.freeze({
 currentExperienceId:'shopping-for-dinner',
 experienceLanguage:'en',
 experienceQuestion:'Which cheese should we choose?',
 experienceChoiceCandidate:'fresh-mild-cheese'
});
const learnerEvent=Object.freeze({
 observed:true,actor:'learner',source:'choice-select',occurrenceId:'choice-select:41',
 experienceId:'shopping-for-dinner',question:'Which cheese should we choose?',choice:'fresh-mild-cheese'
});
const context=Object.freeze({
 currentExperienceId:'shopping-for-dinner',experienceLanguage:'en',
 experienceQuestion:'Which cheese should we choose?',experienceChoiceCandidate:'fresh-mild-cheese'
});
const evidence=Object.freeze({dimension:'choice-function',result:'pass',context});
const support=Object.freeze({value:'none',context});
const attempt=factory.create({learnerEvent,state,evidence,support});
assert(attempt,'real learner footprint should assemble an owned Choice Attempt');
assert.equal(attempt.occurrenceId,'choice-select:41');
assert.equal(attempt.dimension,'choice-function');
assert.equal(attempt.result,'pass');
assert.equal(attempt.support,'none');
assert.equal('mode' in attempt,false,'factory must not borrow sentence-built mode');
assert.equal(Object.isFrozen(attempt),true);
const wrongEvent=Object.freeze({...learnerEvent,choice:'aged-strong-cheese'});
assert.equal(factory.create({learnerEvent:wrongEvent,state,evidence,support}),null,'event/state choice mismatch must fail closed');
const sentenceEvidence=Object.freeze({dimension:'controlled-production',result:'pass',context});
assert.equal(factory.create({learnerEvent,state,evidence:sentenceEvidence,support}),null,'sentence evidence must remain outside Choice Attempt');
const esSupport=Object.freeze({value:'none',context:Object.freeze({...context,experienceLanguage:'es'})});
assert.equal(factory.create({learnerEvent,state,evidence,support:esSupport}),null,'mixed contextual support must fail closed');
assert.equal(factory.create({learnerEvent,state,evidence,support:null}),null,'missing support must fail closed');
console.log('Choice Attempt factory: PASS — real learner footprint establishes ownership before Choice Attempt assembly; sentence mode remains separate.');
