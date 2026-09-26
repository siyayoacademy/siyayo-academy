#!/usr/bin/env node
const assert=require('node:assert/strict');
const Profile=require('../js/adaptive-evidence-profile.js');
const Source=require('../js/adaptive-observed-attempt-evidence-source.js');
const Trail=require('../js/adaptive-learner-trail-view.js');
const Marker=require('../js/adaptive-learner-progress-marker.js');
const Sequence=require('../js/adaptive-learner-trail-sequence.js');

const profile=Profile.createProfile('observed-attempt-trail-integration');
const skill='which.use.determiner';

let trail=Trail.project(profile,skill);
let marker=Marker.resolve(trail);
assert.equal(trail.state,'UNOBSERVED');
assert.equal(marker.state,'UNOBSERVED');
assert.equal(marker.marker,'EMPTY_DOT');
assert.equal(marker.confirmedExperiences,0);

const session={decision:{skill,experienceId:'shopping-for-dinner'}};
const event={
  observed:true,
  actor:'learner',
  occurrenceId:'dependency-head-probe-select:1',
  experienceId:'shopping-for-dinner'
};
const attempt={
  occurrenceId:event.occurrenceId,
  skill,
  context:{experienceId:'shopping-for-dinner'}
};
const cycleResult={
  contractEligible:false,
  advanceSelection:null,
  evidencePacket:{
    skill,
    dimension:'head-identification',
    result:'pass',
    support:'none',
    context:{
      occurrenceId:event.occurrenceId,
      experienceId:'shopping-for-dinner',
      language:'en'
    }
  }
};

Source.record(Profile,profile,{
  cycleResult,session,attempt,learnerEvent:event,
  context:{language:'en',chapter:'question-words'}
});

trail=Trail.project(profile,skill);
marker=Marker.resolve(trail);
const sequence=Sequence.project(trail);

assert.equal(trail.status,'TRAIL_AVAILABLE');
assert.equal(trail.state,'OBSERVED');
assert.equal(trail.counts.footprints,1);
assert.equal(trail.counts.greenPassClosures,0);
assert.equal(marker.state,'IN_PROGRESS');
assert.equal(marker.marker,'PARTIAL_DOT');
assert.equal(marker.confirmedExperiences,0);
assert.equal(sequence.segments.length,1);
assert.equal(sequence.segments[0].experienceId,'shopping-for-dinner');
assert.equal(sequence.segments[0].state,'IN_PROGRESS');
assert.equal(sequence.segments[0].marker,'PARTIAL_DOT');
assert.equal(sequence.segments[0].greenPassClosures,0);

console.log('Observed Attempt → Learner Trail: PASS — accepted head-identification Evidence moves the canonical Trail from ○ UNOBSERVED to ◐ IN_PROGRESS without confirmed Experience, Green Pass, mastery, or NEXT.');
