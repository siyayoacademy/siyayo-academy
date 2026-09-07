(function (root, factory) {
  const api = factory(
    typeof module === 'object' && module.exports ? require('./adaptive-learner-agency.js') : root.AdaptiveLearnerAgency,
    typeof module === 'object' && module.exports ? require('./adaptive-wait-release.js') : root.AdaptiveWaitRelease
  );
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveAgencyRelease = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (AdaptiveLearnerAgency, AdaptiveWaitRelease) {
  function evaluateAgencyRelease(waitClassification = null, learnerEvent = null) {
    if (!AdaptiveLearnerAgency || typeof AdaptiveLearnerAgency.evaluateAgency !== 'function') return null;
    if (!AdaptiveWaitRelease || typeof AdaptiveWaitRelease.evaluateRelease !== 'function') return null;

    const agencyEvaluation = AdaptiveLearnerAgency.evaluateAgency(waitClassification, learnerEvent);

    return {
      agencyEvaluation,
      releaseEvaluation: waitClassification && waitClassification.state
        ? AdaptiveWaitRelease.evaluateRelease(waitClassification, agencyEvaluation)
        : null
    };
  }

  return { evaluateAgencyRelease };
});
