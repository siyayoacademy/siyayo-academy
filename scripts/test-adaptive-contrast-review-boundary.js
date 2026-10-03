const assert = require('assert');
const Boundary = require('../js/adaptive-contrast-review-boundary');

const key = 'pt:esquesito:interference-hypothesis:';
const decision = {
  action: 'continue-assessment',
  focus: 'contrast-review',
  experienceId: 'after-dinner-conversation'
};
const candidate = {
  status: 'pattern-observed',
  repeated: [{ key, occurrences: 2 }]
};

const probe = Boundary.open(decision, candidate);
assert.ok(probe);
assert.deepStrictEqual(probe.pattern, { key, occurrences: 2 });
assert.strictEqual(probe.experienceId, 'after-dinner-conversation');
assert.ok(Object.isFrozen(probe));
assert.ok(Object.isFrozen(probe.pattern));

assert.strictEqual(Boundary.open({ action: 'continue-assessment', focus: 'assessment' }, candidate), null);
assert.strictEqual(Boundary.open(decision, { repeated: [] }), null);
assert.strictEqual(Boundary.open(decision, { repeated: [{ key: '', occurrences: 2 }] }), null);
assert.strictEqual(Boundary.open(decision, { repeated: [{ key, occurrences: 1 }] }), null);
assert.strictEqual(Boundary.open(decision, { repeated: [{ key, occurrences: 2 }, { key: 'other', occurrences: 2 }] }), null);

const learnerEvent = Object.freeze({
  observed: true,
  actor: 'learner',
  type: 'learner-response',
  source: 'choice-select',
  occurrenceId: 'choice-select:7',
  choice: 'example',
  experienceId: 'after-dinner-conversation'
});
const correlation = Boundary.correlate(probe, learnerEvent);
assert.ok(correlation);
assert.strictEqual(correlation.pattern, probe.pattern);
assert.strictEqual(correlation.learnerEvent, learnerEvent);
assert.ok(Object.isFrozen(correlation));

assert.strictEqual(Boundary.correlate(probe, { ...learnerEvent, observed: false }), null);
assert.strictEqual(Boundary.correlate(probe, { ...learnerEvent, actor: 'system' }), null);
assert.strictEqual(Boundary.correlate(probe, { ...learnerEvent, occurrenceId: '' }), null);
assert.strictEqual(Boundary.correlate(probe, { ...learnerEvent, experienceId: 'shopping-for-dinner' }), null);
assert.strictEqual(Boundary.correlate(probe, { observed: true, actor: 'learner', occurrenceId: 'choice-select:8' }), null);

console.log('Adaptive contrast review boundary: PASS');
