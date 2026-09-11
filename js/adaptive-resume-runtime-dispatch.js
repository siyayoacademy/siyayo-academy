(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveResumeRuntimeDispatch = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const statuses = Object.freeze({
    NOT_DISPATCHED: 'RESUME_NOT_DISPATCHED',
    DISPATCHED: 'RESUME_DISPATCHED'
  });

  function dispatch(cycleResult = null, runtime = null) {
    const resumeEvaluation = cycleResult && cycleResult.resumeEvaluation;
    const resumeContext = resumeEvaluation && resumeEvaluation.resumeContext;

    if (!resumeContext || resumeContext.status !== 'RESUME_CONTEXT_ELIGIBLE') return {
      status: statuses.NOT_DISPATCHED,
      reason: 'resume-context-not-eligible'
    };

    if (!runtime || typeof runtime.execute !== 'function') return {
      status: statuses.NOT_DISPATCHED,
      reason: 'resume-runtime-unavailable'
    };

    const execution = runtime.execute(resumeContext);
    if (!execution || execution.status !== 'RESUME_EXECUTED') return {
      status: statuses.NOT_DISPATCHED,
      reason: 'resume-runtime-execution-not-confirmed',
      execution: execution || null
    };

    return {
      status: statuses.DISPATCHED,
      reason: 'eligible-cycle-resume-dispatched',
      experienceId: execution.experienceId || resumeContext.snapshot?.currentExperienceId || null,
      execution
    };
  }

  return { statuses, dispatch };
});
