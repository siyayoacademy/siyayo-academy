const assert = require('assert');
const Profile = require('../js/adaptive-evidence-profile.js');

const profile = Profile.createProfile('patita-test');
assert.strictEqual(Profile.recommend(profile).action, 'observe');
assert.strictEqual(Profile.pendingReviewCandidate(profile), null);

Profile.record(profile, {
  source: 'multilingual-interference-evidence-gate',
  status: 'insufficient-evidence',
  repeated: [],
  requiresReview: false,
  conflict: false,
  requiresReinforcement: false
}, { language: 'pt', token: 'esquesito' });
assert.strictEqual(Profile.recommend(profile).action, 'observe');
assert.strictEqual(Profile.pendingReviewCandidate(profile), null);

const initialKey = 'pt:esquesito:interference-hypothesis:';
Profile.record(profile, {
  source: 'multilingual-interference-evidence-gate',
  status: 'pattern-observed',
  repeated: [{ key: initialKey, occurrences: 2 }],
  requiresReview: true,
  conflict: false,
  requiresReinforcement: false
}, { language: 'pt', token: 'esquesito' });
assert.strictEqual(Profile.recommend(profile).action, 'review-pattern');
assert.strictEqual(profile.confirmedReinforcements.length, 0);
const initialCandidate = Profile.pendingReviewCandidate(profile);
assert.deepStrictEqual(initialCandidate, { repeated: [{ key: initialKey, occurrences: 2 }] });
assert.strictEqual(Object.isFrozen(initialCandidate), true);
assert.strictEqual(Object.isFrozen(initialCandidate.repeated), true);
assert.strictEqual(Object.isFrozen(initialCandidate.repeated[0]), true);

// Even a reinforcement flag is not accepted without explicit confirmation.
Profile.record(profile, {
  status: 'pattern-observed',
  requiresReview: true,
  requiresReinforcement: true
}, { language: 'pt', token: 'esquesito', confirmed: false });
assert.strictEqual(profile.confirmedReinforcements.length, 0);

Profile.record(profile, {
  status: 'pattern-observed',
  requiresReview: true,
  requiresReinforcement: true
}, { language: 'pt', token: 'esquesito', confirmed: true });
assert.strictEqual(profile.confirmedReinforcements.length, 1);
assert.strictEqual(Profile.recommend(profile).action, 'reinforce');

// Identified longitudinal evidence: clearing K1 must not erase history.
const k1 = 'pt:esquesito:interference-hypothesis:';
const k2 = 'pt:actual:cross-language-transfer:en';
const longitudinal = Profile.createProfile('longitudinal');

Profile.record(longitudinal, {
  source: 'multilingual-interference-evidence-gate',
  status: 'pattern-observed',
  repeated: [{ key: k1, occurrences: 2 }],
  requiresReview: true,
  requiresReinforcement: false
});
assert.deepStrictEqual(Profile.pendingReviewCandidate(longitudinal), { repeated: [{ key: k1, occurrences: 2 }] });

Profile.record(longitudinal, {
  source: 'multilingual-interference-evidence-gate',
  status: 'pattern-observed',
  repeated: [{ key: k2, occurrences: 2 }],
  requiresReview: true,
  requiresReinforcement: false
});
assert.strictEqual(Profile.pendingReviewCandidate(longitudinal), null,
  'multiple simultaneously pending K values must preserve WAIT instead of choosing arbitrarily');

Profile.record(longitudinal, {
  source: 'multilingual-contrast-verifier',
  status: 'contrast-cleared',
  repeated: [{ key: k1, occurrences: 2 }],
  requiresReview: false,
  requiresReinforcement: false
});

assert.strictEqual(longitudinal.observations.length, 3);
assert.strictEqual(longitudinal.reinforcementCandidates.length, 2);
assert.strictEqual(Profile.recommend(longitudinal).action, 'review-pattern');
assert.deepStrictEqual(Profile.pendingReviewCandidate(longitudinal), { repeated: [{ key: k2, occurrences: 2 }] },
  'clearing K1 leaves the one still-pending K2 as the unique candidate');

// Once K2 is also cleared, both historical candidates remain recorded,
// but neither identified pattern should remain pedagogically pending.
Profile.record(longitudinal, {
  source: 'multilingual-contrast-verifier',
  status: 'contrast-cleared',
  repeated: [{ key: k2, occurrences: 2 }],
  requiresReview: false,
  requiresReinforcement: false
});
assert.strictEqual(longitudinal.reinforcementCandidates.length, 2);
assert.strictEqual(Profile.recommend(longitudinal).action, 'observe');
assert.strictEqual(Profile.pendingReviewCandidate(longitudinal), null);

// A later confirmed transfer for K1 becomes pending reinforcement, not review.
Profile.record(longitudinal, {
  source: 'multilingual-contrast-verifier',
  status: 'transfer-confirmed',
  repeated: [{ key: k1, occurrences: 3 }],
  requiresReview: false,
  requiresReinforcement: true
}, { confirmed: true });
assert.strictEqual(Profile.recommend(longitudinal).action, 'reinforce');
assert.strictEqual(Profile.pendingReviewCandidate(longitudinal), null);

// A later clear for that same K1 neutralizes the pending interpretation,
// while preserving the confirmed reinforcement in longitudinal history.
Profile.record(longitudinal, {
  source: 'multilingual-contrast-verifier',
  status: 'contrast-cleared',
  repeated: [{ key: k1, occurrences: 3 }],
  requiresReview: false,
  requiresReinforcement: false
});
assert.strictEqual(longitudinal.confirmedReinforcements.length, 1);
assert.strictEqual(Profile.recommend(longitudinal).action, 'observe');
assert.strictEqual(Profile.pendingReviewCandidate(longitudinal), null);

// Legacy evidence without K keeps historical recommend() behavior but cannot
// authorize a concrete contrast probe because no K may be inferred retroactively.
const legacy = Profile.createProfile('legacy');
Profile.record(legacy, {
  status: 'pattern-observed',
  requiresReview: true,
  requiresReinforcement: false
});
Profile.record(legacy, {
  status: 'contrast-cleared',
  requiresReview: false,
  requiresReinforcement: false
});
assert.strictEqual(Profile.recommend(legacy).action, 'review-pattern');
assert.strictEqual(Profile.pendingReviewCandidate(legacy), null);

const malformed = Profile.createProfile('malformed');
Profile.record(malformed, {
  status: 'pattern-observed',
  repeated: [{ key: 'pt:bad', occurrences: 1 }],
  requiresReview: true,
  requiresReinforcement: false
});
assert.strictEqual(Profile.pendingReviewCandidate(malformed), null,
  'a concrete review candidate still requires at least two occurrences');

console.log('Adaptive non-punitive evidence profile: PASS — unique pending review candidate is read-only, longitudinal, and fail-closed.');
