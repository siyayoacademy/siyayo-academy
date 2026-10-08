#!/usr/bin/env node

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const sandbox = vm.createContext({});
sandbox.globalThis = sandbox;
for (const file of [
  'js/adaptive-learner-agency.js',
  'js/verb-explorer-learner-event.js'
]) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
}

const Agency = sandbox.AdaptiveLearnerAgency;
const Events = sandbox.SIYAYOVerbExplorerLearnerEvent;
const wait = { state: 'OPPORTUNITY_FOUND_AWAITING_EVENT' };
const state = {
  currentExperienceId: 'shopping-for-dinner',
  experienceQuestion: 3,
  experiencePerspective: 'debating',
  experienceWordType: 'verb'
};

const event = Events.fromChoiceSelect('choose', state);
const evaluation = Agency.evaluateAgency(wait, event);
assert.equal(evaluation.status, Agency.statuses.RESUME_AUTHORIZATION_ELIGIBLE);
assert.equal(evaluation.intent, 'continue');
assert.equal(evaluation.eventType, 'learner-response');

const noEvent = Agency.evaluateAgency(wait, Events.fromChoiceSelect('', state));
assert.equal(noEvent.status, Agency.statuses.AGENCY_NOT_OBSERVED);

const wrongWait = Agency.evaluateAgency({ state: 'NO_OPPORTUNITY' }, event);
assert.equal(wrongWait.status, Agency.statuses.AGENCY_AMBIGUOUS);

console.log('Verb Explorer learner event agency semantics: PASS — grounded choice-select event is RESUME_AUTHORIZATION_ELIGIBLE in the real awaiting-event state; empty event is not observed; wrong WAIT remains ambiguous.');
