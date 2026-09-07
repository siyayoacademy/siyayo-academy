(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveResumeContext = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const fields = Object.freeze([
    'currentExperienceId',
    'experienceLanguage',
    'experienceTense',
    'experienceForm',
    'experienceQuestion',
    'experiencePerspective',
    'experienceChoiceCandidate',
    'experienceWordType',
    'experienceNounId',
    'experienceAdjectiveId',
    'lineOffset'
  ]);

  function captureResumeContext(state = {}) {
    if (!state || typeof state !== 'object') return null;
    if (typeof state.currentExperienceId !== 'string' || !state.currentExperienceId) return null;

    const snapshot = {};
    fields.forEach(field => {
      snapshot[field] = Object.prototype.hasOwnProperty.call(state, field) ? state[field] : null;
    });

    return Object.freeze(snapshot);
  }

  function evaluateResumeContext(snapshot = null, resumeEligibility = null) {
    if (!snapshot || !snapshot.currentExperienceId) return {
      status: 'RESUME_CONTEXT_UNAVAILABLE',
      reason: 'resume-context-snapshot-unavailable'
    };

    if (!resumeEligibility || resumeEligibility.status !== 'RESUME_ELIGIBLE') return {
      status: 'RESUME_CONTEXT_PRESERVED',
      reason: 'resume-not-yet-eligible',
      snapshot
    };

    if (resumeEligibility.experienceId !== snapshot.currentExperienceId) return {
      status: 'RESUME_CONTEXT_MISMATCH',
      reason: 'resume-eligibility-does-not-match-preserved-experience',
      snapshot
    };

    return {
      status: 'RESUME_CONTEXT_ELIGIBLE',
      reason: 'preserved-context-matches-resume-eligible-experience',
      scope: 'preserved-experience-context',
      snapshot
    };
  }

  return { fields, captureResumeContext, evaluateResumeContext };
});
