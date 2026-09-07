(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveWaitRelease = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    WAIT_PRESERVED: 'WAIT_PRESERVED',
    RELEASE_ELIGIBLE: 'RELEASE_ELIGIBLE'
  });

  function evaluateRelease(waitClassification = null, releaseEvent = null) {
    if (!waitClassification || !waitClassification.state) return null;

    // 08.18g starts only from the WAIT state already proven by runtime evidence.
    if (waitClassification.state !== 'OPPORTUNITY_FOUND_AWAITING_EVENT') return {
      status: statuses.WAIT_PRESERVED,
      reason: 'release-rule-not-defined-for-wait-state'
    };

    if (!releaseEvent || releaseEvent.observed !== true) return {
      status: statuses.WAIT_PRESERVED,
      reason: 'release-event-not-observed'
    };

    if (releaseEvent.authorizesResume !== true) return {
      status: statuses.WAIT_PRESERVED,
      reason: 'release-event-does-not-authorize-resume'
    };

    return {
      status: statuses.RELEASE_ELIGIBLE,
      reason: 'observed-event-authorizes-resume',
      eventType: releaseEvent.type || null
    };
  }

  return { statuses, evaluateRelease };
});
