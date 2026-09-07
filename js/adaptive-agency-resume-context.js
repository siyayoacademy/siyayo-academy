(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-agency-resume.js') : root.AdaptiveAgencyResume,
    typeof module === 'object' && module.exports ? require('./adaptive-resume-context.js') : root.AdaptiveResumeContext
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveAgencyResumeContext = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveAgencyResume, AdaptiveResumeContext) {
  function evaluateAgencyResumeContext(waitClassification = null, learnerEvent = null, context = {}, resumeState = {}) {
    if (!AdaptiveAgencyResume || typeof AdaptiveAgencyResume.evaluateAgencyResume !== 'function') return null;
    if (!AdaptiveResumeContext || typeof AdaptiveResumeContext.captureResumeContext !== 'function') return null;
    if (typeof AdaptiveResumeContext.evaluateResumeContext !== 'function') return null;

    const agencyResume = AdaptiveAgencyResume.evaluateAgencyResume(waitClassification, learnerEvent, context);
    const snapshot = AdaptiveResumeContext.captureResumeContext(resumeState);
    const resumeContext = AdaptiveResumeContext.evaluateResumeContext(
      snapshot,
      agencyResume ? agencyResume.resumeEligibility : null
    );

    return {
      agencyEvaluation: agencyResume ? agencyResume.agencyEvaluation : null,
      releaseEvaluation: agencyResume ? agencyResume.releaseEvaluation : null,
      resumeEligibility: agencyResume ? agencyResume.resumeEligibility : null,
      resumeContext
    };
  }

  return { evaluateAgencyResumeContext };
});
