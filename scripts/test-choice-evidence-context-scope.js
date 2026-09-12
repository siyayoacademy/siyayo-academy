#!/usr/bin/env node
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const resolver = require('../js/contextual-choice-resolver.js');
const experiences = require('../data/learning/experience-seeds.json');

const q = experiences.items.find(x => x.id === 'shopping-for-dinner').thinkingMind.find(x => x.questionWord === 'which');
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/choice-evidence-evaluator.js', 'utf8'), sandbox);
const evaluate = sandbox.SIYAYOChoiceEvidenceEvaluator.evaluate;

const context = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 2,
  experienceChoiceCandidate: 'fresh-mild-cheese'
};

const resolution = resolver.resolveChoice(q.choiceContext, 'fresh-mild-cheese', 'en');
assert.equal(evaluate(resolution, null), null);

const evidence = evaluate(resolution, context);
assert.equal(evidence.dimension, 'choice-function');
assert.equal(evidence.result, 'pass');
assert.deepEqual(evidence.context, context);
assert.notEqual(evidence.context, context);
assert.equal(Object.isFrozen(evidence.context), true);

console.log('Choice evidence context scope: PASS — result requires and preserves a detached grounded Experience + Language + Question + Choice context.');
