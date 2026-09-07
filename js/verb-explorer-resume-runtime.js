(function (root) {
  const fields = [
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
  ];

  function captureContext() {
    return {
      currentExperienceId,
      experienceLanguage,
      experienceTense,
      experienceForm,
      experienceQuestion,
      experiencePerspective,
      experienceChoiceCandidate,
      experienceWordType,
      experienceNounId,
      experienceAdjectiveId,
      lineOffset
    };
  }

  function contextsMatch(expected, actual) {
    return fields.every(field => Object.is(expected[field], actual[field]));
  }

  function restoreContext(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return false;
    if (typeof snapshot.currentExperienceId !== 'string' || !snapshot.currentExperienceId) return false;
    if (!experiences.some(item => item.id === snapshot.currentExperienceId)) return false;

    currentExperienceId = snapshot.currentExperienceId;
    experienceLanguage = snapshot.experienceLanguage;
    experienceTense = snapshot.experienceTense;
    experienceForm = snapshot.experienceForm;
    experienceQuestion = snapshot.experienceQuestion;
    experiencePerspective = snapshot.experiencePerspective;
    experienceChoiceCandidate = snapshot.experienceChoiceCandidate;
    experienceWordType = snapshot.experienceWordType;
    experienceNounId = snapshot.experienceNounId;
    experienceAdjectiveId = snapshot.experienceAdjectiveId;
    lineOffset = snapshot.lineOffset;

    renderExperience();
    return contextsMatch(snapshot, captureContext());
  }

  function execute(resumeContext) {
    if (!root.AdaptiveResumeExecutor || typeof root.AdaptiveResumeExecutor.executeResume !== 'function') {
      return null;
    }
    return root.AdaptiveResumeExecutor.executeResume(resumeContext, { restoreContext });
  }

  root.SIYAYOVerbExplorerResumeRuntime = Object.freeze({
    fields: Object.freeze(fields.slice()),
    captureContext,
    restoreContext,
    execute
  });
})(typeof globalThis !== 'undefined' ? globalThis : this);
