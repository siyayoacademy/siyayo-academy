#!/usr/bin/env node
// Focused Choice boundary checks with the production packet converter.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const Loop = require('../js/adaptive-attempt-loop.js');
const Green = require('../js/green-pass-profile.js');
const which = require('../data/learning/skills/which.json');

const sandbox = vm.createContext({ Object, AdaptiveAttemptLoop: Loop });
sandbox.globalThis = sandbox;
const path = 'js/verb-explorer-choice-evidence-packet-bridge.js';
vm.runInContext(fs.readFileSync(path, 'utf8'), sandbox, { filename: path });
const Bridge = sandbox.SIYAYOVerbExplorerChoiceEvidencePacketBridge;
const session = Object.freeze({
  decision: Object.freeze({ skill: which.id, experienceId: 'shopping-for-dinner' }),
  trace: Object.freeze([])
});
const context = Object.freeze({
  currentExperienceId: 'shopping-for-dinner', experienceLanguage: 'en',
  experienceQuestion: 3, experienceChoiceCandidate: 'choose'
});
const attempt = Object.freeze({
  occurrenceId: 'choice-select:1', dimension: 'choice-function',
  result: 'pass', support: 'none', context
});
const event = Object.freeze({
  observed: true, actor: 'learner', source: 'choice-select',
  occurrenceId: attempt.occurrenceId, experienceId: 'shopping-for-dinner',
  question: 3, choice: 'choose'
});
const input = { attempt, session, learnerEvent: event };
const before = JSON.stringify(input);
let checks = 0;
function test(name, check) {
  try { check(); checks++; }
  catch (error) { error.message = name + ': ' + error.message; throw error; }
}
function rejectBoth(name, changes) {
  test(name, () => {
    assert.equal(Bridge.fromAttempt({ ...input, ...changes }), null);
    assert.equal(Bridge.groundObservedAttempt({ ...input, ...changes }), null);
  });
}

test('production packet preserves the footprint without inferring mode', () => {
  const packet = Bridge.fromAttempt(input);
  assert.ok(packet);
  assert.equal(packet.occurrenceId, attempt.occurrenceId);
  assert.equal(packet.evidence.skill, session.decision.skill);
  for (const field of ['dimension', 'result', 'support', 'context']) {
    assert.equal(packet.evidence[field], attempt[field]);
  }
  assert.equal(Object.hasOwn(packet.evidence, 'mode'), false);
  assert.ok(Object.isFrozen(packet));
  assert.ok(Object.isFrozen(packet.evidence));
});
test('observed event grounds a copy owned by the existing Session', () => {
  const grounded = Bridge.groundObservedAttempt(input);
  assert.ok(grounded);
  assert.notEqual(grounded, attempt);
  assert.notEqual(grounded.context, context);
  assert.equal(grounded.skill, session.decision.skill);
  assert.equal(grounded.context.experienceId, session.decision.experienceId);
  assert.equal(grounded.context.occurrenceId, event.occurrenceId);
  for (const field of Object.keys(context)) {
    assert.equal(grounded.context[field], context[field]);
  }
  assert.ok(Object.isFrozen(grounded));
  assert.ok(Object.isFrozen(grounded.context));
  assert.equal(Object.hasOwn(grounded, 'mode'), false);
});
test('caller and Attempt skills cannot override the Session', () => {
  const foreign = { ...input, skill: 'foreign-input', attempt: { ...attempt, skill: 'foreign-attempt' } };
  const packet = Bridge.fromAttempt(foreign);
  const grounded = Bridge.groundObservedAttempt(foreign);
  assert.ok(packet);
  assert.ok(grounded);
  assert.equal(packet.evidence.skill, which.id);
  assert.equal(grounded.skill, which.id);
});
test('Choice alone satisfies 1/3 and retains WAIT', () => {
  const grounded = Bridge.groundObservedAttempt(input);
  const packet = Bridge.fromAttempt({ attempt: grounded, session });
  const evaluation = Green.evaluateContract(which.passContract, [packet.evidence]);
  assert.equal(evaluation.requirements.filter(item => item.satisfied).length, 1);
  assert.equal(evaluation.requirements[0].satisfied, true);
  assert.equal(evaluation.status, 'WAITING_FOR_EVIDENCE');
  assert.equal(evaluation.satisfied, false);
});

