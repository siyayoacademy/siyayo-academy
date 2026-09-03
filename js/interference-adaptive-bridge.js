(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.InterferenceAdaptiveBridge = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function toAdaptiveEvidence(verification = {}, context = {}) {
    const confirmed = verification.reinforcementConfirmed === true &&
      verification.requiresReinforcement === true;

    return {
      source: verification.source || 'multilingual-contrast-verifier',
      status: verification.status || 'unknown',
      repeated: Array.isArray(context.repeated) ? context.repeated : [],
      requiresReview: verification.status === 'review-required' ||
        verification.status === 'contrast-unresolved',
      conflict: false,
      requiresReinforcement: confirmed,
      context: {
        ...context,
        confirmed
      }
    };
  }

  function apply(profileApi, profile, verification = {}, context = {}) {
    if (!profileApi || typeof profileApi.record !== 'function') {
      throw new TypeError('Adaptive evidence profile API is required.');
    }
    const evidence = toAdaptiveEvidence(verification, context);
    return profileApi.record(profile, evidence, evidence.context);
  }

  return { toAdaptiveEvidence, apply };
});
