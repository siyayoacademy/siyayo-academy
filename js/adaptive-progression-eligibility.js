(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveProgressionEligibility = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    CANDIDATE_UNGROUNDED: 'CANDIDATE_UNGROUNDED',
    CANDIDATE_GROUNDED: 'CANDIDATE_GROUNDED'
  });

  function result(status, reason, experienceId, skill, candidate) {
    return Object.freeze({
      status,
      reason,
      experienceId: experienceId || null,
      skill: skill || null,
      candidate: candidate || null
    });
  }

  // This boundary proves only that a read-only toroidal candidate belongs to
  // the active pedagogical Session. It does not complete work, offer NEXT,
  // authorize progression, create Decision2, or release the Session.
  function evaluateCandidateGrounding(input = {}) {
    const session = input.session;
    const candidate = input.candidate;
    const experienceId = session?.decision?.experienceId || null;
    const skill = session?.decision?.skill || null;

    if (!session || !session.decision || !experienceId) {
      return result(statuses.CANDIDATE_UNGROUNDED, 'active-session-decision-unavailable', experienceId, skill, null);
    }

    if (!candidate || typeof candidate !== 'object' || candidate.status !== 'candidate-resolved') {
      return result(statuses.CANDIDATE_UNGROUNDED, 'resolved-candidate-unavailable', experienceId, skill, null);
    }

    if (!candidate.fromExperience || candidate.fromExperience !== experienceId) {
      return result(statuses.CANDIDATE_UNGROUNDED, 'candidate-not-grounded-in-active-experience', experienceId, skill, null);
    }

    if (!candidate.experienceId || candidate.experienceId === experienceId) {
      return result(statuses.CANDIDATE_UNGROUNDED, 'candidate-destination-not-distinct', experienceId, skill, null);
    }

    return result(
      statuses.CANDIDATE_GROUNDED,
      'resolved-candidate-grounded-in-active-session',
      experienceId,
      skill,
      Object.freeze({
        experienceId: candidate.experienceId,
        fromExperience: candidate.fromExperience,
        entryVerb: candidate.entryVerb || null,
        title: candidate.title || null
      })
    );
  }

  return { statuses, evaluateCandidateGrounding };
});
