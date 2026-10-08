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
    const advanceSelection = input.advanceSelection;
    const nextDecision = input.nextDecision;

    if (!currentSession || !currentSession.decision) return null;
    if (!advanceSelection || typeof advanceSelection !== 'object') return null;
    if (advanceSelection.action !== 'advance' || advanceSelection.status !== 'selected') return null;
    if (!nextDecision || typeof nextDecision !== 'object' || nextDecision.action !== 'advance') return null;

    const fromExperience = text(currentSession.decision.experienceId);
    const selectedFrom = text(advanceSelection.fromExperience);
    const selectedTo = text(advanceSelection.experienceId);
    const toExperience = text(nextDecision.experienceId);
    if (!fromExperience || !selectedFrom || !selectedTo || !toExperience) return null;
    if (selectedFrom !== fromExperience) return null;
    if (selectedTo !== toExperience || fromExperience === toExperience) return null;

    const currentSkill = text(currentSession.decision.skill);
    const nextSkill = text(nextDecision.skill);
    if (currentSkill && !nextSkill) return null;

    return Object.freeze({
      status: 'transition-authorized',
      fromExperience,
      toExperience,
      advanceSelection,
      nextDecision
    });
  }

  return { authorize };
});
