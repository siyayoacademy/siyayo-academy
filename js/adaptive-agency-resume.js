(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-agency-release.js') : root.AdaptiveAgencyRelease,
    typeof module === 'object' && module.exports ? require('./adaptive-resume-eligibility.js') : root.AdaptiveResumeEligibility
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveAgencyResume = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveAgencyRelease, AdaptiveResumeEligibility) {
  function evaluateAgencyResume(waitClassification = null, learnerEvent = null, context = {}) {
    if (!AdaptiveAgencyRelease || typeof AdaptiveAgencyRelease.evaluateAgencyRelease !== 'function') return null;
    if (!AdaptiveResumeEligibility || typeof AdaptiveResumeEligibility.evaluateResumeEligibility !== 'function') return null;

    const agencyRelease = AdaptiveAgencyRelease.evaluateAgencyRelease(waitClassification, learnerEvent);
    const releaseEvaluation = agencyRelease ? agencyRelease.releaseEvaluation : null;
    const resumeEligibility = AdaptiveResumeEligibility.evaluateResumeEligibility(releaseEvaluation, context);

    return {
      agencyEvaluation: agencyRelease ? agencyRelease.agencyEvaluation : null,
      releaseEvaluation,
      resumeEligibility
    };
  }

  return { evaluateAgencyResume };
});
