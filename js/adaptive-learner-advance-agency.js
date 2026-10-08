(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveLearnerAdvanceAgency = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    ADVANCE_NOT_OFFERED: 'ADVANCE_NOT_OFFERED',
    ADVANCE_AGENCY_NOT_OBSERVED: 'ADVANCE_AGENCY_NOT_OBSERVED',
    ADVANCE_AGENCY_AMBIGUOUS: 'ADVANCE_AGENCY_AMBIGUOUS',
    ADVANCE_AUTHORIZATION_ELIGIBLE: 'ADVANCE_AUTHORIZATION_ELIGIBLE'
  });

  function evaluateAdvanceAgency(advanceOpportunity = null, learnerEvent = null) {
    if (!advanceOpportunity || advanceOpportunity.status !== 'ADVANCE_OFFERED') return {
      status: statuses.ADVANCE_NOT_OFFERED,
      reason: 'advance-opportunity-not-offered'
    };

    if (!learnerEvent || learnerEvent.observed !== true) return {
      status: statuses.ADVANCE_AGENCY_NOT_OBSERVED,
      reason: 'learner-event-not-observed'
    };

    if (learnerEvent.actor !== 'learner') return {
      status: statuses.ADVANCE_AGENCY_AMBIGUOUS,
      reason: 'event-provenance-is-not-learner'
    };

    if (learnerEvent.relevantToAdvance !== true) return {
      status: statuses.ADVANCE_AGENCY_AMBIGUOUS,
      reason: 'learner-event-not-grounded-in-current-advance-opportunity'
    };

    if (learnerEvent.intent !== 'next') return {
      status: statuses.ADVANCE_AGENCY_AMBIGUOUS,
      reason: 'advance-intention-not-supported'
    };

    return Object.freeze({
      status: statuses.ADVANCE_AUTHORIZATION_ELIGIBLE,
      reason: 'explicit-learner-next-supports-advance-authorization',
      intent: learnerEvent.intent,
      eventType: learnerEvent.type || null
    });
  }

  return { statuses, evaluateAdvanceAgency };
});
