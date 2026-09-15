(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveProgressionEligibility = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    PROGRESSION_NOT_ELIGIBLE: 'PROGRESSION_NOT_ELIGIBLE',
    PROGRESSION_ELIGIBLE: 'PROGRESSION_ELIGIBLE'
  });

  function notEligible(reason, experienceId, skill) {
    return Object.freeze({
      status: statuses.PROGRESSION_NOT_ELIGIBLE,
      reason,
      experienceId: experienceId || null,
      skill: skill || null
    });
  }

  function evaluateProgressionEligibility(input = {}) {
    const session = input.session;
    const pedagogicalResult = input.pedagogicalResult;
    const experienceId = session?.decision?.experienceId || null;
    const skill = session?.decision?.skill || null;

    if (!session || !session.decision || !experienceId) {
      return notEligible('active-session-decision-unavailable', experienceId, skill);
    }

    if (!pedagogicalResult || typeof pedagogicalResult !== 'object') {
      return notEligible('pedagogical-result-unavailable', experienceId, skill);
    }

    if (pedagogicalResult.experienceId !== experienceId) {
      return notEligible('pedagogical-result-not-grounded-in-active-experience', experienceId, skill);
    }

    if (skill && pedagogicalResult.skill !== skill) {
      return notEligible('pedagogical-result-not-grounded-in-active-skill', experienceId, skill);
    }

    if (pedagogicalResult.status !== 'PEDAGOGICAL_WORK_COMPLETE') {
      return notEligible('pedagogical-work-not-complete', experienceId, skill);
    }

    return Object.freeze({
      status: statuses.PROGRESSION_ELIGIBLE,
      reason: 'grounded-pedagogical-work-complete',
      experienceId,
      skill
    });
  }

  return { statuses, evaluateProgressionEligibility };
});
