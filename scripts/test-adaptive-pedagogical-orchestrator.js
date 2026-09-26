const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile');
const Orchestrator = require('../js/adaptive-pedagogical-orchestrator');

const observing = Profile.createProfile('observing');
let decision = Orchestrator.decide(Profile, observing, { currentExperience: 'having-dinner' });
assert.strictEqual(decision.action, 'continue-assessment');
assert.strictEqual(decision.experienceId, 'having-dinner');
assert.strictEqual(decision.focus, 'assessment');
assert.strictEqual(decision.skill, undefined, 'general assessment without resolved skill must remain skill-less');

decision = Orchestrator.decide(Profile, observing, {
  currentExperience: 'shopping-for-dinner',
  skill: 'which.use.determiner'
});
assert.strictEqual(decision.action, 'continue-assessment');
assert.strictEqual(decision.experienceId, 'shopping-for-dinner');
assert.strictEqual(decision.skill, 'which.use.determiner', 'explicitly resolved context skill must propagate into assessment decision');

const reviewing = Profile.createProfile('reviewing');
Profile.record(reviewing, {
  source: 'multilingual-contrast-verifier',
  status: 'contrast-unresolved',
  requiresReview: true,
  requiresReinforcement: false
});
decision = Orchestrator.decide(Profile, reviewing, {
  currentExperience: 'after-dinner-conversation',
  skill: 'which.use.determiner'
});
assert.strictEqual(decision.action, 'continue-assessment');
assert.strictEqual(decision.focus, 'contrast-review');
assert.strictEqual(decision.experienceId, 'after-dinner-conversation');
assert.strictEqual(decision.skill, 'which.use.determiner', 'resolved context skill must survive review decisions');

const reinforcing = Profile.createProfile('reinforcing');
Profile.record(reinforcing, {
  source: 'multilingual-contrast-verifier',
  status: 'confirmed-interference',
  requiresReview: true,
  requiresReinforcement: true
}, {
  confirmed: true,
  language: 'pt',
  chapter: 'verbs',
  skill: 'auxiliary-be'
});
decision = Orchestrator.decide(Profile, reinforcing);
assert.strictEqual(decision.action, 'reinforce');
assert.strictEqual(decision.language, 'pt');
assert.strictEqual(decision.chapter, 'verbs');
assert.strictEqual(decision.skill, 'auxiliary-be');
assert.strictEqual(decision.experienceId, 'preparing-dinner');
assert.strictEqual(decision.focus, 'describing');
assert.strictEqual(decision.questionWord, 'what');

console.log('Adaptive pedagogical orchestration: PASS');
