(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptivePedagogicalCompletion = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    PEDAGOGICAL_WORK_PENDING: 'PEDAGOGICAL_WORK_PENDING',
    PEDAGOGICAL_WORK_COMPLETE: 'PEDAGOGICAL_WORK_COMPLETE'
  });

  function pending(reason, experienceId, skill) {
    return Object.freeze({
      status: statuses.PEDAGOGICAL_WORK_PENDING,
      reason,
      experienceId: experienceId || null,
      skill: skill || null
    });
  }

  function evaluatePedagogicalCompletion(input = {}) {
    const session = input.session;
    const contractResult = input.contractResult;
    const pedagogicalDisposition = input.pedagogicalDisposition;
    const waitState = input.waitState || null;
    const resumeState = input.resumeState || null;
    const experienceId = session?.decision?.experienceId || null;
    const skill = session?.decision?.skill || null;

    if (!session || !session.decision || !experienceId) {
      return pending('active-session-decision-unavailable', experienceId, skill);
    }

    if (!contractResult || contractResult.status !== 'GREEN_PASS' || contractResult.satisfied !== true) {
      return pending('green-pass-contract-not-satisfied', experienceId, skill);
    }

    if (waitState) {
      return pending('wait-state-still-active', experienceId, skill);
    }

    if (resumeState) {
      return pending('resume-state-still-active', experienceId, skill);
    }

    if (!pedagogicalDisposition || typeof pedagogicalDisposition !== 'object') {
      return pending('pedagogical-disposition-unavailable', experienceId, skill);
    }

    if (pedagogicalDisposition.experienceId !== experienceId) {
      return pending('pedagogical-disposition-not-grounded-in-active-experience', experienceId, skill);
    }

    if (skill && pedagogicalDisposition.skill !== skill) {
      return pending('pedagogical-disposition-not-grounded-in-active-skill', experienceId, skill);
    }

    if (pedagogicalDisposition.action !== 'complete') {
      return pending('pedagogical-disposition-does-not-complete-work', experienceId, skill);
    }

    return Object.freeze({
      status: statuses.PEDAGOGICAL_WORK_COMPLETE,
      reason: 'contract-satisfied-and-pedagogical-work-explicitly-complete',
      experienceId,
      skill
    });
  }

  return { statuses, evaluatePedagogicalCompletion };
});
