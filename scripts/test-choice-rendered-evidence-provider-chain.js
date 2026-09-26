#!/usr/bin/env node
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function card(classes,p){return {classList:{contains:x=>classes.includes(x)},querySelector:q=>q==='p'&&p?{textContent:p}:null};}
function doc(valid,score){const canonical=card(valid?['is-valid']:['is-invalid']);const contextual=card(['is-contextual'],score);return {getElementById:id=>id==='choiceFeedback'?{querySelector:q=>q.includes('is-valid')?canonical:q.includes('is-contextual')?contextual:null}:null};}

const state=Object.freeze({currentExperienceId:'shopping-for-dinner',experienceLanguage:'en',experienceQuestion:0,experienceChoiceCandidate:'fresh-mild-cheese'});
const event=Object.freeze({source:'choice-select',choice:'fresh-mild-cheese',occurrenceId:'choice-select:1'});
let factoryInput=null;
const sandbox=vm.createContext({Object,Number,String});sandbox.globalThis=sandbox;
sandbox.SIYAYOChoiceEvidenceEvaluator=Object.freeze({evaluate(result,context){if(result.canonicalForm.valid!==true)return Object.freeze({dimension:'choice-function',result:'fail',context});return result.contextualResponse.score===result.contextualResponse.possibleScore?Object.freeze({dimension:'choice-function',result:'pass',context}):null;}});
sandbox.SIYAYOChoiceSupportSensor=Object.freeze({support:s=>s===state?'none':null});
sandbox.SIYAYOVerbExplorerChoiceAttemptFactory=Object.freeze({create(input){factoryInput=input;return Object.freeze({kind:'choice-attempt',evidence:input.evidence,support:input.support});}});
for(const file of ['js/verb-explorer-choice-resolution-reader.js','js/verb-explorer-choice-evidence-bridge.js','js/verb-explorer-choice-attempt-provider.js'])vm.runInContext(fs.readFileSync(file,'utf8'),sandbox,{filename:file});

const provider=sandbox.SIYAYOVerbExplorerChoiceAttemptProvider;
const attempt=provider.getAttempt('fresh-mild-cheese',state,null,event,doc(true,'4 / 4'));
assert.ok(attempt);
assert.equal(factoryInput.evidence.dimension,'choice-function');
assert.equal(factoryInput.evidence.result,'pass');
assert.equal(factoryInput.support.value,'none');
assert.equal(factoryInput.support.context,state);
assert.equal(factoryInput.learnerEvent,event);

factoryInput=null;
assert.equal(provider.getAttempt('fresh-mild-cheese',state,null,event,doc(true,'0 / 4')),null,'contextually incomplete rendered result must not become pass evidence');
assert.equal(factoryInput,null);
assert.equal(provider.getAttempt('fresh-mild-cheese',state,null,event,{getElementById:()=>null}),null,'missing rendered feedback must fail closed');

console.log('Rendered Choice evidence -> Attempt Provider: PASS — rendered semantic result is read once, interpreted as grounded evidence, and only then reaches A; incomplete/missing feedback fails closed.');
