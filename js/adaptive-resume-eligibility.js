(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveResumeEligibility = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    RESUME_NOT_ELIGIBLE: 'RESUME_NOT_ELIGIBLE',
    RESUME_ELIGIBLE: 'RESUME_ELIGIBLE'
  });

  function evaluateResumeEligibility(releaseEvaluation = null, context = {}) {
    if (!releaseEvaluation || releaseEvaluation.status !== 'RELEASE_ELIGIBLE') {
      return {
        status: statuses.RESUME_NOT_ELIGIBLE,
        reason: 'wait-not-release-eligible',
        experienceId: context.currentExperience || null
      };
    }

    if (!context.currentExperience) {
      return {
        status: statuses.RESUME_NOT_ELIGIBLE,
        reason: 'preserved-current-experience-unavailable',
        experienceId: null
      };
    }

    return {
      status: statuses.RESUME_ELIGIBLE,
      reason: 'release-eligible-with-preserved-current-experience',
      experienceId: context.currentExperience,
      scope: 'current-experience'
    };
  }

  return { statuses, evaluateResumeEligibility };
});
