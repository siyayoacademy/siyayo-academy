const assert = require('node:assert/strict');
const Wait = require('../js/adaptive-wait-classifier.js');

const unavailable = Wait.classifyWait({
  action: 'continue-assessment',
  contractEligible: true,
  resonance: null
});
assert.deepEqual(unavailable, {
  state: 'INSPECTION_UNAVAILABLE',
  cause: 'current-opportunity-inspection-unavailable'
});

const awaitingOpportunity = Wait.classifyWait({
  action: 'continue-assessment',
  contractEligible: true,
  resonance: { status: 'no-resonance', score: 1, minimumScore: 2 }
});
assert.deepEqual(awaitingOpportunity, {
  state: 'INSPECTED_AWAITING_OPPORTUNITY',
  cause: 'current-experience-inspected-without-meaningful-opportunity'
});

const opportunityFound = Wait.classifyWait({
  action: 'continue-assessment',
  contractEligible: true,
  resonance: { status: 'matched', score: 5, minimumScore: 1 }
});
assert.deepEqual(opportunityFound, {
  state: 'OPPORTUNITY_FOUND_AWAITING_EVENT',
  cause: 'meaningful-opportunity-found-without-movement-authorization'
});

assert.equal(Wait.classifyWait({ action: 'advance', contractEligible: true, resonance: { status: 'matched' } }), null);
assert.equal(Wait.classifyWait({ action: 'continue-assessment', contractEligible: false, resonance: null }), null);
assert.equal(Wait.classifyWait({ action: 'continue-assessment', contractEligible: true, resonance: { status: 'unknown' } }), null);

console.log('Adaptive WAIT classifier tests passed.');
console.log('WAIT classification: PASS — pause semantics derive from observable route context without manufacturing movement.');
