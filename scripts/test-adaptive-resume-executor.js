#!/usr/bin/env node

const assert = require('node:assert/strict');
const ResumeExecutor = require('../js/adaptive-resume-executor.js');

const snapshot = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceTense: 'present',
  experienceForm: 'interrogative',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceChoiceCandidate: 'choose',
  experienceWordType: 'verb',
  experienceNounId: 'cheese',
  experienceAdjectiveId: null,
  lineOffset: 6
});

const eligible = {
  status: 'RESUME_CONTEXT_ELIGIBLE',
  scope: 'preserved-experience-context',
  snapshot
};

assert.deepEqual(ResumeExecutor.executeResume(null, null), {
  status: 'RESUME_NOT_EXECUTED',
  reason: 'resume-context-not-eligible'
});

let calls = 0;
const runtime = {
  restoredSnapshot: null,
  restoreContext(received) {
    calls += 1;
    this.restoredSnapshot = received;
    return true;
  }
};

const executed = ResumeExecutor.executeResume(eligible, runtime);
assert.equal(calls, 1);
assert.strictEqual(runtime.restoredSnapshot, snapshot);
assert.deepEqual(executed, {
  status: 'RESUME_EXECUTED',
  reason: 'preserved-context-restored',
  experienceId: 'shopping-for-dinner',
  scope: 'preserved-experience-context'
});

assert.deepEqual(ResumeExecutor.executeResume(eligible, {}), {
  status: 'RESUME_NOT_EXECUTED',
  reason: 'resume-runtime-restore-unavailable'
});

assert.deepEqual(ResumeExecutor.executeResume(eligible, { restoreContext: () => false }), {
  status: 'RESUME_NOT_EXECUTED',
  reason: 'resume-runtime-restore-not-confirmed'
});

assert.strictEqual(Object.prototype.hasOwnProperty.call(executed, 'nextExperience'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(executed, 'restartExperience'), false);

console.log('Adaptive resume executor: PASS — eligible preserved context may be restored exactly once without selecting NEXT or restarting the Experience.');
