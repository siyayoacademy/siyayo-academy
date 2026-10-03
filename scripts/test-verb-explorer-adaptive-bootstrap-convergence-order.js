#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');

const source = fs.readFileSync('js/verb-explorer-adaptive-bootstrap.js', 'utf8');

function position(fragment) {
  const index = source.indexOf(fragment);
  assert.notEqual(index, -1, `bootstrap must contain ${fragment}`);
  return index;
}

const resolutionReader = position("ensureGlobal('SIYAYOVerbExplorerChoiceResolutionReader'");
const candidateGrounding = position("ensureGlobal('AdaptiveProgressionEligibility'");
const pedagogicalState = position("ensureGlobal('AdaptivePedagogicalCompletion'");
const convergence = position("ensureGlobal('AdaptiveConvergenceResolver'");
const coordinator = position("ensureGlobal('SIYAYOVerbExplorerAdaptiveCoordinator'");
const choiceWire = position("ensureGlobal('SIYAYOVerbExplorerChoiceAdaptiveWire'");

assert.ok(resolutionReader < candidateGrounding, 'candidate grounding must load after the existing resolution reader boundary');
assert.ok(candidateGrounding < pedagogicalState, 'candidate grounding must load before pedagogical state composition');
assert.ok(pedagogicalState < convergence, 'pedagogical state must load before convergence resolution');
assert.ok(convergence < coordinator, 'convergence resolver must exist before Coordinator can expose convergence');
assert.ok(coordinator < choiceWire, 'Coordinator must still load before the live choice wire');

assert.equal(source.includes("ensureGlobal('AdaptiveAdvanceSelector'"), false,
  'Verb Explorer bootstrap must not duplicate AdaptiveAdvanceSelector already owned by the generic adaptive browser runtime');

console.log('Verb Explorer adaptive bootstrap convergence order: PASS — grounding/state/convergence load before Coordinator without duplicating generic Cycle dependencies.');
