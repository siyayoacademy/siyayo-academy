#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({ console });
sandbox.globalThis = sandbox;
vm.runInContext(fs.readFileSync('js/verb-explorer-adaptive-psac-boundary.js', 'utf8'), sandbox, {
  filename: 'js/verb-explorer-adaptive-psac-boundary.js'
});

const boundary = sandbox.SIYAYOVerbExplorerAdaptivePSACBoundary;
assert(boundary && typeof boundary.compose === 'function');

const profile = { id: 'learner-1' };
const session = { decision: { experienceId: 'shopping-for-dinner' }, trace: [] };
const attempt = { skill: 'which.use.determiner', correct: true };
const context = { passContract: { requires: [{}] }, evidencePackets: [], experiences: [] };
const state = { currentExperienceId: 'shopping-for-dinner', experienceChoiceCandidate: 'choose' };

const direct = boundary.compose({ profile, session, attempt, context }, 'choose', state, {});
assert(direct, 'complete PSAC should be released');
assert.strictEqual(direct.profile, profile);
assert.strictEqual(direct.session, session);
assert.strictEqual(direct.attempt, attempt);
assert.strictEqual(direct.context, context);
assert.strictEqual(direct.state, state);
assert.strictEqual(direct.resumeState, state);
assert(Object.isFrozen(direct), 'released PSAC package should be frozen');

const getterCalls = [];
const viaGetters = boundary.compose({
  getProfile(choice, currentState) { getterCalls.push('P'); assert.equal(choice, 'choose'); assert.strictEqual(currentState, state); return profile; },
  getSession() { getterCalls.push('S'); return session; },
  getAttempt() { getterCalls.push('A'); return attempt; },
  getContext() { getterCalls.push('C'); return context; }
}, 'choose', state, {});
assert(viaGetters, 'grounded getter PSAC should be released');
assert.deepEqual(getterCalls, ['P', 'S', 'A', 'C']);

for (const missing of ['profile', 'session', 'attempt', 'context']) {
  const source = { profile, session, attempt, context };
  delete source[missing];
  assert.strictEqual(boundary.compose(source, 'choose', state, {}), null, 'missing ' + missing + ' must WAIT');
}

assert.strictEqual(boundary.compose({ profile, session, attempt, context }, 'choose', null, {}), null, 'missing grounded state must WAIT');
assert.strictEqual(boundary.compose(null, 'choose', state, {}), null, 'missing source must WAIT');

console.log('Verb Explorer adaptive PSAC boundary: PASS — P/S/A/C plus grounded state release one frozen package; any missing note preserves WAIT.');
