(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveAdvanceSelector = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function indexExperiences(experiences = []) {
    return new Map(experiences.map(experience => [experience.id, experience]));
  }

  function select(recommendation = {}, context = {}) {
    if (recommendation.action !== 'advance') {
      return { action: recommendation.action || 'continue-assessment', experienceId: context.currentExperience || null };
    }

    const experiences = Array.isArray(context.experiences) ? context.experiences : [];
    const byId = indexExperiences(experiences);
    const current = byId.get(context.currentExperience);
    const canonicalNext = current?.toroidalNext?.nextExperience || context.nextExperience || null;
    const next = canonicalNext ? byId.get(canonicalNext) : null;

    if (!canonicalNext) {
      return { action: 'advance', status: 'next-experience-required', experienceId: null };
    }

    if (experiences.length && !next) {
      return { action: 'advance', status: 'next-experience-missing', experienceId: canonicalNext };
    }

    return {
      action: 'advance',
      status: 'selected',
      experienceId: canonicalNext,
      fromExperience: context.currentExperience || null,
      entryVerb: next?.entryVerb || null,
      title: next?.title || null
    };
  }

  return { select, indexExperiences };
});
