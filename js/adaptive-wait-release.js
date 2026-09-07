(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveWaitRelease = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    WAIT_PRESERVED: 'WAIT_PRESERVED',
    RELEASE_ELIGIBLE: 'RELEASE_ELIGIBLE'
  });

  function evaluateRelease(waitClassification = null, releaseAuthorization = null) {
    if (!waitClassification || !waitClassification.state) return null;

    if (waitClassification.state !== 'OPPORTUNITY_FOUND_AWAITING_EVENT') return {
      status: statuses.WAIT_PRESERVED,
      reason: 'release-rule-not-defined-for-wait-state'
    };

    if (!releaseAuthorization || releaseAuthorization.status !== 'RESUME_AUTHORIZATION_ELIGIBLE') return {
      status: statuses.WAIT_PRESERVED,
      reason: 'grounded-resume-authorization-not-eligible'
    };

    return {
      status: statuses.RELEASE_ELIGIBLE,
      reason: 'grounded-resume-authorization-eligible',
      eventType: releaseAuthorization.eventType || null
    };
  }

  return { statuses, evaluateRelease };
});
