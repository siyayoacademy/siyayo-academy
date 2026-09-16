(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveEvidenceView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function bySkill(profile, skill) {
    if (!profile || !Array.isArray(profile.observations)) return Object.freeze([]);
    if (typeof skill !== 'string' || !skill.trim()) return Object.freeze([]);

    const expected = skill.trim();
    const matches = profile.observations
      .filter(function (entry) {
        return entry && entry.context && entry.context.skill === expected;
      })
      .map(function (entry) {
        return Object.freeze({
          source: entry.source || 'unknown',
          status: entry.status || 'unknown',
          repeated: Object.freeze(Array.isArray(entry.repeated) ? entry.repeated.slice() : []),
          requiresReview: entry.requiresReview === true,
          conflict: entry.conflict === true,
          requiresReinforcement: entry.requiresReinforcement === true,
          context: Object.freeze({ ...(entry.context || {}) })
        });
      });

    return Object.freeze(matches);
  }

  return Object.freeze({ bySkill });
});
