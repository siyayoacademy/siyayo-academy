const assert = require('assert');
const ResumeContext = require('../js/adaptive-resume-context.js');

const state = {
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceTense: 'present',
  experienceForm: 'interrogative',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceChoiceCandidate: 'cheese',
  experienceWordType: 'verb',
  experienceNounId: null,
  experienceAdjectiveId: null,
  lineOffset: 6
};

const snapshot = ResumeContext.captureResumeContext(state);
assert.ok(snapshot);
assert.ok(Object.isFrozen(snapshot));
assert.deepStrictEqual(snapshot, state);

state.experienceQuestion = 0;
state.lineOffset = 0;
assert.strictEqual(snapshot.experienceQuestion, 3);
assert.strictEqual(snapshot.lineOffset, 6);

const waiting = ResumeContext.evaluateResumeContext(snapshot, { status: 'RESUME_NOT_ELIGIBLE', experienceId: 'shopping-for-dinner' });
assert.strictEqual(waiting.status, 'RESUME_CONTEXT_PRESERVED');

const mismatch = ResumeContext.evaluateResumeContext(snapshot, { status: 'RESUME_ELIGIBLE', experienceId: 'preparing-dinner' });
assert.strictEqual(mismatch.status, 'RESUME_CONTEXT_MISMATCH');

const eligible = ResumeContext.evaluateResumeContext(snapshot, { status: 'RESUME_ELIGIBLE', experienceId: 'shopping-for-dinner' });
assert.strictEqual(eligible.status, 'RESUME_CONTEXT_ELIGIBLE');
assert.strictEqual(eligible.scope, 'preserved-experience-context');
assert.strictEqual(eligible.snapshot.experienceQuestion, 3);
assert.strictEqual(eligible.snapshot.lineOffset, 6);

assert.strictEqual(Object.prototype.hasOwnProperty.call(eligible, 'resumeExecuted'), false);
assert.strictEqual(Object.prototype.hasOwnProperty.call(eligible, 'nextExperience'), false);

console.log('Adaptive resume context: PASS — resume eligibility can bind to a preserved internal Experience snapshot without executing RESUME, restarting the Experience, or selecting NEXT.');
