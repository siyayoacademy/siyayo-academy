#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const executorSource = fs.readFileSync(path.join(ROOT, 'js/adaptive-resume-executor.js'), 'utf8');
const bridgeSource = fs.readFileSync(path.join(ROOT, 'js/verb-explorer-resume-runtime.js'), 'utf8');

const state = {
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
};

let renderCalls = 0;
let goToExperienceCalls = 0;
const sandbox = {
  console,
  experiences: [{ id: 'shopping-for-dinner' }, { id: 'preparing-dinner' }],
  renderExperience() { renderCalls += 1; },
  goToExperience() { goToExperienceCalls += 1; }
};
Object.assign(sandbox, state);
vm.createContext(sandbox);
vm.runInContext(executorSource, sandbox);
vm.runInContext(bridgeSource, sandbox);

const bridge = sandbox.SIYAYOVerbExplorerResumeRuntime;
assert.ok(bridge, 'Verb Explorer resume bridge must be exposed');

const preserved = bridge.captureContext();
assert.deepEqual(JSON.parse(JSON.stringify(preserved)), state);

// Simulate movement away from the exact WHICH learning position while staying in runtime.
sandbox.experienceLanguage = 'pt';
sandbox.experienceTense = 'future';
sandbox.experienceForm = 'affirmative';
sandbox.experienceQuestion = 0;
sandbox.experiencePerspective = null;
sandbox.experienceChoiceCandidate = null;
sandbox.experienceWordType = 'noun';
sandbox.experienceNounId = null;
sandbox.lineOffset = 0;

const result = bridge.execute({
  status: 'RESUME_CONTEXT_ELIGIBLE',
  scope: 'preserved-experience-context',
  snapshot: preserved
});

assert.equal(result.status, 'RESUME_EXECUTED');
assert.equal(result.experienceId, 'shopping-for-dinner');
assert.equal(renderCalls, 1, 'resume must rerender the preserved Experience exactly once');
assert.equal(goToExperienceCalls, 0, 'resume must never restart through goToExperience');
assert.deepEqual(JSON.parse(JSON.stringify(bridge.captureContext())), state, 'WHICH context must be restored field-for-field');
assert.equal(sandbox.experienceChoiceCandidate, 'choose');
assert.equal(sandbox.experiencePerspective, 'debating');
assert.equal(sandbox.experienceQuestion, 3);
assert.equal(sandbox.lineOffset, 6);
assert.equal(Object.prototype.hasOwnProperty.call(result, 'nextExperience'), false, 'resume must not fabricate NEXT');

console.log('Verb Explorer WHICH resume bridge: PASS — preserved WHICH context restored without restart or NEXT.');
