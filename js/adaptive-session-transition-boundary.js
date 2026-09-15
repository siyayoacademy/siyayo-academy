(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AdaptiveSessionTransitionBoundary = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function text(value) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
  }

  function authorize(input = {}) {
    const currentSession = input.currentSession;
    const nextDecision = input.nextDecision;

    if (!currentSession || !currentSession.decision) return null;
    if (!nextDecision || typeof nextDecision !== 'object') return null;

    const fromExperience = text(currentSession.decision.experienceId);
    const toExperience = text(nextDecision.experienceId);
    if (!fromExperience || !toExperience || fromExperience === toExperience) return null;

    const currentSkill = text(currentSession.decision.skill);
    const nextSkill = text(nextDecision.skill);
    if (currentSkill && !nextSkill) return null;

    return Object.freeze({
      status: 'transition-authorized',
      fromExperience,
      toExperience,
      nextDecision
    });
  }

  return { authorize };
});
