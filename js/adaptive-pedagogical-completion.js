(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptivePedagogicalCompletion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    PEDAGOGICAL_STATE_UNGROUNDED: 'PEDAGOGICAL_STATE_UNGROUNDED',
    PEDAGOGICAL_STATE_OBSERVED: 'PEDAGOGICAL_STATE_OBSERVED'
  });

  function ungrounded(reason, experienceId, skill) {
    return Object.freeze({
      status: statuses.PEDAGOGICAL_STATE_UNGROUNDED,
      reason,
      experienceId: experienceId || null,
      skill: skill || null
    });
  }

  function isWaitActive(waitState) {
    const state = waitState?.state || null;
    return state === 'INSPECTION_UNAVAILABLE' ||
      state === 'INSPECTED_AWAITING_OPPORTUNITY' ||
      state === 'OPPORTUNITY_FOUND_AWAITING_EVENT';
  }

  function isResumeActive(resumeState) {
    const eligibility = resumeState?.resumeEligibility || resumeState;
    return eligibility?.status === 'RESUME_ELIGIBLE';
  }

  function evaluatePedagogicalState(input = {}) {
    const session = input.session;
    const contractResult = input.contractResult || null;
    const pedagogicalDisposition = input.pedagogicalDisposition || null;
    const waitState = input.waitState || null;
    const resumeState = input.resumeState || null;
    const experienceId = session?.decision?.experienceId || null;
    const skill = session?.decision?.skill || null;

    if (!session || !session.decision || !experienceId) {
      return ungrounded('active-session-decision-unavailable', experienceId, skill);
    }

    if (pedagogicalDisposition && typeof pedagogicalDisposition === 'object') {
      if (pedagogicalDisposition.experienceId && pedagogicalDisposition.experienceId !== experienceId) {
        return ungrounded('pedagogical-disposition-not-grounded-in-active-experience', experienceId, skill);
      }

      if (skill && pedagogicalDisposition.skill && pedagogicalDisposition.skill !== skill) {
        return ungrounded('pedagogical-disposition-not-grounded-in-active-skill', experienceId, skill);
      }
    }

    const support = Object.freeze({
      contractSatisfied: contractResult?.status === 'GREEN_PASS' && contractResult?.satisfied === true,
      pedagogicalAction: pedagogicalDisposition?.action || null
    });

    const openConditions = Object.freeze({
      contractEvidencePending: !(contractResult?.status === 'GREEN_PASS' && contractResult?.satisfied === true),
      waitActive: isWaitActive(waitState),
      resumeActive: isResumeActive(resumeState)
    });

    return Object.freeze({
      status: statuses.PEDAGOGICAL_STATE_OBSERVED,
      reason: 'active-session-pedagogical-state-observed',
      experienceId,
      skill,
      support,
      openConditions
    });
  }

  return { statuses, evaluatePedagogicalState };
});