rejectBoth('missing Attempt', { attempt: null });
rejectBoth('missing Session', { session: null });
rejectBoth('missing Decision', { session: {} });
rejectBoth('missing Session skill', { session: { decision: { experienceId: 'shopping-for-dinner' } } });
rejectBoth('missing occurrence', { attempt: { ...attempt, occurrenceId: '' } });
rejectBoth('missing context', { attempt: { ...attempt, context: null } });
rejectBoth('wrong dimension', { attempt: { ...attempt, dimension: 'determiner-use' } });
for (const field of ['result', 'support']) {
  for (const value of [undefined, '', ' ', 1]) {
    rejectBoth('invalid ' + field + ': ' + String(value), { attempt: { ...attempt, [field]: value } });
  }
}
for (const mode of [undefined, null, 'local', 'transfer']) {
  rejectBoth('own Attempt mode: ' + String(mode), { attempt: { ...attempt, mode } });
}

for (const [name, changes] of [
  ['missing event', { learnerEvent: null }],
  ['unobserved event', { learnerEvent: { ...event, observed: false } }],
  ['non-learner actor', { learnerEvent: { ...event, actor: 'system' } }],
  ['sentence-built source', { learnerEvent: { ...event, source: 'sentence-built' } }],
  ['missing event occurrence', { learnerEvent: { ...event, occurrenceId: '' } }],
  ['different occurrence', { learnerEvent: { ...event, occurrenceId: 'choice-select:2' } }],
  ['missing Session Experience', { session: { decision: { skill: which.id } } }],
  ['different Attempt Experience', { attempt: { ...attempt, context: { ...context, currentExperienceId: 'preparing-dinner' } } }],
  ['different event Experience', { learnerEvent: { ...event, experienceId: 'preparing-dinner' } }],
  ['different question', { learnerEvent: { ...event, question: 4 } }],
  ['different candidate', { learnerEvent: { ...event, choice: 'wrong' } }]
]) {
  test(name, () => assert.equal(Bridge.groundObservedAttempt({ ...input, ...changes }), null));
}

// Fault injection proves that the Bridge checks the converter's output as well.
rejectBoth('missing converter method', { attemptLoop: {} });
rejectBoth('converter exception', { attemptLoop: { toEvidencePacket() { throw new Error('converter unavailable'); } } });
rejectBoth('converter returns no packet', { attemptLoop: { toEvidencePacket() { return null; } } });
rejectBoth('converter returns a foreign skill', {
  attemptLoop: { toEvidencePacket(s, a) { return { ...Loop.toEvidencePacket(s, a), skill: 'foreign-packet' }; } }
});
for (const mode of [undefined, null, 'transfer']) {
  rejectBoth('converter introduces mode: ' + String(mode), {
    attemptLoop: { toEvidencePacket(s, a) { return { ...Loop.toEvidencePacket(s, a), mode }; } }
  });
}
test('grounding rejects converter replacement of the provenance context', () => {
  assert.equal(Bridge.groundObservedAttempt({
    ...input,
    attemptLoop: { toEvidencePacket(s, a) { return { ...Loop.toEvidencePacket(s, a), context: { ...a.context } }; } }
  }), null);
});
test('Bridge never mutates the Session, Attempt, context or learner event', () => {
  assert.equal(JSON.stringify(input), before);
  assert.equal(session.trace.length, 0);
  assert.equal(Object.hasOwn(attempt, 'skill'), false);
  assert.equal(Object.hasOwn(context, 'experienceId'), false);
  assert.equal(Object.hasOwn(context, 'occurrenceId'), false);
});

console.log('Choice Evidence Packet Bridge: PASS — ' + checks + ' focused checks; Session owns skill, provenance is grounded, mode is absent and Choice alone stays WAIT.');
