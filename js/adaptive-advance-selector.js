(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveAdvanceSelector = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function indexExperiences(experiences = []) {
    return new Map(experiences.map(experience => [experience.id, experience]));
  }

  function resolveCandidate(context = {}) {
    const experiences = Array.isArray(context.experiences) ? context.experiences : [];
    const byId = indexExperiences(experiences);
    const currentExperience = context.currentExperience || null;
    const current = byId.get(currentExperience);
    const candidateId = current?.toroidalNext?.nextExperience || context.nextExperience || null;
    const candidate = candidateId ? byId.get(candidateId) : null;

    if (!candidateId) {
      return { status: 'candidate-required', experienceId: null, fromExperience: currentExperience };
    }

    if (experiences.length && !candidate) {
      return { status: 'candidate-missing', experienceId: candidateId, fromExperience: currentExperience };
    }

    return {
      status: 'candidate-resolved',
      experienceId: candidateId,
      fromExperience: currentExperience,
      entryVerb: candidate?.entryVerb || null,
      title: candidate?.title || null
    };
  }

  function select(recommendation = {}, context = {}) {
    if (recommendation.action !== 'advance') {
      return { action: recommendation.action || 'continue-assessment', experienceId: context.currentExperience || null };
    }

    const candidate = resolveCandidate(context);

    if (candidate.status === 'candidate-required') {
      return { action: 'advance', status: 'next-experience-required', experienceId: null };
    }

    if (candidate.status === 'candidate-missing') {
      return { action: 'advance', status: 'next-experience-missing', experienceId: candidate.experienceId };
    }

    return {
      action: 'advance',
      status: 'selected',
      experienceId: candidate.experienceId,
      fromExperience: candidate.fromExperience,
      entryVerb: candidate.entryVerb,
      title: candidate.title
    };
  }

  return { select, resolveCandidate, indexExperiences };
});
