(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveConvergenceResolver = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    CONVERGENCE_UNRESOLVED: 'CONVERGENCE_UNRESOLVED',
    CANDIDATE_SUPPORTED_FOR_CONSIDERATION: 'CANDIDATE_SUPPORTED_FOR_CONSIDERATION'
  });

  function unresolved(reason, experienceId, skill, candidate, openConditions) {
    return Object.freeze({
      status: statuses.CONVERGENCE_UNRESOLVED,
      reason,
      experienceId: experienceId || null,
      skill: skill || null,
      candidate: candidate || null,
      openConditions: Object.freeze({ ...(openConditions || {}) })
    });
  }

  function resolve(input = {}) {
    const candidateGrounding = input.candidateGrounding;
    const pedagogicalState = input.pedagogicalState;

    if (!candidateGrounding || candidateGrounding.status !== 'CANDIDATE_GROUNDED') {
      return unresolved('grounded-candidate-unavailable');
    }

    const experienceId = candidateGrounding.experienceId || null;
    const skill = candidateGrounding.skill || null;
    const candidate = candidateGrounding.candidate || null;

    if (!pedagogicalState || pedagogicalState.status !== 'PEDAGOGICAL_STATE_OBSERVED') {
      return unresolved('grounded-pedagogical-state-unavailable', experienceId, skill, candidate);
    }

    if (pedagogicalState.experienceId !== experienceId) {
      return unresolved('pedagogical-state-not-grounded-in-candidate-source-experience', experienceId, skill, candidate, pedagogicalState.openConditions);
    }

    if (skill && pedagogicalState.skill !== skill) {
      return unresolved('pedagogical-state-not-grounded-in-candidate-source-skill', experienceId, skill, candidate, pedagogicalState.openConditions);
    }

    const openConditions = Object.freeze({ ...(pedagogicalState.openConditions || {}) });
    const support = Object.freeze({ ...(pedagogicalState.support || {}) });

    if (support.contractSatisfied !== true) {
      return unresolved('contract-evidence-still-open', experienceId, skill, candidate, openConditions);
    }

    if (openConditions.waitActive || openConditions.resumeActive || openConditions.contractEvidencePending) {
      return unresolved('pedagogical-conditions-still-open', experienceId, skill, candidate, openConditions);
    }

    return Object.freeze({
      status: statuses.CANDIDATE_SUPPORTED_FOR_CONSIDERATION,
      reason: 'grounded-candidate-and-observed-pedagogical-support-converge',
      experienceId,
      skill,
      candidate,
      support,
      openConditions
    });
  }

  return Object.freeze({ statuses, resolve });
});
