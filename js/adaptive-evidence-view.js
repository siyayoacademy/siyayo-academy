(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveEvidenceView = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function freezeRepeated(value) {
    if (!Array.isArray(value)) return Object.freeze([]);
    return Object.freeze(value.map(function (item) {
      if (!item || typeof item !== 'object') return item;
      return Object.freeze({ ...item });
    }));
  }

  function bySkill(profile, skill) {
    if (!profile || !Array.isArray(profile.observations)) return Object.freeze([]);
    if (typeof skill !== 'string' || !skill.trim()) return Object.freeze([]);

    const expected = skill.trim();
    const matches = profile.observations
      .filter(function (entry) {
        return entry && entry.context && entry.context.skill === expected;
      })
      .map(function (entry) {
        const context = entry.context || {};
        return Object.freeze({
          source: entry.source,
          status: entry.status,
          repeated: freezeRepeated(entry.repeated),
          requiresReview: entry.requiresReview === true,
          conflict: entry.conflict === true,
          requiresReinforcement: entry.requiresReinforcement === true,
          context: Object.freeze({
            skill: context.skill,
            language: context.language,
            confirmed: context.confirmed
          })
        });
      });

    return Object.freeze(matches);
  }

  return Object.freeze({ bySkill });
});
