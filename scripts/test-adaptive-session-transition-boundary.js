const assert = require('assert');
const Boundary = require('../js/adaptive-session-transition-boundary.js');

const currentSession = {
  decision: {
    action: 'continue-assessment',
    experienceId: 'shopping-for-dinner',
    skill: 'which.use.determiner'
  },
  trace: [{ event: 'experience-selected' }]
};

const selectedAdvance = {
  action: 'advance',
  status: 'selected',
  experienceId: 'preparing-dinner',
  fromExperience: 'shopping-for-dinner',
  entryVerb: 'prepare',
  title: 'Preparing Dinner'
};

assert.strictEqual(Boundary.authorize({ currentSession }), null);
assert.strictEqual(Boundary.authorize({
  currentSession,
  nextDecision: {
    action: 'advance', experienceId: 'preparing-dinner', skill: 'which.use.determiner'
  }
}), null, 'Decision without resolved advance must WAIT');
assert.strictEqual(Boundary.authorize({
  currentSession,
  advanceSelection: selectedAdvance,
  nextDecision: {
    action: 'continue-assessment', experienceId: 'preparing-dinner', skill: 'which.use.determiner'
  }
}), null, 'continue-assessment must never release S');
assert.strictEqual(Boundary.authorize({
  currentSession,
  advanceSelection: { ...selectedAdvance, status: 'next-experience-required' },
  nextDecision: {
    action: 'advance', experienceId: 'preparing-dinner', skill: 'which.use.determiner'
  }
}), null);
assert.strictEqual(Boundary.authorize({
  currentSession,
  advanceSelection: { ...selectedAdvance, fromExperience: 'having-dinner' },
  nextDecision: {
    action: 'advance', experienceId: 'preparing-dinner', skill: 'which.use.determiner'
  }
}), null, 'advance must originate at active S Experience');
assert.strictEqual(Boundary.authorize({
  currentSession,
  advanceSelection: selectedAdvance,
  nextDecision: {
    action: 'advance', experienceId: 'having-dinner', skill: 'which.use.determiner'
  }
}), null, 'Decision target must equal selected canonical next Experience');
assert.strictEqual(Boundary.authorize({
  currentSession,
  advanceSelection: selectedAdvance,
  nextDecision: { action: 'advance', experienceId: 'preparing-dinner' }
}), null, 'active canonical skill must not disappear across transition');

const nextDecision = {
  action: 'advance',
  experienceId: 'preparing-dinner',
  skill: 'which.use.determiner',
  focus: 'assessment'
};
const authorization = Boundary.authorize({ currentSession, advanceSelection: selectedAdvance, nextDecision });
assert.ok(authorization);
assert.strictEqual(authorization.status, 'transition-authorized');
assert.strictEqual(authorization.fromExperience, 'shopping-for-dinner');
assert.strictEqual(authorization.toExperience, 'preparing-dinner');
assert.strictEqual(authorization.advanceSelection, selectedAdvance);
assert.strictEqual(authorization.nextDecision, nextDecision);
assert.strictEqual(currentSession.decision.experienceId, 'shopping-for-dinner');
assert.strictEqual(currentSession.trace.length, 1);

console.log('PASS adaptive session transition boundary fails closed unless an explicit selected advance grounds the next Decision; continue-assessment never releases S.');
