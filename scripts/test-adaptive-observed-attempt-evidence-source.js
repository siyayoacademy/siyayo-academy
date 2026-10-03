#!/usr/bin/env node
const assert=require('node:assert/strict');
const Profile=require('../js/adaptive-evidence-profile.js');
const Source=require('../js/adaptive-observed-attempt-evidence-source.js');

const profile=Profile.createProfile('observed-attempt-trail');
const session=Object.freeze({
  decision:Object.freeze({
    skill:'which.use.determiner',
    experienceId:'shopping-for-dinner'
  })
});
const learnerEvent=Object.freeze({
  observed:true,
  actor:'learner',
  occurrenceId:'dependency-head-probe-select:1',
  experienceId:'shopping-for-dinner'
});
const attempt=Object.freeze({
  occurrenceId:'dependency-head-probe-select:1',
  skill:'which.use.determiner',
  context:Object.freeze({
    experienceId:'shopping-for-dinner'
  })
});
const cycleResult=Object.freeze({
  contractEligible:false,
  advanceSelection:null,
  evidencePacket:Object.freeze({
    skill:'which.use.determiner',
    dimension:'head-identification',
    result:'pass',
    support:'none',
    context:Object.freeze({
      occurrenceId:'dependency-head-probe-select:1',
      experienceId:'shopping-for-dinner',
      language:'en'
    })
  })
});

assert.strictEqual(Source.record(Profile,profile,{
  cycleResult,session,attempt,learnerEvent,
  context:{language:'en',chapter:'question-words'}
}),profile);

assert.equal(profile.observations.length,1);
const entry=profile.observations[0];
assert.equal(entry.source,'learner-attempt');
assert.equal(entry.status,'attempt-observed');
assert.equal(entry.requiresReview,false);
assert.equal(entry.conflict,false);
assert.equal(entry.requiresReinforcement,false);
assert.equal(entry.context.skill,'which.use.determiner');
assert.equal(entry.context.experienceId,'shopping-for-dinner');
assert.equal(entry.context.occurrenceId,'dependency-head-probe-select:1');
assert.equal(entry.context.dimension,'head-identification');
assert.equal(entry.context.result,'pass');
assert.equal(entry.context.support,'none');
assert.equal(entry.context.confirmed,false);
assert.equal(Object.prototype.hasOwnProperty.call(entry.context,'greenPass'),false);
assert.equal(Object.prototype.hasOwnProperty.call(entry.context,'nextExperience'),false);

// Idempotent by canonical learner occurrence.
assert.strictEqual(Source.record(Profile,profile,{
  cycleResult,session,attempt,learnerEvent,
  context:{language:'en',chapter:'question-words'}
}),profile);
assert.equal(profile.observations.length,1);

// A failed assessed answer is still an observed learning footprint, not mastery.
const failEvent=Object.freeze({...learnerEvent,occurrenceId:'dependency-head-probe-select:2'});
const failAttempt=Object.freeze({...attempt,occurrenceId:'dependency-head-probe-select:2'});
const failResult=Object.freeze({
  ...cycleResult,
  evidencePacket:Object.freeze({
    ...cycleResult.evidencePacket,
    result:'fail',
    context:Object.freeze({
      ...cycleResult.evidencePacket.context,
      occurrenceId:'dependency-head-probe-select:2'
    })
  })
});
assert.strictEqual(Source.record(Profile,profile,{
  cycleResult:failResult,session,attempt:failAttempt,learnerEvent:failEvent,
  context:{language:'en',chapter:'question-words'}
}),profile);
assert.equal(profile.observations.length,2);
assert.equal(profile.observations[1].context.result,'fail');
assert.equal(profile.observations[1].context.confirmed,false);

// Fail closed on provenance mismatch or non-learner occurrence.
assert.equal(Source.record(Profile,profile,{
  cycleResult,session,attempt,
  learnerEvent:{...learnerEvent,occurrenceId:'different'}
}),null);
assert.equal(Source.record(Profile,profile,{
  cycleResult,session,attempt,
  learnerEvent:{...learnerEvent,observed:false}
}),null);
assert.equal(Source.record(Profile,profile,{
  cycleResult,session:{decision:{skill:'other.skill',experienceId:'shopping-for-dinner'}},
  attempt,learnerEvent
}),null);
assert.equal(Source.record(null,profile,{cycleResult,session,attempt,learnerEvent}),null);

console.log('Adaptive observed Attempt Evidence source: PASS — one Cycle-accepted learner occurrence becomes one idempotent non-confirmatory longitudinal footprint; pass/fail remain observations and authorize neither Green Pass nor NEXT.');
