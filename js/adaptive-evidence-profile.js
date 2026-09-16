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

    // These arrays preserve historical evidence. Pending pedagogical state is
    // derived from observations by pattern key in recommend().
    if (entry.requiresReview && !entry.requiresReinforcement) {
      profile.reinforcementCandidates.push(entry);
    }

    if (entry.requiresReinforcement && context.confirmed === true) {
      profile.confirmedReinforcements.push(entry);
    }

    return profile;
  }

  function repeatedKeys(entry = {}) {
    if (!Array.isArray(entry.repeated)) return [];
    return entry.repeated
      .map((item) => String(item && item.key || '').trim())
      .filter(Boolean);
  }

  function identifiedPending(profile) {
    const latestByKey = new Map();
    let hasIdentifiedEvidence = false;

    profile.observations.forEach((entry) => {
      const keys = repeatedKeys(entry);
      if (!keys.length) return;
      hasIdentifiedEvidence = true;
      keys.forEach((key) => latestByKey.set(key, entry));
    });

    let reinforcement = false;
    let review = false;
    latestByKey.forEach((entry) => {
      if (entry.requiresReinforcement && entry.context && entry.context.confirmed === true) {
        reinforcement = true;
        return;
      }
      if (entry.requiresReview && !entry.requiresReinforcement) review = true;
    });

    return { hasIdentifiedEvidence, reinforcement, review };
  }

  function hasLegacyPending(entries = []) {
    return entries.some((entry) => repeatedKeys(entry).length === 0);
  }

  function recommend(profile) {
    const pending = identifiedPending(profile);

    // Evidence without a pattern key predates correlation support. Preserve its
    // historical behavior rather than inferring that later evidence resolved it.
    if (hasLegacyPending(profile.confirmedReinforcements)) {
      return { action: 'reinforce', reason: 'confirmed-evidence' };
    }
    if (pending.reinforcement) {
      return { action: 'reinforce', reason: 'confirmed-evidence' };
    }

    if (hasLegacyPending(profile.reinforcementCandidates)) {
      return { action: 'review-pattern', reason: 'repeated-unconfirmed-evidence' };
    }
    if (pending.review) {
      return { action: 'review-pattern', reason: 'repeated-unconfirmed-evidence' };
    }

    return { action: 'observe', reason: 'insufficient-or-clear-evidence' };
  }

  return { createProfile, record, recommend };
});
