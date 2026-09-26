#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({});
sandbox.globalThis = sandbox;
vm.runInContext(
  fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8'),
  sandbox,
  { filename: 'js/verb-explorer-learner-event.js' }
);

const boundary = sandbox.SIYAYOVerbExplorerLearnerEvent;
assert(boundary, 'learner-event boundary should be exposed');
assert.equal(typeof boundary.fromChoiceSelect, 'function');
assert.equal(typeof boundary.fromContrastProbeSelect, 'function');
assert.equal(typeof boundary.fromSentenceBuilt, 'function');

const state = {
  currentExperienceId: 'shopping-for-dinner',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceWordType: 'verb'
};
const event = boundary.fromChoiceSelect('choose', state);

assert.equal(event.observed, true);
assert.equal(event.actor, 'learner');
assert.equal(event.relevantToWait, true);
assert.equal(event.intent, 'continue');
assert.equal(event.type, 'learner-response');
assert.equal(event.source, 'choice-select');
assert.equal(event.choice, 'choose');
assert.equal(event.experienceId, 'shopping-for-dinner');
assert.equal(event.question, 3);
assert.equal(event.perspective, 'debating');
assert.equal(event.wordType, 'verb');
assert.equal(event.occurrenceId, 'choice-select:1');
assert.equal(Object.isFrozen(event), true, 'event history record should be immutable');

const repeated = boundary.fromChoiceSelect('choose', state);
assert.equal(repeated.occurrenceId, 'choice-select:2');
assert.notEqual(repeated.occurrenceId, event.occurrenceId,
  'repeated identical choices in the same context must remain distinct occurrences');
assert.equal(Object.isFrozen(repeated), true, 'repeated event history record should remain immutable');

assert.equal(boundary.fromChoiceSelect('', state), null, 'empty choice must not create a learner event');
assert.equal(boundary.fromChoiceSelect(null, state), null, 'missing choice must not create a learner event');

const minimal = boundary.fromChoiceSelect('buy');
assert.equal(minimal.choice, 'buy');
assert.equal(minimal.occurrenceId, 'choice-select:3');
assert.equal(minimal.experienceId, null);
assert.equal(minimal.question, null);
assert.equal(minimal.perspective, null);
assert.equal(minimal.wordType, null);

const contrast = boundary.fromContrastProbeSelect('pt-esquisito', state);
assert.equal(contrast.observed, true);
assert.equal(contrast.actor, 'learner');
assert.equal(contrast.relevantToWait, true);
assert.equal(contrast.intent, 'continue');
assert.equal(contrast.type, 'learner-response');
assert.equal(contrast.source, 'contrast-probe-select');
assert.equal(contrast.choice, 'pt-esquisito');
assert.equal(contrast.experienceId, 'shopping-for-dinner');
assert.equal(contrast.occurrenceId, 'contrast-probe-select:1');
assert.equal(contrast.selectedLanguage, undefined, 'selectedLanguage is derived later from ProbeDefinition by ProbeResult');
assert.equal(Object.isFrozen(contrast), true, 'contrast-probe event history record should be immutable');
const contrastRepeated = boundary.fromContrastProbeSelect('pt-esquisito', state);
assert.equal(contrastRepeated.occurrenceId, 'contrast-probe-select:2');
assert.notEqual(contrastRepeated.occurrenceId, contrast.occurrenceId);
assert.equal(boundary.fromContrastProbeSelect('', state), null);
assert.equal(boundary.fromContrastProbeSelect(null, state), null);

const sentenceState = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 2,
  experienceChoiceCandidate: 'fresh-mild-cheese'
};
const sentenceBuilt = boundary.fromSentenceBuilt({
  canonicalCandidate: true,
  systemStructure: true
}, sentenceState);

assert(sentenceBuilt, 'grounded canonical BUILD SENTENCE should create an observation');
assert.equal(sentenceBuilt.observed, true);
assert.equal(sentenceBuilt.actor, 'learner');
assert.equal(sentenceBuilt.type, 'sentence-built');
assert.equal(sentenceBuilt.source, 'build-sentence');
assert.equal(sentenceBuilt.canonicalCandidate, true);
assert.equal(sentenceBuilt.systemStructure, true);
assert.equal(sentenceBuilt.currentExperienceId, 'shopping-for-dinner');
assert.equal(sentenceBuilt.experienceLanguage, 'en');
assert.equal(sentenceBuilt.experienceQuestion, 2);
assert.equal(sentenceBuilt.experienceChoiceCandidate, 'fresh-mild-cheese');
assert.equal(Object.isFrozen(sentenceBuilt), true, 'sentence-built observation should be immutable');
assert.equal(boundary.fromSentenceBuilt({canonicalCandidate:true,systemStructure:true}, {
  currentExperienceId:'shopping-for-dinner',
  experienceLanguage:'',
  experienceQuestion:2,
  experienceChoiceCandidate:'fresh-mild-cheese'
}), null, 'ungrounded sentence-built observation must fail closed');

console.log('Verb Explorer learner event: PASS — Choice and contrast-probe observations own distinct immutable occurrence identities; empty choices create none.');
console.log('Sentence-built learner event: PASS — grounded canonical system composition is observed immutably and ungrounded composition fails closed.');
