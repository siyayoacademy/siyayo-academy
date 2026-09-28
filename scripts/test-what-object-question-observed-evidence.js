#!/usr/bin/env node
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = require('../js/adaptive-what-object-question-probe-specification-source.js');
const result = require('../js/adaptive-what-object-question-probe-result.js');
const evidenceBridge = require('../js/adaptive-what-object-question-probe-evidence-bridge.js');
const attemptBoundary = require('../js/adaptive-what-object-question-probe-attempt-boundary.js');
const seed = require('../data/learning/experience-seeds.json').items;
const skill = require('../data/learning/skills/what.json');
const nouns = require('../data/lexicon/nouns/nouns.json');
const sandbox = {};
vm.runInNewContext(fs.readFileSync('js/verb-explorer-learner-event.js', 'utf8'), sandbox);
const events = sandbox.SIYAYOVerbExplorerLearnerEvent;
const none = {support: () => 'none'};

for (const language of ['en', 'es', 'pt']) {
  const specs = source.resolve(skill, seed[1], seed[2], nouns, language);
  assert.ok(specs);
  for (const spec of [specs.functionProbe, specs.localProbe, specs.transferProbe]) {
    const selected = spec.expectedAlternativeId || spec.expectedAlternativeIds[0];
    const event = events.fromWhatObjectQuestionProbeSelect(selected, {
      skill: spec.skill, dimension: spec.dimension, mode: spec.mode,
      language: spec.language, currentExperienceId: spec.experienceId,
      fromExperienceId: spec.fromExperienceId
    });
    assert.ok(event);
    const outcome = result.evaluate(spec, event);
    assert.equal(outcome.result, 'pass');
    const evidence = evidenceBridge.fromResult({result: outcome, learnerEvent: event, supportSensor: none});
    assert.equal(evidence.result, 'pass');
    const attempt = attemptBoundary.assemble({learnerEvent: event, evidence});
    assert.equal(attempt.skill, skill.id);
    assert.equal(attempt.context.experienceId, spec.experienceId);
    assert.equal(attempt.mode, spec.mode === 'transfer' ? 'transfer' : undefined);
    assert.equal(attempt.support, 'none');
    assert.equal(result.evaluate(spec, {...event, observed: false}), null);
    assert.equal(result.evaluate(spec, {...event, experienceId: 'shopping-for-dinner'}), null);
    assert.equal(result.evaluate(spec, {...event, language: language === 'en' ? 'es' : 'en'}), null);
    assert.equal(evidenceBridge.fromResult({result: outcome, learnerEvent: {...event, occurrenceId: 'other'}, supportSensor: none}), null);
    assert.equal(attemptBoundary.assemble({learnerEvent: event, evidence: {...evidence, support: ''}}), null);
    if (spec.mode === 'transfer') {
      assert.equal(result.evaluate(spec, {...event, fromExperienceId: 'shopping-for-dinner'}), null);
      assert.equal(attemptBoundary.assemble({learnerEvent: event, evidence: {
        ...evidence, context: {...evidence.context, fromExperienceId: 'shopping-for-dinner'}
      }}), null);
    }
  }
  const local = specs.localProbe;
  const incorrect = events.fromWhatObjectQuestionProbeSelect('salmon', {
    skill: local.skill, dimension: local.dimension, mode: local.mode,
    language, currentExperienceId: local.experienceId
  });
  assert.equal(result.evaluate(local, incorrect).result, 'fail');
}
assert.equal(events.fromWhatObjectQuestionProbeSelect('carrots', {
  skill: skill.id, dimension: 'object-answer', mode: 'transfer', language: 'en',
  currentExperienceId: 'preparing-dinner', fromExperienceId: 'shopping-for-dinner'
})?.source, 'what-object-question-probe-select');
// A separate event source still cannot turn the old S1 transfer into an S2 WHAT result.
assert.equal(result.evaluate(source.resolve(skill, seed[1], seed[2], nouns, 'en').transferProbe,
  events.fromWhatObjectQuestionProbeSelect('carrots', {
    skill: skill.id, dimension: 'object-answer', mode: 'transfer', language: 'en',
    currentExperienceId: 'preparing-dinner', fromExperienceId: 'shopping-for-dinner'
  })), null);
console.log('PASS — explicit WHAT learner events yield bounded results, Evidence and Attempts; S1 cannot be replayed.');
