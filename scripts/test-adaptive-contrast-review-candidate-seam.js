const assert=require('node:assert/strict');
const Profile=require('../js/adaptive-evidence-profile.js');
const Boundary=require('../js/adaptive-contrast-review-boundary.js');

const key='pt:exquisito:cross-language-transfer:es';
const profile=Profile.createProfile('contrast-review-seam');
const decision=Object.freeze({
  action:'continue-assessment',
  focus:'contrast-review',
  experienceId:'shopping-for-dinner'
});

// No identified longitudinal K: Decision alone cannot open a probe.
assert.equal(Profile.pendingReviewCandidate(profile),null);
assert.equal(Boundary.open(decision,Profile.pendingReviewCandidate(profile)),null);

Profile.record(profile,{
  source:'multilingual-interference-evidence-gate',
  status:'pattern-observed',
  repeated:[{key,occurrences:2}],
  requiresReview:true,
  requiresReinforcement:false
});

const candidate=Profile.pendingReviewCandidate(profile);
assert.deepEqual(candidate,{repeated:[{key,occurrences:2}]});
const probe=Boundary.open(decision,candidate);
assert.ok(probe);
assert.equal(probe.pattern.key,key);
assert.equal(probe.pattern.occurrences,2);
assert.equal(probe.experienceId,'shopping-for-dinner');
assert.ok(Object.isFrozen(probe));
assert.ok(Object.isFrozen(probe.pattern));

// A non-contrast Decision cannot borrow the same pending K.
assert.equal(Boundary.open(Object.freeze({
  action:'continue-assessment',
  focus:'assessment',
  experienceId:'shopping-for-dinner'
}),candidate),null);

// Later evidence for the same K clears current pedagogical pending state
// without deleting history; the seam must close again.
Profile.record(profile,{
  source:'multilingual-contrast-verifier',
  status:'contrast-cleared',
  repeated:[{key,occurrences:2}],
  requiresReview:false,
  requiresReinforcement:false
});
assert.equal(profile.observations.length,2);
assert.equal(Profile.pendingReviewCandidate(profile),null);
assert.equal(Boundary.open(decision,Profile.pendingReviewCandidate(profile)),null);

// Multiple pending K values are ambiguous and must preserve WAIT.
const ambiguous=Profile.createProfile('contrast-review-ambiguous');
Profile.record(ambiguous,{
  status:'pattern-observed',
  repeated:[{key:'pt:k1',occurrences:2}],
  requiresReview:true,
  requiresReinforcement:false
});
Profile.record(ambiguous,{
  status:'pattern-observed',
  repeated:[{key:'pt:k2',occurrences:2}],
  requiresReview:true,
  requiresReinforcement:false
});
assert.equal(Profile.pendingReviewCandidate(ambiguous),null);
assert.equal(Boundary.open(decision,Profile.pendingReviewCandidate(ambiguous)),null);

// Legacy review can retain recommend() compatibility but cannot mint K.
const legacy=Profile.createProfile('contrast-review-legacy');
Profile.record(legacy,{
  status:'pattern-observed',
  repeated:[],
  requiresReview:true,
  requiresReinforcement:false
});
assert.equal(Profile.recommend(legacy).action,'review-pattern');
assert.equal(Profile.pendingReviewCandidate(legacy),null);
assert.equal(Boundary.open(decision,Profile.pendingReviewCandidate(legacy)),null);

console.log('Adaptive contrast review candidate seam: PASS — Decision and one identified longitudinal K meet fail-closed without parallel inference.');
