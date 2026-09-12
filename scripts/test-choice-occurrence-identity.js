const assert = require('node:assert/strict');

// Contract-first specification for the missing learner-occurrence identity.
// Context coordinates tell us WHERE an action happened; occurrence identity
// must additionally distinguish repeated actions in that exact same context.
const sameContext = Object.freeze({
  currentExperienceId: 'shopping-for-dinner',
  experienceLanguage: 'en',
  experienceQuestion: 'Which cheese should we choose?',
  experienceChoiceCandidate: 'fresh-mild-cheese'
});

function requireOccurrenceIdentity(event) {
  return event && typeof event.occurrenceId === 'string' && event.occurrenceId.trim()
    ? event.occurrenceId.trim()
    : null;
}

const firstChoice = Object.assign({ type: 'choice-select' }, sameContext);
const secondChoice = Object.assign({ type: 'choice-select' }, sameContext);

// Current production events have no occurrence identity yet. This assertion is
// intentionally RED until a real producer creates a stable identity per action.
assert.ok(requireOccurrenceIdentity(firstChoice),
  'first repeated choice must carry a grounded occurrence identity');
assert.ok(requireOccurrenceIdentity(secondChoice),
  'second repeated choice must carry a grounded occurrence identity');
assert.notEqual(firstChoice.occurrenceId, secondChoice.occurrenceId,
  'two identical actions in the same context must remain distinguishable');

// Evidence emitted from one occurrence must be correlatable without relying on
// timestamps or mutable current state.
const support = Object.assign({ type: 'choice-audio', occurrenceId: firstChoice.occurrenceId }, sameContext);
const evidence = Object.assign({ dimension: 'choice-function', result: 'pass', occurrenceId: firstChoice.occurrenceId }, sameContext);
assert.equal(support.occurrenceId, evidence.occurrenceId,
  'components from the same learner occurrence must share identity');

console.log('Choice occurrence identity contract: GREEN');
