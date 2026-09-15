const assert = require('assert');
const Boundary = require('../js/adaptive-session-transition-boundary.js');

const currentSession = {
  decision: {
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  },
  trace: [{ event: 'experience-selected' }]
};

assert.strictEqual(Boundary.authorize({ currentSession }), null);
assert.strictEqual(Boundary.authorize({
  currentSession,
  nextDecision: { skill: 'which.use.determiner' }
}), null);
assert.strictEqual(Boundary.authorize({
  currentSession,
  nextDecision: {
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  }
}), null);
assert.strictEqual(Boundary.authorize({
  currentSession,
  nextDecision: { experienceId: 'another-experience' }
}), null);

const nextDecision = {
  action: 'continue-assessment',
  experienceId: 'another-experience',
  skill: 'which.use.determiner',
  focus: 'assessment'
};
const authorization = Boundary.authorize({ currentSession, nextDecision });
assert.ok(authorization);
assert.strictEqual(authorization.status, 'transition-authorized');
assert.strictEqual(authorization.fromExperience, 'shopping-for-dinner');
assert.strictEqual(authorization.toExperience, 'another-experience');
assert.strictEqual(authorization.nextDecision, nextDecision);
assert.strictEqual(currentSession.decision.experienceId, 'shopping-for-dinner');
assert.strictEqual(currentSession.trace.length, 1);

console.log('PASS adaptive session transition boundary authorizes only grounded next decisions without mutating S.');
