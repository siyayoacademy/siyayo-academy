(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveEvidenceProfile = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function createProfile(id = 'anonymous') {
    return {
      id,
      observations: [],
      patterns: [],
      reinforcementCandidates: [],
      confirmedReinforcements: []
    };
  }

  function record(profile, gateResult = {}, context = {}) {
    if (!profile || !Array.isArray(profile.observations)) {
      throw new TypeError('A valid adaptive evidence profile is required.');
    }

    const entry = {
      source: gateResult.source || 'unknown',
      status: gateResult.status || 'unknown',
      repeated: Array.isArray(gateResult.repeated) ? gateResult.repeated : [],
      requiresReview: gateResult.requiresReview === true,
      conflict: gateResult.conflict === true,
      requiresReinforcement: gateResult.requiresReinforcement === true,
      context: { ...context }
    };

    profile.observations.push(entry);

    if (entry.status === 'pattern-observed') profile.patterns.push(entry);

    // A pattern is a candidate for pedagogical attention, not an error verdict.
    if (entry.requiresReview && !entry.requiresReinforcement) {
      profile.reinforcementCandidates.push(entry);
    }

    // Only explicitly confirmed evidence may enter the reinforcement queue.
    if (entry.requiresReinforcement && context.confirmed === true) {
      profile.confirmedReinforcements.push(entry);
    }

    return profile;
  }

  function recommend(profile) {
    if (profile.confirmedReinforcements.length) {
      return { action: 'reinforce', reason: 'confirmed-evidence' };
    }
    if (profile.reinforcementCandidates.length) {
      return { action: 'review-pattern', reason: 'repeated-unconfirmed-evidence' };
    }
    return { action: 'observe', reason: 'insufficient-or-clear-evidence' };
  }

  return { createProfile, record, recommend };
});
