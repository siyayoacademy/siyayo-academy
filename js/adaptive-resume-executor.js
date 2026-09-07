(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveResumeExecutor = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    RESUME_NOT_EXECUTED: 'RESUME_NOT_EXECUTED',
    RESUME_EXECUTED: 'RESUME_EXECUTED'
  });

  function executeResume(resumeContext = null, runtime = null) {
    if (!resumeContext || resumeContext.status !== 'RESUME_CONTEXT_ELIGIBLE') return {
      status: statuses.RESUME_NOT_EXECUTED,
      reason: 'resume-context-not-eligible'
    };

    if (!runtime || typeof runtime.restoreContext !== 'function') return {
      status: statuses.RESUME_NOT_EXECUTED,
      reason: 'resume-runtime-restore-unavailable'
    };

    const snapshot = resumeContext.snapshot;
    if (!snapshot || !snapshot.currentExperienceId) return {
      status: statuses.RESUME_NOT_EXECUTED,
      reason: 'resume-context-snapshot-unavailable'
    };

    const restored = runtime.restoreContext(snapshot);
    if (restored !== true) return {
      status: statuses.RESUME_NOT_EXECUTED,
      reason: 'resume-runtime-restore-not-confirmed'
    };

    return {
      status: statuses.RESUME_EXECUTED,
      reason: 'preserved-context-restored',
      experienceId: snapshot.currentExperienceId,
      scope: 'preserved-experience-context'
    };
  }

  return { statuses, executeResume };
});
