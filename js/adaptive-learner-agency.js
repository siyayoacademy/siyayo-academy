(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveLearnerAgency = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    AGENCY_NOT_OBSERVED: 'AGENCY_NOT_OBSERVED',
    AGENCY_AMBIGUOUS: 'AGENCY_AMBIGUOUS',
    RESUME_AUTHORIZATION_ELIGIBLE: 'RESUME_AUTHORIZATION_ELIGIBLE'
  });

  const resumeIntents = new Set(['continue', 'resume', 'retry', 'answer']);

  function evaluateAgency(waitClassification = null, learnerEvent = null) {
    if (!waitClassification || !waitClassification.state) return null;

    if (waitClassification.state !== 'OPPORTUNITY_FOUND_AWAITING_EVENT') return {
      status: statuses.AGENCY_AMBIGUOUS,
      reason: 'agency-rule-not-defined-for-wait-state'
    };

    if (!learnerEvent || learnerEvent.observed !== true) return {
      status: statuses.AGENCY_NOT_OBSERVED,
      reason: 'learner-event-not-observed'
    };

    if (learnerEvent.actor !== 'learner') return {
      status: statuses.AGENCY_AMBIGUOUS,
      reason: 'event-provenance-is-not-learner'
    };

    if (learnerEvent.relevantToWait !== true) return {
      status: statuses.AGENCY_AMBIGUOUS,
      reason: 'learner-event-not-grounded-in-current-wait'
    };

    if (typeof learnerEvent.intent !== 'string' || !resumeIntents.has(learnerEvent.intent)) return {
      status: statuses.AGENCY_AMBIGUOUS,
      reason: 'resume-intention-not-supported'
    };

    return {
      status: statuses.RESUME_AUTHORIZATION_ELIGIBLE,
      reason: 'learner-agency-supports-resume-authorization',
      intent: learnerEvent.intent,
      eventType: learnerEvent.type || null
    };
  }

  return { statuses, evaluateAgency };
});
