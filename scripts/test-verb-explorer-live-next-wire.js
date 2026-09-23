#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

assert.equal(
  fs.existsSync('js/verb-explorer-live-next-wire.js'),
  true,
  'LiveNextWire must exist'
);

function makeTarget() {
  return {
    dataset: { nextExperience: 'preparing-dinner' },
    classList: {
      removed: [],
      remove(name) { this.removed.push(name); }
    },
    setAttribute(name, value) { this[name] = value; },
    closest(selector) { return selector === '.toroidal-next' ? this : null; }
  };
}

function runCase(label, adaptiveState) {
  const nextCard = makeTarget();
  let navigationCalls = 0;
  let progressionCalls = 0;
  let releaseCalls = 0;

  const sandbox = vm.createContext({
    Object,
    document: {
      getElementById(id) { return id === 'nextExperience' ? nextCard : null; }
    },
    SIYAYOVerbExplorerExperienceNavigation: Object.freeze({
      goToExperience(id) {
        navigationCalls += 1;
        assert.equal(id, 'preparing-dinner');
        return true;
      }
    }),
    AdaptiveProgressionDecision: Object.freeze({
      resolve() { progressionCalls += 1; throw new Error('navigation must not ask progression authority'); }
    }),
    SIYAYOVerbExplorerAdaptiveCoordinator: Object.freeze({
      snapshot() { return adaptiveState; },
      releaseProgression() { releaseCalls += 1; throw new Error('navigation must not release progression'); }
    })
  });
  sandbox.globalThis = sandbox;

  vm.runInContext(
    fs.readFileSync('js/verb-explorer-live-next-wire.js', 'utf8'),
    sandbox,
    { filename: 'js/verb-explorer-live-next-wire.js' }
  );

  const wire = sandbox.SIYAYOVerbExplorerLiveNextWire;
  assert.equal(wire.install({ document: sandbox.document }), true);
  const result = nextCard.onclick();

  assert.equal(result.status, 'NAVIGATED', label + ': NEXT must navigate');
  assert.equal(navigationCalls, 1, label + ': exactly one canonical navigation');
  assert.equal(progressionCalls, 0, label + ': Green Pass/progression must not gate content');
  assert.equal(releaseCalls, 0, label + ': Coordinator must not own content access');
  assert.equal(nextCard.role, 'button');
  assert.equal(nextCard['aria-label'], 'Continue to the next Experience');
  assert.equal(nextCard.dataset.nextState, 'available');
}

runCase('anonymous/no Session', null);
runCase('identified but pedagogically pending', {
  session: { decision: { experienceId: 'shopping-for-dinner' } },
  lastConvergenceResult: null
});
runCase('identified and pedagogically supported', {
  session: { decision: { experienceId: 'shopping-for-dinner' } },
  lastConvergenceResult: { status: 'CANDIDATE_SUPPORTED_FOR_CONSIDERATION' }
});

console.log(
  'Verb Explorer LIVE NEXT wire: PASS — canonical NEXT navigation remains available anonymously and independently of Session, Coordinator, convergence, and Green Pass.'
);
