(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveWaitClassifier = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const states = Object.freeze({
    INSPECTION_UNAVAILABLE: 'INSPECTION_UNAVAILABLE',
    INSPECTED_AWAITING_OPPORTUNITY: 'INSPECTED_AWAITING_OPPORTUNITY',
    OPPORTUNITY_FOUND_AWAITING_EVENT: 'OPPORTUNITY_FOUND_AWAITING_EVENT'
  });

  function classifyWait(routeInspection = {}) {
    if (!routeInspection || routeInspection.action !== 'continue-assessment') return null;
    if (routeInspection.contractEligible !== true) return null;

    const resonance = routeInspection.resonance;

    if (resonance == null) {
      return {
        state: states.INSPECTION_UNAVAILABLE,
        cause: 'current-opportunity-inspection-unavailable'
      };
    }

    if (resonance.status === 'no-resonance') {
      return {
        state: states.INSPECTED_AWAITING_OPPORTUNITY,
        cause: 'current-experience-inspected-without-meaningful-opportunity'
      };
    }

    if (resonance.status === 'matched') {
      return {
        state: states.OPPORTUNITY_FOUND_AWAITING_EVENT,
        cause: 'meaningful-opportunity-found-without-movement-authorization'
      };
    }

    return null;
  }

  return { states, classifyWait };
});
